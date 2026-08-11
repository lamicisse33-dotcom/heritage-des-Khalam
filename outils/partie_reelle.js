/* Partie complète sur le bundle à modules réels — celui qui a révélé la faute. */
const fs=require('fs');const {JSDOM}=require('jsdom');const err=[];
const dom=new JSDOM(fs.readFileSync('/tmp/reel.html','utf8'),{
 runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',
 beforeParse(w){
  w.HTMLMediaElement.prototype.play=()=>Promise.resolve();
  w.HTMLMediaElement.prototype.pause=()=>{};w.confirm=()=>true;w.alert=()=>{};
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
  w.addEventListener('error',e=>err.push('error: '+(e.error?e.error.message:e.message)));
  const ce=w.console.error;w.console.error=(...a)=>{err.push('console: '+a.join(' '));ce(...a);};
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
 d.querySelector('#profile-name').value='Khadi'; clic('#start-destiny-btn'); await at(6200);
 console.log('1. écran de jeu :', d.querySelector('.screen.active')?.id);
 // Franchir le prologue : la cinématique n'utilise pas les mêmes boutons.
 let cine=0;
 for(let i=0;i<12;i++){
   const c=d.querySelector('[data-cine-choix]');
   const p=d.querySelector('.cine-plan');
   if(c){clic(c);cine++;await at(700);continue;}
   if(p){clic(p);cine++;await at(700);continue;}
   break;
 }
 console.log('1b. plans de prologue franchis :', cine);
 await at(5200);
 let ev=0,ch=0,g=0;
 const toasts=[];
 new w.MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{
   if(n.className&&String(n.className).includes('achievement-toast')) toasts.push(1);})))
   .observe(d.body,{childList:true,subtree:true});
 while(g++<90){
  const c=[...d.querySelectorAll('#dilemma-container .choice-btn')];
  if(c.length){clic(c[Math.floor(Math.random()*c.length)]);ev++;await at(25);
    const k=d.querySelector('#continue-path-btn');if(k){clic(k);await at(25);}continue;}
  const n=d.querySelector('#next-chapter-btn');if(n){ch++;clic(n);await at(4300);continue;}
  if(d.querySelector('#fin-new-btn'))break;
  const k=d.querySelector('#continue-path-btn');if(k){clic(k);await at(25);continue;}
  break;}
 console.log('2. partie jouée : %d événements, %d chapitres', ev, ch);
 console.log('3. hauts faits affichés :', toasts.length, toasts.length? '(le cas qui plantait)' : '');
 const fin=d.querySelector('.fin-titre');
 console.log('4. écran de fin :', fin? fin.textContent : 'NON ATTEINT');
 clic('#fin-new-btn'); await at(400);
 clic('.choose-btn[data-proto="Mila"]'); await at(300);
 d.querySelector('#profile-name').value='L'; clic('#start-destiny-btn'); await at(6200);
 console.log('5. deuxième vie :', d.querySelectorAll('#dilemma-container .choice-btn').length? 'dilemme affiché':'ÉCHEC');
 console.log('\nerreurs :', err.length? err.slice(0,3) : 'aucune');
})();
