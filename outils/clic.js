const fs=require('fs');const {JSDOM}=require('jsdom');
const err=[];
const dom=new JSDOM(fs.readFileSync('/tmp/reel.html','utf8'),{
 runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',
 beforeParse(w){
  w.HTMLMediaElement.prototype.play=()=>Promise.resolve();
  w.HTMLMediaElement.prototype.pause=()=>{};
  w.confirm=()=>true;w.alert=()=>{};
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
  // Pas de synthèse vocale : comme sur un appareil qui n'en a pas.
  w.addEventListener('error',e=>err.push('window.error: '+(e.error?e.error.stack:e.message)));
  const ce=w.console.error; w.console.error=(...a)=>{err.push('console.error: '+a.join(' '));ce(...a);};
 }});
const w=dom.window,d=w.document;
process.on('uncaughtException',e=>err.push('uncaught: '+e.stack));
process.on('unhandledRejection',e=>err.push('rejet: '+(e&&e.stack||e)));
const at=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await at(500);
 const p=d.getElementById('audio-prompt');
 console.log('1. overlay présent :', !!p, '| classes :', p? p.className : '-');
 const b=d.getElementById('start-audio-btn');
 console.log('2. bouton présent  :', !!b);
 if(b){ b.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); }
 await at(1200);
 console.log('3. overlay après clic :', p.className);
 const actif=d.querySelector('.screen.active');
 console.log('4. écran actif     :', actif? actif.id : 'AUCUN  <<< BLOCAGE');
 console.log('\nerreurs :'); (err.length?err:['aucune']).forEach(e=>console.log('  '+e.slice(0,320)));
})();
