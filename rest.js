(function(){
'use strict';
var KEY='xulian.rest.v1',VKEY='xulian.vol.v1',DEF=75,OPTS=[60,75,90],BELL_MS=3000;
var VOLS=[{n:'标准',p:0.45},{n:'大',p:0.72},{n:'超大',p:0.95}];
var sec=load(),vol=loadVol(),endAt=0,tick=null,ac=null,out=null,running=false,dock=null,btn=null,opts=null,volBtn=null;
var bellNodes=[],pvNodes=[],bellTimer=null,bellUntil=0,ringTimer=null;
function $(id){return document.getElementById(id);}
function load(){try{var v=parseInt(localStorage.getItem(KEY),10);return OPTS.indexOf(v)>=0?v:DEF;}catch(e){return DEF;}}
function keep(v){try{localStorage.setItem(KEY,String(v));}catch(e){}}
function loadVol(){try{var v=parseInt(localStorage.getItem(VKEY),10);return (v>=1&&v<=3)?v:3;}catch(e){return 3;}}
function keepVol(v){try{localStorage.setItem(VKEY,String(v));}catch(e){}}
function audio(){
 try{
  if(!ac){
   var A=window.AudioContext||window.webkitAudioContext;if(!A)return null;
   ac=new A();out=ac.destination;
   if(ac.createDynamicsCompressor){
    var c=ac.createDynamicsCompressor();
    c.threshold.value=-10;c.knee.value=6;c.ratio.value=8;c.attack.value=0.003;c.release.value=0.12;
    c.connect(ac.destination);out=c;
   }
  }
  if(ac.state==='suspended')ac.resume();
  return ac;
 }catch(e){return null;}
}
function unlock(){
 var a=audio();if(!a)return;
 try{var o=a.createOscillator(),g=a.createGain();g.gain.value=0.0001;o.connect(g);g.connect(out||a.destination);o.start();o.stop(a.currentTime+0.02);}catch(e){}
}
function kill(list){
 list.forEach(function(o){try{o.stop(0);}catch(e){}try{o.disconnect();}catch(e){}});
 list.length=0;
}
function stopBell(){clearTimeout(bellTimer);bellTimer=null;kill(bellNodes);}
function chime(t,peak,dur,bag){
 var o1=ac.createOscillator(),g1=ac.createGain();
 o1.type='sine';
 o1.frequency.setValueAtTime(987.77,t);
 o1.frequency.exponentialRampToValueAtTime(1568,t+0.08);
 g1.gain.setValueAtTime(0.0001,t);
 g1.gain.exponentialRampToValueAtTime(peak,t+0.010);
 g1.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 o1.connect(g1);g1.connect(out||ac.destination);o1.start(t);o1.stop(t+dur+0.02);
 bag.push(o1);
 var o2=ac.createOscillator(),g2=ac.createGain();
 o2.type='triangle';
 o2.frequency.setValueAtTime(2093,t);
 o2.frequency.exponentialRampToValueAtTime(2637,t+0.06);
 g2.gain.setValueAtTime(0.0001,t);
 g2.gain.exponentialRampToValueAtTime(peak*0.4,t+0.008);
 g2.gain.exponentialRampToValueAtTime(0.0001,t+dur*0.8);
 o2.connect(g2);g2.connect(out||ac.destination);o2.start(t);o2.stop(t+dur+0.02);
 bag.push(o2);
}
function bell(){
 stopBell();
 var a=audio();if(!a)return;
 try{
  var b=a.currentTime+0.01,peak=VOLS[vol-1].p;
  [0,0.5,1,1.5,2,2.5].forEach(function(d,i){chime(b+d,peak*(1-i*0.04),0.48,bellNodes);});
  bellTimer=setTimeout(stopBell,BELL_MS+180);
 }catch(e){}
}
function preview(){
 unlock();var a=audio();if(!a)return;
 try{kill(pvNodes);chime(a.currentTime+0.01,VOLS[vol-1].p,0.62,pvNodes);setTimeout(function(){kill(pvNodes);},900);}catch(e){}
}
function say(m){
 var t=$('toast');if(!t)return;
 t.textContent=m;t.hidden=false;clearTimeout(t._restT);t._restT=setTimeout(function(){t.hidden=true;},2200);
}
function fmt(n){var m=Math.floor(n/60),r=n%60;return m+':'+(r<10?'0':'')+r;}
function visible(){
 var v=$('v-today'),m=$('main');
 return !!(v&&!v.hidden&&m&&!m.hidden&&document.querySelector('#v-today .set-check'));
}
function sets(){return document.querySelectorAll('#v-today .set-check[data-act="set"]');}
function progress(){
 var l=sets(),tot=l.length,done=0;
 for(var i=0;i<l.length;i++)if(l[i].classList.contains('on'))done++;
 return {total:tot,next:Math.min(done+1,tot||1)};
}
function paint(){
 if(!btn)return;
 dock.classList.toggle('counting',running);
 dock.classList.toggle('ringing',!!bellUntil);
 dock.hidden=!visible();
 var p=progress();
 if(bellUntil){
  $('restMain').textContent='叮！休息结束';
  $('restSub').textContent='第 '+p.next+' / '+p.total+' 组准备 · 自动恢复，无需操作';
 }else if(running){
  $('restMain').textContent=fmt(Math.max(0,Math.ceil((endAt-Date.now())/1000)));
  $('restSub').textContent='休息中 · 到点自动响 3 秒并停';
  var f=$('timerFloat');if(f)f.hidden=true;
 }else{
  $('restMain').textContent='完成这组 · 开始休息';
  $('restSub').textContent=(p.total?'第 '+p.next+' / '+p.total+' 组 · ':'')+sec+' 秒 · '+VOLS[vol-1].n+'音量 · 碰这一下';
 }
 if(volBtn)volBtn.textContent='音量 '+VOLS[vol-1].n;
}
function drawOpts(){
 if(!opts)return;opts.innerHTML='';
 OPTS.forEach(function(v){
  var b=document.createElement('button');b.type='button';b.textContent=v+'s';if(v===sec)b.className='on';
  b.addEventListener('click',function(){sec=v;keep(v);drawOpts();if(!running&&!bellUntil)paint();});
  opts.appendChild(b);
 });
 var q=document.createElement('button');q.type='button';q.className='vol';q.id='restVol';
 q.addEventListener('click',function(){vol=vol%3+1;keepVol(vol);preview();paint();say('音量 '+VOLS[vol-1].n+' · 已试听一声');});
 opts.appendChild(q);volBtn=q;
}
function nextSet(){var l=sets();for(var i=0;i<l.length;i++)if(!l[i].classList.contains('on'))return l[i];return null;}
function stopOld(){
 var f=$('timerFloat');
 if(f&&!f.hidden){var s=document.querySelector('[data-act="timer-stop"]');if(s)s.click();f.hidden=true;}
}
function end(skip){
 clearInterval(tick);tick=null;running=false;
 if(!skip){
  bell();
  if(navigator.vibrate)navigator.vibrate([300,80,300,80,300,80,300]);
  bellUntil=Date.now()+BELL_MS;
  say('叮！休息结束，开始下一组');
  clearTimeout(ringTimer);
  ringTimer=setTimeout(function(){bellUntil=0;stopBell();paint();},BELL_MS);
 }else say('已跳过休息');
 paint();
}
function loop(){
 if(!running)return;
 if(Date.now()>=endAt){end(false);return;}
 paint();
}
function main(){
 unlock();
 if(bellUntil)return;
 if(running){end(true);return;}
 var b=nextSet();
 if(!b){say('今天没有待完成的组了');return;}
 var n=parseInt(b.dataset.i,10)+1;
 b.click();
 stopOld();
 running=true;endAt=Date.now()+sec*1000;
 paint();clearInterval(tick);tick=setInterval(loop,250);
 say('第 '+n+' 组完成 · 休息 '+sec+' 秒');
 if(navigator.vibrate)navigator.vibrate(40);
}
function build(){
 dock=document.createElement('div');dock.id='restDock';dock.className='rest-dock';dock.hidden=true;
 dock.innerHTML='<div class="rest-opts" id="restOpts"></div><button class="rest-btn" id="restBtn" type="button"><span class="rest-main" id="restMain"></span><span class="rest-sub" id="restSub"></span></button><div class="rest-side"><button type="button" id="restAdd">+30s</button><button type="button" id="restSkip">跳过休息</button></div>';
 document.body.appendChild(dock);
 btn=$('restBtn');opts=$('restOpts');drawOpts();paint();
 btn.addEventListener('click',main);
 $('restAdd').addEventListener('click',function(){if(running){endAt+=30000;paint();}});
 $('restSkip').addEventListener('click',function(){if(running)end(true);});
}
function boot(){
 build();
 if(window.MutationObserver){
  ['v-today','v-plan','v-lib','v-me','v-coach','main'].forEach(function(id){
   var el=$(id);if(!el)return;
   new window.MutationObserver(paint).observe(el,{attributes:true,attributeFilter:['hidden'],childList:id==='v-today'});
  });
 }
 document.addEventListener('visibilitychange',function(){
  if(document.hidden)return;
  if(bellUntil&&Date.now()>=bellUntil){bellUntil=0;stopBell();}
  if(running)loop();
  paint();
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
