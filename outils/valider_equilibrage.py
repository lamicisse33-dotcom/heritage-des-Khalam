#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rejoue des milliers de parties sur la logique réelle et publie le bilan."""
import io, re, json, subprocess

MOD = '/home/claude/plat/'
def load(p):
    s = io.open(MOD + p, encoding='utf-8').read()
    s = re.sub(r"^import\s+[\s\S]*?from\s+'[^']+';\s*$", '', s, flags=re.M)
    return re.sub(r"^export\s+", '', s, flags=re.M)

HARNAIS = r"""
// checkAchievements() sauvegarde ; hors navigateur on fournit un stockage nul.
const localStorage = { getItem:()=>null, setItem:()=>{}, removeItem:()=>{} };
const N = 4000;
const P = ['spirituality','love','health','argent'];
const anomalies = new Set();

function neuf() {
  state.progress = {
    chapterIndex:0, eventIndex:0,
    stats:{spirituality:50,love:50,health:50,argent:50},
    traits:{ambition:0,compassion:0,prudence:0,courage:0,generosity:0,patience:0,resilience:0,honesty:0},
    decisions:[],completedEvents:[],memories:{},reputation:[],chronology:[],
    unlockedIllustrations:[],unlockedLore:[],
    balance:{score:100,level:'x',status:'stable'},
    characters:{
      partner:{relationship:50,trust:50,complicity:50,respect:50,influence:50,communication:50,commitment:50,disagreements:0},
      child:{relationship:50,active:false}, friend:{relationship:60}, manager:{relationship:40},
      doctor:{relationship:50,active:false}, mentor:{relationship:80,active:false}
    }
  };
  state.meta = {livesCount:0,unlockedEnds:[],unlockedAchievements:[],
    hallOfBalance:{trophies:[],globalStats:{totalSpir:0,totalLove:0,totalHealth:0,totalArgent:0}},lifeHistory:[]};
}

function appliquer(c) {
  if (c.effects) for (const [k,v] of Object.entries(c.effects)) {
    if (state.progress.stats[k]===undefined) { anomalies.add('effet inconnu: '+k); continue; }
    state.progress.stats[k] = Math.max(0, Math.min(100, state.progress.stats[k]+v));
  }
  if (c.traits) for (const [k,v] of Object.entries(c.traits)) {
    if (state.progress.traits[k]===undefined) anomalies.add('trait inconnu: '+k);
    state.progress.traits[k]=(state.progress.traits[k]||0)+v;
  }
  if (c.relationships) for (const [k,v] of Object.entries(c.relationships)) {
    const ch=state.progress.characters[k];
    if (!ch) { anomalies.add('personnage inconnu: '+k); continue; }
    ch.relationship=Math.max(0,Math.min(100,ch.relationship+v));
  }
  if (c.memories) for (const [k,v] of Object.entries(c.memories)) state.progress.memories[k]=v;
  state.progress.decisions.push(c.id);
}

/** Le joueur réel : ne perçoit que les cinq états, ignore les valeurs, hésite. */
function choixAvise(dispo) {
  const cran = v => Math.min(4, Math.max(0, Math.floor(v/20)));
  const percu = {}; P.forEach(p=>percu[p]=cran(state.progress.stats[p]));
  const faible = P.reduce((a,b)=>percu[a]<=percu[b]?a:b);
  const intens = v => v>0 ? (Math.abs(v)>=7?2:1) : (v<0 ? (Math.abs(v)>=7?-2:-1) : 0);
  let best=null, bs=-Infinity;
  for (const c of dispo) {
    const e=c.effects||{};
    let sc = intens(e[faible]||0)*3;
    for (const p of P) if (p!==faible && percu[p]>=3) sc -= Math.max(0,intens(e[p]||0))*0.6;
    for (const p of P) if (p!==faible && percu[p]<=1) sc += intens(e[p]||0)*1.2;
    sc += (Math.random()-0.5)*0.8;
    if (sc>bs){bs=sc;best=c;}
  }
  return best;
}

function jouer(strat) {
  neuf();
  let ev=getCurrentEvent(), garde=0, chapPrec=0, evts=0, usures=0;
  while (ev && garde++<200) {
    const dispo = ev.choices.filter(c=>!c.conditions||c.conditions(state));
    if (!dispo.length) { anomalies.add('evenement sans choix: '+ev.id); break; }
    let c;
    if (strat==='hasard') c = dispo[Math.floor(Math.random()*dispo.length)];
    else if (strat==='mono') c = dispo.reduce((a,b)=>((b.effects&&b.effects.argent)||-99)>((a.effects&&a.effects.argent)||-99)?b:a);
    else c = choixAvise(dispo);
    appliquer(c);
    state.progress.chronology.push({chapterIndex:state.progress.chapterIndex, eventId:ev.id});
    calculateBalance();
    activerPersonnages();
    checkAchievements();
    evts++;
    ev = advanceStory();
    if (state.progress.chapterIndex !== chapPrec) {
      appliquerUsure(); calculateBalance();
      chapPrec = state.progress.chapterIndex; usures++;
    }
  }
  if (garde>=200) anomalies.add('partie non terminee');
  const b = evaluateLifePath();
  const ch = state.progress.chronology;
  const rel = {};
  for (const k of Object.keys(state.progress.characters)) rel[k] = state.progress.characters[k].relationship;
  const actifs = Object.keys(state.progress.characters).filter(k => state.progress.characters[k].active !== false);
  return { evts, usures, rel, actifs, niveau: state.progress.balance.level, titre: b.titre,
           fin: ch.length?ch[ch.length-1].eventId:'?',
           stats: P.map(p=>state.progress.stats[p]),
           sature: P.some(p=>state.progress.stats[p]>=100),
           effondre: P.some(p=>state.progress.stats[p]<=0),
           faible: b.weakestStat, dominant: b.dominantStat,
           faits: state.meta.unlockedAchievements.length,
           traits: state.progress.traits };
}

const out = {};
for (const s of ['avise','hasard','mono']) {
  const l=[]; for(let i=0;i<N;i++) l.push(jouer(s));
  const cpt = (f)=>{const m={};for(const r of l){const k=f(r);m[k]=(m[k]||0)+1;}return m;};
  const moy = f=>l.reduce((a,r)=>a+f(r),0)/l.length;
  const pct = f=>100*l.filter(f).length/l.length;
  out[s]={
    evts:+moy(r=>r.evts).toFixed(1), usures:+moy(r=>r.usures).toFixed(1),
    niveaux:cpt(r=>r.niveau), fins:cpt(r=>r.fin), faibles:cpt(r=>r.faible),
    sature:+pct(r=>r.sature).toFixed(0), effondre:+pct(r=>r.effondre).toFixed(0),
    faits:+moy(r=>r.faits).toFixed(1),
    piliers:[0,1,2,3].map(i=>Math.round(moy(r=>r.stats[i]))),
    rel:['partner','manager','mentor','friend','doctor'].reduce((a,k)=>{
      const t=l.map(r=>r.rel[k]).sort((x,y)=>x-y);
      a[k]=[10,25,50,75,90].map(q=>t[Math.floor(q/100*t.length)]).concat([+ (100*l.filter(r=>r.rel[k]>=100).length/l.length).toFixed(0)]);
      return a;},{}),
    actifs:['doctor','mentor','child'].reduce((a,k)=>{a[k]=+pct(r=>r.actifs.includes(k)).toFixed(0);return a;},{}),
    tr:['ambition','courage','generosity','compassion','honesty','prudence','resilience','patience']
        .reduce((a,t)=>{const v=l.map(r=>r.traits[t]).sort((x,y)=>x-y);
          a[t]=[v[Math.floor(0.25*v.length)],v[Math.floor(0.5*v.length)],v[Math.floor(0.75*v.length)]];return a;},{})
  };
}
console.log(JSON.stringify({out, anomalies:[...anomalies], N}));
"""

js = load('config.js') + load('state.js') + load('story.js') + HARNAIS
io.open('/tmp/final.js','w',encoding='utf-8').write(js)
r = subprocess.run(['node','/tmp/final.js'], capture_output=True, text=True)
if r.returncode:
    print(r.stderr[:1200]); raise SystemExit(1)
d = json.loads(r.stdout.strip().split('\n')[-1])
o, N = d['out'], d['N']

NIV = ['Harmonie profonde','Équilibre stable','Équilibre fragile','Déséquilibre important','Rupture']
NOMS = {'avise':'joueur avisé','hasard':'au hasard','mono':'monomaniaque'}

print("=" * 74)
print("VALIDATION DE L'ÉQUILIBRAGE — %d parties par stratégie, logique réelle" % N)
print("=" * 74)
print("\nVERDICT DE LA BALANCE")
print("  stratégie        " + "".join(n[:9].rjust(11) for n in NIV))
for s in ['avise','hasard','mono']:
    ligne = "  %-16s" % NOMS[s]
    for n in NIV:
        ligne += ("%d %%" % round(100*o[s]['niveaux'].get(n,0)/N)).rjust(11)
    print(ligne)

print("\nSANTÉ DU BARÈME")
for s in ['avise','hasard','mono']:
    print("  %-16s piliers finaux %-22s saturation %2d %%   effondrement %2d %%"
          % (NOMS[s], str(o[s]['piliers']), o[s]['sature'], o[s]['effondre']))

print("\nFINS ATTEINTES (joueur avisé)")
for k, v in sorted(o['avise']['fins'].items(), key=lambda x: -x[1]):
    print("  %-26s %3d %%  %s" % (k.replace('ch10_legacy_',''), round(100*v/N), '#'*round(100*v/N/2.5)))

print("\nPILIER NÉGLIGÉ (joueur avisé)")
for k, v in sorted(o['avise']['faibles'].items(), key=lambda x: -x[1]):
    print("  %-16s %3d %%" % (k, round(100*v/N)))

print("\nRELATIONS EN FIN DE VIE (joueur avisé)")
print("  %-10s %s" % ("", "p10  p25  p50  p75  p90   saturés"))
for k, v in o['avise']['rel'].items():
    print("  %-10s %s   %3d %%" % (k, "".join("%4d " % x for x in v[:5]), v[5]))
print("\nPERSONNAGES ENTRÉS EN SCÈNE (%% des parties)")
for k, v in o['avise']['actifs'].items():
    print("  %-10s %3d %%" % (k, v))
print("\nAUTRES")
print("  événements par partie : %.1f | usures subies : %.1f" % (o['avise']['evts'], o['avise']['usures']))
print("  hauts faits débloqués : avisé %.1f | hasard %.1f | monomaniaque %.1f"
      % (o['avise']['faits'], o['hasard']['faits'], o['mono']['faits']))
print("\nTRAITS (joueur avisé, quartiles 25/50/75)")
for t, q in o['avise']['tr'].items():
    print("  %-12s %s" % (t, q))
print("\n" + ("ANOMALIES : " + ", ".join(d['anomalies']) if d['anomalies'] else "AUCUNE ANOMALIE DE DONNÉES."))
