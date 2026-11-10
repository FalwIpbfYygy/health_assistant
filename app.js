(function(){
'use strict';
var C=window.FitCore,KEY='xulian.v1',S=C.normalizeState(load());
var tab='today',planDay=null,libFilter='all',libQuery='',libEquip='all',libLevel='all',obStep=0,obData={},tmr=null,tmrLeft=0,sheetOpen=false;
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){toast('\u5b58\u50a8\u4e0d\u53ef\u7528\uff0c\u8bb0\u5f55\u4e0d\u4f1a\u4fdd\u5b58');}}
function $(id){return document.getElementById(id);}
function esc(s){return C.escapeHtml(s);}
function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(t._t);t._t=setTimeout(function(){t.hidden=true;},1900);}
function openSheet(h){stopTimer();document.body.classList.add('sheet-open');sheetOpen=true;var c=$('sheetBody');c.innerHTML=h;$('sheet').hidden=false;$('sheetMask').hidden=false;var sh=$('sheet');if(sh)sh.scrollTop=0;}
function closeSheet(){document.body.classList.remove('sheet-open');sheetOpen=false;$('sheet').hidden=true;$('sheetMask').hidden=true;}
function gcolor(g){return C.groupById(g).color;}
function badge(e){var g=C.groupById(e.group);return '<div class="ex-badge" style="background:'+g.color+'">'+esc(g.name)+'</div>';}
function todayPlan(){return S.plan?S.plan.week[C.weekdayIndex()]:null;}
function doneSets(exId,date){return S.logs.filter(function(l){return l.date===date&&l.exId===exId&&l.done;});}
function bodySvg(g){var c=gcolor(g),b='#DCE6E0';
var hi={chest:'M44 54 Q60 48 76 54',back:'M44 58 Q60 52 76 58',shoulder:'M36 50 L46 48 M84 50 L74 48',leg:'M50 100 L54 140 M70 100 L66 140',arm:'M32 62 L28 88 M88 62 L92 88',core:'M52 78 h16 v16 h-16 Z',cardio:'M60 84 a10 10 0 0 1 0 18'}[g]||'';
return '<svg class="body-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="22" r="13" fill="'+b+'"/><path d="M42 42 Q60 36 78 42 L80 96 Q60 102 40 96 Z" fill="'+b+'"/><path d="M40 46 L28 54 L24 90 M80 46 L92 54 L96 90" stroke="'+b+'" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M46 96 L52 148 M74 96 L68 148" stroke="'+b+'" stroke-width="12" fill="none" stroke-linecap="round"/><path d="'+hi+'" stroke="'+c+'" stroke-width="8" fill="none" stroke-linecap="round"/></svg>';}
var OB=[
{key:'goal',q:'\u8fd9\u6b21\u4e3b\u8981\u60f3\u7ec3\u4ec0\u4e48\uff1f',hint:'\u53ea\u9009\u4e00\u4e2a\u4e3b\u76ee\u6807\uff0c\u8ba1\u5212\u6309\u5b83\u5b89\u6392\u7ec4\u6570\u3001\u6b21\u6570\u4e0e\u95f4\u6b47',opts:[['muscle','\u589e\u808c','\u590d\u5408\u52a8\u4f5c\u4e3a\u4e3b\uff0c\u6e10\u8fdb\u52a0\u91cd\u91cf','\u529b'],['fat','\u51cf\u8102','\u77ed\u95f4\u6b47\u9ad8\u6b21\u6570\uff0c\u672b\u5c3e\u52a0\u4f4e\u51b2\u51fb\u6709\u6c27','\u71c3'],['shape','\u5851\u5f62','\u5747\u8861\u5bb9\u91cf\uff0c\u6ce8\u91cd\u52a8\u4f5c\u63a7\u5236','\u5f62']]},
{key:'level',q:'\u76ee\u524d\u8bad\u7ec3\u7ecf\u9a8c\uff1f',hint:'\u5b81\u53ef\u9009\u4f4e\u4e00\u6863\uff0c\u5148\u628a\u52a8\u4f5c\u505a\u5bf9',opts:[['new','\u96f6\u57fa\u7840','\u524d\u4e24\u5468\u5f3a\u5ea6\u5c01\u5370\uff0c\u4e0d\u52a0\u91cd\u91cf','\u65b0'],['mid','\u6709\u57fa\u7840','\u7ec3\u8fc7 3 \u4e2a\u6708\u4ee5\u4e0a','\u7ec3'],['pro','\u8fdb\u9636','\u719f\u6089\u81ea\u7531\u91cd\u91cf','\u5f3a']]},
{key:'place',q:'\u5728\u54ea\u7ec3\uff1f',hint:'\u52a8\u4f5c\u5e93\u6309\u573a\u5730\u8fc7\u6ee4\uff0c\u4e0d\u6392\u505a\u4e0d\u4e86\u7684\u52a8\u4f5c',opts:[['gym','\u5065\u8eab\u623f','\u5668\u68b0\u9f50\u5168','\u9986'],['home','\u5c45\u5bb6','\u54d1\u94c3 / \u5f39\u529b\u5e26 / \u5f92\u624b','\u5bb6']]},
{key:'days',q:'\u4e00\u5468\u80fd\u7ec3\u51e0\u5929\uff1f',hint:'\u7559\u4f11\u606f\u65e5\u548c\u7ec3\u4e00\u6837\u91cd\u8981',opts:[[3,'3 \u5929','\u5168\u8eab / \u63a8\u62c9\u817f\u5206\u5316','3'],[4,'4 \u5929','\u4e0a\u4e0b\u80a2\u5206\u5316','4'],[5,'5 \u5929','\u80f8\u80cc\u817f\u80a9\u81c2\u5206\u5316','5'],[6,'6 \u5929','\u63a8\u62c9\u817f \u00d72','6']]}
];
function renderOb(){var s=OB[obStep],h='<div class="ob-q">'+s.q+'</div><div class="ob-hint">'+s.hint+'</div>';
s.opts.forEach(function(o){var on=String(obData[s.key])===String(o[0]);
h+='<button class="opt'+(on?' on':'')+'" data-ob="'+esc(o[0])+'" type="button"><div class="opt-ico">'+o[3]+'</div><div class="opt-tx"><b>'+esc(o[1])+'</b><small>'+esc(o[2])+'</small></div><div class="opt-check"></div></button>';});
if(obStep===3)h+='<div class="row2" style="margin-top:14px"><input class="field" id="obH" type="number" placeholder="\u8eab\u9ad8 cm" value="170"><input class="field" id="obW" type="number" placeholder="\u4f53\u91cd kg" value="65"></div>';
$('obStep').innerHTML=h;$('obProgress').style.width=((obStep+1)*25)+'%';$('obBack').hidden=obStep===0;$('obNext').textContent=obStep===3?'\u751f\u6210\u6211\u7684\u8ba1\u5212':'\u4e0b\u4e00\u6b65';}
function finishOb(){obData.height=C.clampInt($('obH').value,120,220,170);obData.weight=C.clampInt($('obW').value,30,200,65);
S.profile=C.validateProfile(obData);S.plan=C.generatePlan(S.profile,C.EXERCISES);S.weights=[{date:C.dateKey(),kg:S.profile.weight}];save();
$('onboarding').hidden=true;$('main').hidden=false;render();toast('\u8ba1\u5212\u5df2\u751f\u6210\uff0c\u5148\u7ec3\u5bf9\u518d\u7ec3\u91cd');}
function renderToday(){var p=todayPlan(),d=C.dateKey(),out='';
if(!p){$('v-today').innerHTML='<div class="empty"><b>\u8fd8\u6ca1\u6709\u8ba1\u5212</b>\u53bb\u8bbe\u7f6e\u91cc\u91cd\u65b0\u751f\u6210</div>';return;}
var doneN=0,total=0;p.items.forEach(function(it){total+=it.sets;doneN+=doneSets(it.exId,d).length;});
var goal=C.goalById(S.profile.goal);
out+='<div class="hero"><h2>'+esc(p.title)+'</h2><p>'+esc(p.weekday)+' \u00b7 '+esc(goal.name)+' \u00b7 '+esc(S.profile.place==='gym'?'\u5065\u8eab\u623f':'\u5c45\u5bb6')+'</p><div class="hero-row"><div><b>'+doneN+'/'+total+'</b><span>\u5df2\u5b8c\u6210\u7ec4\u6570</span></div><div><b>'+C.streakOf(S.sessions,d)+'</b><span>\u8fde\u7eed\u6253\u5361\u5929</span></div><div><b>'+C.volumeOf(S.logs.filter(function(l){return l.date===d;}))+'</b><span>\u4eca\u65e5\u5bb9\u91cf kg</span></div></div></div>';
if(p.rest)out+='<div class="card"><div class="ex-name">\u4eca\u5929\u4f11\u606f</div><div class="muted small" style="margin-top:6px">'+esc(p.note)+'</div></div>';
else{out+='<div class="note-bar">'+esc(p.note)+'</div>';
p.items.forEach(function(it){var e=C.EX_BY_ID[it.exId];if(!e)return;
var ds=doneSets(it.exId,d),last=C.lastLift(S.logs,it.exId),m=String(it.reps).match(/^\d+/),dr=m?m[0]:'',mode=C.inputMode(e);
out+='<div class="ex-card"><div class="ex-head">'+badge(e)+'<div style="flex:1"><div class="ex-name">'+esc(e.name)+'</div><div class="ex-meta">'+it.sets+' \u7ec4 \u00d7 '+esc(it.reps)+' \u00b7 '+esc(e.equip)+' \u00b7 \u4f11\u606f '+it.rest+'s</div></div><button class="ex-toggle'+(ds.length>=it.sets?' done':'')+'" data-act="toggle-all" data-ex="'+esc(e.id)+'" data-sets="'+it.sets+'" type="button">\u2713</button></div>';
for(var i=0;i<it.sets;i++){var rec=S.logs.filter(function(l){return l.date===d&&l.exId===e.id&&l.setIndex===i;})[0];
var w=rec?rec.weight:(last?last.weight:''),r=rec?rec.reps:(dr||(last?last.reps:''));
out+='<div class="set-row"><span class="sn">\u7b2c '+(i+1)+' \u7ec4</span>';
if(mode==='weight'){
out+='<input type="number" inputmode="decimal" data-w="'+esc(e.id)+'" data-i="'+i+'" value="'+esc(w)+'" placeholder="kg"><span class="unit">kg</span><input type="number" inputmode="numeric" data-r="'+esc(e.id)+'" data-i="'+i+'" value="'+esc(r)+'" placeholder="\u6b21"><span class="unit">\u6b21</span>';
}else if(mode==='time'){
out+='<input type="number" inputmode="decimal" class="wide" data-r="'+esc(e.id)+'" data-i="'+i+'" value="'+esc(rec?rec.reps:'')+'" placeholder="\u5206\u949f"><span class="unit">\u5206\u949f</span>';
}else{
out+='<input type="number" inputmode="numeric" class="wide" data-r="'+esc(e.id)+'" data-i="'+i+'" value="'+esc(r)+'" placeholder="\u6b21"><span class="unit">\u6b21</span>';
}
out+='<button class="set-check'+(rec&&rec.done?' on':'')+'" data-act="set" data-ex="'+esc(e.id)+'" data-i="'+i+'" type="button">\u2713</button></div>';}
out+='<div class="ex-foot"><button class="btn btn-ghost btn-sm" data-act="detail" data-ex="'+esc(e.id)+'" type="button">\u52a8\u4f5c\u8981\u9886</button><button class="btn btn-ghost btn-sm" data-act="timer" data-sec="'+it.rest+'" type="button">\u7ec4\u95f4\u8ba1\u65f6 '+it.rest+'s</button></div></div>';});
out+='<button class="btn btn-primary btn-block" data-act="finish" type="button">\u5b8c\u6210\u672c\u6b21\u8bad\u7ec3</button>';}
$('v-today').innerHTML=out;}
function renderPlan(){if(!S.plan){$('v-plan').innerHTML='<div class="empty"><b>\u8fd8\u6ca1\u6709\u8ba1\u5212</b></div>';return;}
var w=S.plan.week,td=C.weekdayIndex();if(planDay===null)planDay=td;var h='<div class="week-scroll">';
w.forEach(function(d){h+='<button class="day-pill'+(planDay===d.day?' on':'')+(d.day===td?' today':'')+'" data-act="day" data-d="'+d.day+'" type="button"><b>'+esc(d.weekday)+'</b><small>'+(d.rest?'\u4f11\u606f':d.items.length+' \u4e2a\u52a8\u4f5c')+'</small><div class="day-dot'+(d.rest?' rest':'')+'"></div></button>';});
h+='</div>';var d=w[planDay];
h+='<div class="plan-head"><b>'+esc(d.title)+'</b><span>'+S.plan.profile.days+' \u5929/\u5468 \u00b7 '+esc(C.goalById(S.plan.profile.goal).name)+'</span></div><div class="card">';
if(d.rest)h+='<div class="muted small">'+esc(d.note)+'</div>';
else d.items.forEach(function(it){var e=C.EX_BY_ID[it.exId];if(!e)return;h+='<div class="mini-ex" data-act="detail" data-ex="'+esc(e.id)+'"><div class="mini-dot" style="background:'+gcolor(e.group)+'"></div><b>'+esc(e.name)+'</b><span>'+it.sets+' \u00d7 '+esc(it.reps)+'</span></div>';});
h+='</div><div class="note-bar">'+esc(d.note)+'</div><button class="btn btn-ghost btn-block" data-act="regen" type="button">\u91cd\u65b0\u751f\u6210\u8ba1\u5212</button>';
h+='<div class="disclaimer">'+esc(C.planDisclaimer(S.plan.profile))+'\u3000\u5206\u5316\uff1a'+esc(C.SPLITS[S.plan.profile.days].focus.join(' / '))+'\u3002</div>';
$('v-plan').innerHTML=h;}
function renderLib(){var h='<input class="search" id="libSearch" placeholder="\u641c\u52a8\u4f5c\u540d / \u808c\u7fa4" value="'+esc(libQuery)+'"><div class="filters">';
h+='<button class="filter'+(libFilter==='all'?' on':'')+'" data-act="filter" data-f="all" type="button">\u5168\u90e8</button>';
C.GROUPS.forEach(function(g){h+='<button class="filter'+(libFilter===g.id?' on':'')+'" data-act="filter" data-f="'+g.id+'" type="button">'+esc(g.name)+'</button>';});h+='</div>';
var EQ=[['all','\u5168\u90e8\u5668\u68b0'],['__mine','\u6211\u7684\u573a\u5730'],['bodyweight','\u5f92\u624b'],['dumbbell','\u54d1\u94c3'],['barbell','\u67aa\u94c3'],['machine','\u56fa\u5b9a\u5668\u68b0'],['cable','\u9f99\u95e8\u67b6'],['band','\u5f39\u529b\u5e26'],['cardio','\u6709\u6c27']];
h+='<div class="filters sub-filters">';EQ.forEach(function(o){h+='<button class="filter'+(libEquip===o[0]?' on':'')+'" data-act="filter-equip" data-f="'+o[0]+'" type="button">'+esc(o[1])+'</button>';});h+='</div>';
var LV=[['all','\u5168\u90e8\u96be\u5ea6'],['1','\u5165\u95e8'],['2','\u8fdb\u9636'],['3','\u9ad8\u9636']];
h+='<div class="filters sub-filters">';LV.forEach(function(o){h+='<button class="filter'+(libLevel===o[0]?' on':'')+'" data-act="filter-level" data-f="'+o[0]+'" type="button">'+esc(o[1])+'</button>';});h+='</div>';
var list=C.EXERCISES.filter(function(e){if(libFilter!=='all'&&e.group!==libFilter)return false;
if(libEquip==='__mine'){if(!S.profile||e.place.indexOf(S.profile.place)<0)return false;}
else if(libEquip!=='all'&&C.equipKeys(e).indexOf(libEquip)<0)return false;
if(libLevel!=='all'&&e.level!==parseInt(libLevel,10))return false;
if(libQuery&&(e.name+e.en+e.target).toLowerCase().indexOf(libQuery.toLowerCase())<0)return false;return true;});
h+='<div class="muted small" style="margin-bottom:10px">\u5171 '+list.length+' \u4e2a\u52a8\u4f5c</div>';
if(!list.length)h+='<div class="empty"><b>\u6ca1\u6709\u7b26\u5408\u6761\u4ef6\u7684\u52a8\u4f5c</b>\u6362\u4e2a\u7b5b\u9009\u8bd5\u8bd5</div>';
list.forEach(function(e){h+='<div class="lib-item" data-act="detail" data-ex="'+esc(e.id)+'">'+badge(e)+'<div style="flex:1"><div class="lib-name">'+esc(e.name)+'</div><div class="lib-sub">'+esc(e.equip)+' \u00b7 '+esc(e.target)+'</div></div><span class="lv-mini">'+esc(C.levelName(e.level))+'</span></div>';});
$('v-lib').innerHTML=h;}
function showDetail(id){var e=C.EX_BY_ID[id];if(!e)return;var g=C.groupById(e.group);
var h='<h3>'+esc(e.name)+'</h3><div class="sub">'+esc(e.en)+'</div>';
h+='<div class="demo-wrap"><img class="demo-img" src="'+esc(C.demoOf(e))+'" alt="'+esc(e.name)+'\u52a8\u4f5c\u793a\u610f" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="demo-fallback">'+bodySvg(e.group)+'</div></div>';
h+='<div class="detail-tags"><span class="chip" style="background:'+g.color+'22;color:'+g.color+'">'+esc(g.name)+'</span><span class="chip">'+esc(e.equip)+'</span><span class="chip">'+esc(C.levelName(e.level))+'</span><span class="chip orange">'+(e.compound?'\u590d\u5408\u52a8\u4f5c':'\u5b64\u7acb\u52a8\u4f5c')+'</span></div>';
h+='<div class="card"><div class="sec-title" style="margin-top:0">\u2460 \u51c6\u5907 / \u70ed\u8eab</div><div class="small">'+esc(C.prepOf(e))+'</div></div>';
h+='<div class="card"><div class="sec-title" style="margin-top:0">\u2461 \u52a8\u4f5c\u8fc7\u7a0b</div>';
e.cues.forEach(function(c,i){h+='<div class="cue"><i>'+(i+1)+'</i><span>'+esc(c)+'</span></div>';});h+='</div>';
h+='<div class="card"><div class="sec-title" style="margin-top:0">\u2462 \u5e38\u89c1\u9519\u8bef</div><div class="small">'+esc(e.mistakes.join('\uff1b'))+'</div></div>';
if(e.risky)h+='<div class="warn">\u9ad8\u98ce\u9669\u52a8\u4f5c\uff1a\u96f6\u57fa\u7840\u4e0e\u5f3a\u5ea6\u5c01\u5370\u671f\u4e0d\u4f1a\u6392\u8fdb\u8ba1\u5212\uff0c\u5efa\u8bae\u6709\u4eba\u4fdd\u62a4\u518d\u7ec3\u3002</div>';
h+='<div class="disclaimer">\u52a8\u4f5c\u793a\u610f\u56fe\u4ec5\u4f9b\u5b66\u4e60\u53c2\u8003\uff0c\u5982\u6709\u4f24\u75c5\u8bf7\u54a8\u8be2\u4e13\u4e1a\u533b\u5e08\u6216\u6559\u7ec3\u3002</div>';openSheet(h);}
function renderMe(){var d=C.dateKey(),vol=C.volumeOf(S.logs),streak=C.streakOf(S.sessions,d);
var wk=C.weeklyVolume(S.logs,8,d),max=Math.max.apply(null,wk.map(function(x){return x.value;}).concat([1]));
var h='<div class="hero"><h2>\u575a\u6301\u6709\u8ff9\u53ef\u5faa</h2><p>\u6570\u636e\u53ea\u5b58\u5728\u8fd9\u53f0\u8bbe\u5907\u7684\u6d4f\u89c8\u5668\u91cc</p></div>';
h+='<div class="stat-grid"><div class="stat"><b>'+S.sessions.length+'</b><span>\u7d2f\u8ba1\u8bad\u7ec3\u6b21\u6570</span></div><div class="stat"><b>'+streak+'</b><span>\u8fde\u7eed\u6253\u5361\u5929\u6570</span></div><div class="stat"><b>'+vol+'</b><span>\u7d2f\u8ba1\u5bb9\u91cf kg</span></div><div class="stat"><b>'+S.logs.filter(function(l){return l.done;}).length+'</b><span>\u5b8c\u6210\u7ec4\u6570</span></div></div>';
h+='<div class="card"><div class="sec-title" style="margin-top:0">\u8fd1 8 \u5468\u8bad\u7ec3\u5bb9\u91cf (kg)</div><svg class="chart" viewBox="0 0 320 130" preserveAspectRatio="none">';
wk.forEach(function(x,i){var bh=Math.round(x.value/max*88),bx=8+i*39,by=110-bh;h+='<rect x="'+bx+'" y="'+by+'" width="26" height="'+Math.max(bh,2)+'" rx="5" fill="'+(i===7?'#FF7A45':'#166B54')+'"/>';h+='<text x="'+(bx+13)+'" y="126" font-size="9" text-anchor="middle" fill="#93A29B">'+esc(x.label)+'</text>';});
h+='</svg></div><div class="card"><div class="sec-title" style="margin-top:0">\u4f53\u91cd\u8bb0\u5f55</div><div class="row2"><input class="field" id="wKg" type="number" placeholder="\u4eca\u65e5\u4f53\u91cd kg"><button class="btn btn-primary btn-sm" data-act="save-weight" type="button">\u8bb0\u4e00\u7b14</button></div>';
if(S.weights.length){var last=S.weights[S.weights.length-1];h+='<div class="small muted">\u6700\u8fd1\uff1a'+esc(last.kg)+' kg\uff08'+esc(last.date)+'\uff09</div>';}
h+='</div><div class="card"><div class="sec-title" style="margin-top:0">\u6211\u7684\u8bbe\u5b9a</div><div class="list-row"><span>\u76ee\u6807</span><b>'+esc(C.goalById(S.profile.goal).name)+'</b></div><div class="list-row"><span>\u7ecf\u9a8c</span><b>'+esc(S.profile.level==='new'?'\u96f6\u57fa\u7840':(S.profile.level==='mid'?'\u6709\u57fa\u7840':'\u8fdb\u9636'))+'</b></div><div class="list-row"><span>\u573a\u5730</span><b>'+esc(S.profile.place==='gym'?'\u5065\u8eab\u623f':'\u5c45\u5bb6')+'</b></div><div class="list-row"><span>\u6bcf\u5468</span><b>'+S.profile.days+' \u5929</b></div></div>';
h+='<div class="disclaimer">\u5e8f\u7ec3\u662f\u8bad\u7ec3\u8ba1\u5212\u4e0e\u8bb0\u5f55\u5de5\u5177\uff0c\u4e0d\u63d0\u4f9b\u533b\u7597\u5efa\u8bae\u3002\u8bad\u7ec3\u524d\u8bf7\u8bc4\u4f30\u8eab\u8eab\u72b6\u51b5\uff1b\u51fa\u73b0\u75db\u75db\u7acb\u5373\u505c\u6b62\u3002\u6570\u636e\u4fdd\u5b58\u5728\u6d4f\u89c8\u5668 localStorage\uff0c\u6e05\u9664\u6d4f\u89c8\u5668\u6570\u636e\u4f1a\u4e00\u5e76\u5220\u9664\u3002</div>';
$('v-me').innerHTML=h;}
function showSettings(){var h='<h3>\u8bbe\u7f6e</h3><div class="sub">\u8c03\u6574\u8ba1\u5212\u6216\u7ba1\u7406\u672c\u5730\u6570\u636e</div>';
h+='<button class="btn btn-ghost btn-block" data-act="restart" type="button" style="margin-bottom:8px">\u91cd\u65b0\u505a\u95ee\u5377 / \u6362\u76ee\u6807</button>';
h+='<button class="btn btn-ghost btn-block" data-act="export" type="button" style="margin-bottom:8px">\u5bfc\u51fa\u8bad\u7ec3\u6570\u636e (JSON)</button>';
h+='<button class="btn btn-ghost btn-block" data-act="reset" type="button" style="margin-bottom:8px;color:#C0392B">\u6e05\u7a7a\u5168\u90e8\u6570\u636e</button>';
h+='<div class="disclaimer">\u7248\u672c 1.1 \u00b7 \u7eaf\u79bb\u7ebf \u00b7 \u65e0\u8d26\u53f7 \u00b7 \u65e0\u4e0a\u4f20\u3002</div>';openSheet(h);}
function setRecord(ex,i,field,val){var d=C.dateKey(),rec=S.logs.filter(function(l){return l.date===d&&l.exId===ex&&l.setIndex===i;})[0];
if(!rec){rec={date:d,exId:ex,setIndex:i,weight:'',reps:'',done:false,ts:Date.now()};S.logs.push(rec);}
rec[field]=C.clampInt(val,0,999,'');save();}
function toggleSet(ex,i){var d=C.dateKey(),rec=S.logs.filter(function(l){return l.date===d&&l.exId===ex&&l.setIndex===i;})[0];
if(!rec){rec={date:d,exId:ex,setIndex:i,weight:'',reps:'',done:false,ts:Date.now()};S.logs.push(rec);}
rec.done=!rec.done;rec.ts=Date.now();save();renderToday();if(rec.done&&navigator.vibrate)navigator.vibrate(30);}
function startTimer(sec){tmrLeft=C.clampInt(sec,15,300,60);$('timerFloat').hidden=false;$('timerNum').textContent=tmrLeft;
clearInterval(tmr);tmr=setInterval(function(){tmrLeft--;$('timerNum').textContent=Math.max(tmrLeft,0);if(tmrLeft<=0){clearInterval(tmr);toast('\u4f11\u606f\u7ed3\u675f\uff0c\u4e0b\u4e00\u7ec4');if(navigator.vibrate)navigator.vibrate([80,60,80]);}},1000);}
function stopTimer(){clearInterval(tmr);$('timerFloat').hidden=true;}
function render(){$('topTitle').textContent={today:'\u4eca\u5929',plan:'\u8bad\u7ec3\u8ba1\u5212',lib:'\u52a8\u4f5c\u5e93',me:'\u6211\u7684',coach:'\u5165\u95e8\u6307\u5357'}[tab];
$('topSub').textContent=S.profile?(C.goalById(S.profile.goal).name+' \u00b7 '+S.profile.days+' \u5929/\u5468'):'\u5148\u7ec3\u5bf9\uff0c\u518d\u7ec3\u91cd';
['today','plan','lib','me','coach'].forEach(function(t){$('v-'+t).hidden=t!==tab;});
document.querySelectorAll('.tab').forEach(function(b){b.classList.toggle('active',b.dataset.tab===tab);});
if(tab==='today')renderToday();if(tab==='plan')renderPlan();if(tab==='lib')renderLib();if(tab==='me')renderMe();if(tab==='coach'&&window.XulianCoach)window.XulianCoach.render();}
function boot(){if(!S.profile||!S.plan){$('onboarding').hidden=false;$('main').hidden=true;obData={goal:'muscle',level:'new',place:'gym',days:3};renderOb();}
else{$('onboarding').hidden=true;$('main').hidden=false;render();}}
document.addEventListener('click',function(ev){var t=ev.target.closest('[data-act],[data-tab],[data-ob]');if(!t)return;
if(t.dataset.tab){tab=t.dataset.tab;render();return;}
if(t.dataset.ob){obData[OB[obStep].key]=t.dataset.ob;renderOb();return;}
var a=t.dataset.act,ex=t.dataset.ex,i=parseInt(t.dataset.i,10),dk=C.dateKey();
if(a==='day'){planDay=parseInt(t.dataset.d,10);renderPlan();}
else if(a==='filter'){libFilter=t.dataset.f;renderLib();}
else if(a==='filter-equip'){libEquip=t.dataset.f;renderLib();}
else if(a==='filter-level'){libLevel=t.dataset.f;renderLib();}
else if(a==='detail'){showDetail(ex);}
else if(a==='set'){toggleSet(ex,i);}
else if(a==='toggle-all'){var n=doneSets(ex,dk).length,total=parseInt(t.dataset.sets,10);
if(n>=total)S.logs=S.logs.filter(function(l){return !(l.date===dk&&l.exId===ex);});
else{for(var k=0;k<total;k++){var rec=S.logs.filter(function(l){return l.date===dk&&l.exId===ex&&l.setIndex===k;})[0];if(!rec){rec={date:dk,exId:ex,setIndex:k,weight:'',reps:'',ts:Date.now()};S.logs.push(rec);}rec.done=true;}}
save();renderToday();}
else if(a==='timer'){startTimer(t.dataset.sec);}
else if(a==='timer-stop'){stopTimer();}
else if(a==='timer-add'){tmrLeft+=30;$('timerNum').textContent=tmrLeft;}
else if(a==='finish'){if(!S.logs.some(function(l){return l.date===dk&&l.done;})){toast('\u5148\u52fe\u9009\u81f3\u5c11\u4e00\u7ec4\u518d\u5b8c\u6210');return;}
if(!S.sessions.some(function(s){return s.date===dk;}))S.sessions.push({date:dk,volume:C.volumeOf(S.logs.filter(function(l){return l.date===dk;}))});
save();toast('\u6253\u5361\u6210\u529f\uff0c\u660e\u5929\u89c1');render();}
else if(a==='regen'){S.plan=C.generatePlan(S.profile,C.EXERCISES);save();renderPlan();toast('\u8ba1\u5212\u5df2\u91cd\u65b0\u751f\u6210');}
else if(a==='save-weight'){var v=C.clampInt($('wKg').value,30,200,0);if(!v){toast('\u8bf7\u8f93\u5165\u4f53\u91cd');return;}
S.weights=S.weights.filter(function(x){return x.date!==dk;});S.weights.push({date:dk,kg:v});save();renderMe();toast('\u5df2\u8bb0\u5f55');}
else if(a==='settings'){showSettings();}
else if(a==='restart'){closeSheet();S.profile=null;S.plan=null;save();boot();}
else if(a==='export'){closeSheet();openSheet('<h3>\u5bfc\u51fa\u6570\u636e</h3><div class="sub">\u590d\u5236\u4e0b\u9762\u6587\u672c\u81ea\u884c\u4fdd\u5b58</div><textarea class="field" style="height:180px" readonly>'+esc(JSON.stringify(S))+'</textarea>');}
else if(a==='reset'){if(confirm('\u786e\u5b9a\u6e05\u7a7a\u5168\u90e8\u8bad\u7ec3\u8bb0\u5f55\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u6062\u590d')){S=C.emptyState();save();closeSheet();boot();toast('\u5df2\u6e05\u7a7a');}}});
document.addEventListener('input',function(ev){var t=ev.target;
if(t.dataset.w!==undefined)setRecord(t.dataset.w,parseInt(t.dataset.i,10),'weight',t.value);
if(t.dataset.r!==undefined)setRecord(t.dataset.r,parseInt(t.dataset.i,10),'reps',t.value);
if(t.id==='libSearch'){libQuery=t.value;var pos=t.selectionStart;renderLib();var n=document.getElementById('libSearch');n.focus();n.setSelectionRange(pos,pos);}});
document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&sheetOpen)closeSheet();});
$('obNext').addEventListener('click',function(){if(obStep<3){obStep++;renderOb();}else finishOb();});
$('obBack').addEventListener('click',function(){if(obStep>0){obStep--;renderOb();}});
$('sheetMask').addEventListener('click',closeSheet);
boot();
})();
