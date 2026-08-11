const fs=require('fs');const {JSDOM}=require('jsdom');const err=[];const dits=[];
const dom=new JSDOM(fs.readFileSync('/tmp/reel.html','utf8'),{
 runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',
 beforeParse(w){
  w.HTMLMediaElement.prototype.play=()=>Promise.resolve();
  w.HTMLMediaElement.prototype.pause=()=>{};w.confirm=()=>true;w.alert=()=>{};
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
  w.SpeechSynthesisUtterance=function(t){this.text=t;};
  w.speechSynthesis={speaking:false,pending:false,speak(u){if(u.text)dits.push(u.text);},
   cancel(){},getVoices(){return[{name:'Amélie',lang:'fr-FR',localService:true}];},
   addEventListener(){},removeEventListener(){}};
  w.addEventListener('error',e=>err.push('error: '+(e.error?e.error.message:e.message)));
 }});
const w=dom.window,d=w.document;
process.on('uncaughtException',e=>err.push('uncaught: '+e.message));
process.on('unhandledRejection',e=>err.push('rejet: '+(e&&e.message||e)));
const at=ms=>new Promise(r=>setTimeout(r,ms));
const clic=s=>{const e=typeof s==='string'?d.querySelector(s):s;if(!e)return null;
 e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));return e;};
(async()=>{
 await at(500);
 clic('#start-audio-btn'); await at(1000);
 clic('#start-btn'); await at(300); clic('.choose-btn[data-proto="Didi"]'); await at(300);
 d.querySelector('#profile-name').value='Khadi'; clic('#start-destiny-btn'); await at(1600);
 console.log('1. cinématique lancée :', !!d.querySelector('.cine-scene'));
 console.log('   HUD masqué :', d.getElementById('game-hud').style.display==='none');
 const plans=[];
 for(let i=0;i<8;i++){
   const p=d.querySelector('.cine-plan');
   if(!p) break;
   plans.push({decor:p.querySelector('.cine-decor').getAttribute('src'),
               cam:p.getAttribute('data-camera'),
               perso:d.querySelectorAll('.cine-perso').length,
               choix:d.querySelectorAll('[data-cine-choix]').length});
   const ch=d.querySelector('[data-cine-choix]');
   if(ch){ clic(ch); } else { clic(p); }
   await at(700);
 }
 console.log('\n2. plans joués :');
 plans.forEach(function(p,i){console.log('   '+(i+1)+'. '+String(p.decor).padEnd(32)+'cam '+String(p.cam).padEnd(8)+p.perso+' perso '+(p.choix?p.choix+' choix':''));});
 await at(5200);
 console.log('\n3. après la cinématique :');
 console.log('   HUD rétabli :', d.getElementById('game-hud').style.display==='');
 console.log('   dilemme affiché :', d.querySelectorAll('#dilemma-container .choice-btn').length>0);
 console.log('   mémoire "demande_faite" :', w.state? w.state.progress.memories.demande_faite : '?');
 console.log('   lien au conjoint :', w.state? w.state.progress.characters.partner.relationship : '?');
 console.log('\n4. textes lus :', dits.length);
 dits.slice(0,3).forEach((t,i)=>console.log('   '+(i+1)+' : '+JSON.stringify(t.slice(0,78))));
 console.log('\nerreurs :', err.length? err.slice(0,3):'aucune');
})();
