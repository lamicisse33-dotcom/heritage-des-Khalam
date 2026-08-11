#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ajuste les gains de chaque pilier pour que les quatre convergent chez un joueur
attentif, en utilisant la simulation comme fonction objectif.

Le raisonnement analytique ne suffisait pas : le budget net d'un pilier ne dit
pas ce que le joueur accumule réellement, parce qu'il ne choisit qu'une option
par scène et encaisse les effets secondaires qui l'accompagnent. La Spiritualité
montait passivement dans les 30 événements, l'Argent devait être visé
activement. Seule la mesure tranche.
"""
import io, re, json, subprocess

MOD = '/home/claude/v2/modules/'
P = ['spirituality', 'love', 'health', 'argent']

def load(p):
    s = io.open(MOD + p, encoding='utf-8').read()
    s = re.sub(r"^import\s+[\s\S]*?from\s+'[^']+';\s*$", '', s, flags=re.M)
    return re.sub(r"^export\s+", '', s, flags=re.M)

BASE = load('config.js') + load('state.js') + load('story.js')

HARNAIS = r"""
const localStorage = { getItem:()=>null, setItem:()=>{}, removeItem:()=>{} };
const MULT = __MULT__;
const N = __N__;
const P = ['spirituality','love','health','argent'];

for (const ch of STORY_DATA.chapters) for (const ev of ch.events) for (const c of ev.choices) {
  if (!c.effects) continue;
  for (const k of Object.keys(c.effects)) {
    if (!P.includes(k) || c.effects[k] <= 0) continue;
    c.effects[k] = Math.max(1, Math.round(c.effects[k] * MULT[k]));
  }
}

function neuf(){state.progress={chapterIndex:0,eventIndex:0,
 stats:{spirituality:50,love:50,health:50,argent:50},
 traits:{ambition:0,compassion:0,prudence:0,courage:0,generosity:0,patience:0,resilience:0,honesty:0},
 decisions:[],completedEvents:[],memories:{},reputation:[],chronology:[],
 unlockedIllustrations:[],unlockedLore:[],balance:{score:100,level:'x',status:'stable'},
 characters:{partner:{relationship:50,trust:50,complicity:50,respect:50,influence:50,communication:50,commitment:50,disagreements:0},
 child:{relationship:50,active:false},friend:{relationship:60},manager:{relationship:40},
 doctor:{relationship:50,active:false},mentor:{relationship:80,active:false}}};
 state.meta={livesCount:0,unlockedEnds:[],unlockedAchievements:[],
 hallOfBalance:{trophies:[],globalStats:{totalSpir:0,totalLove:0,totalHealth:0,totalArgent:0}},lifeHistory:[]};}

function appliquer(c){
 if(c.effects)for(const[k,v]of Object.entries(c.effects)){if(state.progress.stats[k]===undefined)continue;
  state.progress.stats[k]=Math.max(0,Math.min(100,state.progress.stats[k]+v));}
 if(c.traits)for(const[k,v]of Object.entries(c.traits))state.progress.traits[k]=(state.progress.traits[k]||0)+v;
 if(c.relationships)for(const[k,v]of Object.entries(c.relationships)){const ch=state.progress.characters[k];
  if(ch)ch.relationship=Math.max(0,Math.min(100,ch.relationship+v));}
 if(c.memories)for(const[k,v]of Object.entries(c.memories))state.progress.memories[k]=v;
 state.progress.decisions.push(c.id);}

function choixAvise(dispo){
 const cran=v=>Math.min(4,Math.max(0,Math.floor(v/20)));
 const percu={};P.forEach(p=>percu[p]=cran(state.progress.stats[p]));
 const faible=P.reduce((a,b)=>percu[a]<=percu[b]?a:b);
 const it=v=>v>0?(Math.abs(v)>=7?2:1):(v<0?(Math.abs(v)>=7?-2:-1):0);
 let best=null,bs=-Infinity;
 for(const c of dispo){const e=c.effects||{};
  let sc=it(e[faible]||0)*3;
  for(const p of P)if(p!==faible&&percu[p]>=3)sc-=Math.max(0,it(e[p]||0))*0.6;
  for(const p of P)if(p!==faible&&percu[p]<=1)sc+=it(e[p]||0)*1.2;
  sc+=(Math.random()-0.5)*0.8; if(sc>bs){bs=sc;best=c;}}
 return best;}

function jouer(strat){neuf();let ev=getCurrentEvent(),g=0,cp=0;
 while(ev&&g++<200){const d=ev.choices.filter(c=>!c.conditions||c.conditions(state));
  if(!d.length)break;
  let c; if(strat==='hasard')c=d[Math.floor(Math.random()*d.length)];
  else if(strat==='mono')c=d.reduce((a,b)=>((b.effects&&b.effects.argent)||-99)>((a.effects&&a.effects.argent)||-99)?b:a);
  else c=choixAvise(d);
  appliquer(c);state.progress.chronology.push({chapterIndex:state.progress.chapterIndex,eventId:ev.id});
  calculateBalance();ev=advanceStory();
  if(state.progress.chapterIndex!==cp){appliquerUsure();calculateBalance();cp=state.progress.chapterIndex;}}
 const ch=state.progress.chronology;
 return{niveau:state.progress.balance.level,stats:P.map(p=>state.progress.stats[p]),
  fin:ch.length?ch[ch.length-1].eventId:'?',
  sature:P.some(p=>state.progress.stats[p]>=100),effondre:P.some(p=>state.progress.stats[p]<=0)};}

const out={};
for(const s of ['avise','hasard','mono']){const l=[];for(let i=0;i<N;i++)l.push(jouer(s));
 const moy=f=>l.reduce((a,r)=>a+f(r),0)/l.length, pct=f=>100*l.filter(f).length/l.length;
 const cpt=f=>{const m={};for(const r of l){const k=f(r);m[k]=(m[k]||0)+1;}return m;};
 out[s]={piliers:[0,1,2,3].map(i=>+moy(r=>r.stats[i]).toFixed(1)),
  harmonie:+pct(r=>r.niveau==='Harmonie profonde').toFixed(1),
  rupture:+pct(r=>r.niveau==='Rupture').toFixed(1),
  sature:+pct(r=>r.sature).toFixed(1),effondre:+pct(r=>r.effondre).toFixed(1),
  niveaux:cpt(r=>r.niveau),fins:cpt(r=>r.fin),n:N};}
console.log(JSON.stringify(out));
"""

def mesurer(mult, n=700):
    js = BASE + HARNAIS.replace('__MULT__', json.dumps(mult)).replace('__N__', str(n))
    io.open('/tmp/opt.js', 'w', encoding='utf-8').write(js)
    r = subprocess.run(['node', '/tmp/opt.js'], capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[:800]); raise SystemExit(1)
    return json.loads(r.stdout.strip().split('\n')[-1])

def cout(r):
    """Objectif : les quatre piliers convergent vers ~70 chez l'avisé, sans
    saturation, le hasard reste dispersé et le monomaniaque échoue."""
    a = r['avise']
    pil = a['piliers']
    ecart = max(pil) - min(pil)
    c = 0.0
    c += ecart * 3.0                                  # convergence des piliers
    c += abs(sum(pil) / 4 - 70) * 2.0                 # niveau d'épanouissement visé
    c += a['sature'] * 4.0                            # jamais de plafond
    c += abs(a['harmonie'] - 25) * 1.2                # Harmonie rare mais atteignable
    c += max(0, r['hasard']['harmonie'] - 7) * 2.5    # le hasard ne doit pas y arriver
    c += max(0, 95 - r['mono']['rupture']) * 1.5      # le monomaniaque échoue
    return c

if __name__ == '__main__':
    mult = {p: 1.0 for p in P}
    meilleur = mesurer(mult)
    base = cout(meilleur)
    print("départ  multiplicateurs %s" % {k: round(v,3) for k,v in mult.items()})
    print("        piliers %s  Harmonie %.1f%%  coût %.1f"
          % (meilleur['avise']['piliers'], meilleur['avise']['harmonie'], base))

    pas = 0.18
    for tour in range(5):
        ameliore = False
        for p in P:
            for sens in (+1, -1):
                essai = dict(mult)
                essai[p] = round(max(0.25, min(3.0, essai[p] * (1 + sens*pas))), 3)
                r = mesurer(essai)
                c = cout(r)
                if c < base - 0.5:
                    base, mult, meilleur, ameliore = c, essai, r, True
                    print("  tour %d  %-13s x%.3f -> piliers %s  Harmonie %.1f%%  coût %.1f"
                          % (tour+1, p, essai[p], r['avise']['piliers'], r['avise']['harmonie'], c))
                    break
        pas *= 0.65
        if not ameliore:
            print("  tour %d : aucun gain, pas réduit à %.3f" % (tour+1, pas))
    print("\nMULTIPLICATEURS RETENUS : %s" % {k: round(v,3) for k,v in mult.items()})
    io.open('/tmp/mult.json','w').write(json.dumps(mult))
    r = mesurer(mult, n=3000)
    a = r['avise']
    print("\nconfirmation sur 3000 parties :")
    print("  avisé   piliers %s  écart %.1f  Harmonie %.1f%%  saturation %.1f%%"
          % (a['piliers'], max(a['piliers'])-min(a['piliers']), a['harmonie'], a['sature']))
    print("  hasard  piliers %s  Harmonie %.1f%%  Rupture %.1f%%"
          % (r['hasard']['piliers'], r['hasard']['harmonie'], r['hasard']['rupture']))
    print("  mono    Rupture %.1f%%" % r['mono']['rupture'])
