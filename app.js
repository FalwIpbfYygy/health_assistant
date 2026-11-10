(function(){
'use strict';
var C=window.FitCore,KEY='xulian.v1',S=C.normalizeState(load());
var tab='today',planDay=null,libFilter='all',libQuery='',obStep=0,obData={},tmr=null,tmrLeft=0;
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){toast('存储不可用，记录不会保存');}}
function $(id){return document.getElementById(id);}
function esc(s){return C.escapeHtml(s);}
function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(t._t);t._t=setTimeout(function(){t.hidden=true;},1900);}
function openSheet(h){$('sheetBody').innerHTML=h;$('sheet').hidden=false;$('sheetMask').hidden=false;}
function closeSheet(){$('sheet').hidden=true;$('sheetMask').hidden=true;}
function gcolor(g){return C.groupById(g).color;}
function badge(e){var g=C.groupById(e.group);return '<div class="ex-badge" style="background:'+g.color+'">'+esc(g.name)+'</div>';}
function todayPlan(){return S.plan?S.plan.week[C.weekdayIndex()]:null;}
function doneSets(exId,date){return S.logs.filter(function(l){return l.date===date&&l.exId===exId&&l.done;});}
function bodySvg(g){var c=gcolor(g),b='#DCE6E0';
var hi={chest:'M44 54 Q60 48 76 54',back:'M44 58 Q60 52 76 58',shoulder:'M36 50 L46 48 M84 50 L74 48',leg:'M50 100 L54 140 M70 100 L66 140',arm:'M32 62 L28 88 M88 62 L92 88',core:'M52 78 h16 v16 h-16 Z',cardio:'M60 84 a10 10 0 0 1 0 18'}[g]||'';
return '<svg class="body-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="22" r="13" fill="'+b+'"/><path d="M42 42 Q60 36 78 42 L80 96 Q60 102 40 96 Z" fill="'+b+'"/><path d="M40 46 L28 54 L24 90 M80 46 L92 54 L96 90" stroke="'+b+'" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M46 96 L52 148 M74 96 L68 148" stroke="'+b+'" stroke-width="12" fill="none" stroke-linecap="round"/><path d="'+hi+'" stroke="'+c+'" stroke-width="8" fill="none" stroke-linecap="round"/></svg>';}
var OB=[
{key:'goal',q:'这次主要想练什么？',hint:'只选一个主目标，计划按它安排组数、次数与间歇',opts:[['muscle','增肌','复合动作为主，渐进加重量','力'],['fat','减脂','短间歇高次数，末尾加低冲击有氧','燃'],['shape','塑形','均衡容量，注重动作控制','形']]},
{key:'level',q:'目前训练经验？',hint:'宁可选低一档，先把动作做对',opts:[['new','零基础','前两周强度封印，不加重量','新'],['mid','有基础','练过 3 个月以上','练'],['pro','进阶','熟悉自由重量','强']]},
{key:'place',q:'在哪练？',hint:'动作库按场地过滤，不排做不了的动作',opts:[['gym','健身房','器械齐全','馆'],['home','居家','哑铃 / 弹力带 / 徒手','家']]},
{key:'days',q:'一周能练几天？',hint:'留休息日和练一样重要',opts:[[3,'3 天','全身 / 推拉腿分化','3'],[4,'4 天','上下肢分化','4'],[5,'5 天','胸背腿肩臂分化','5'],[6,'6 天','推拉腿 ×2','6']]}
];
function renderOb(){var s=OB[obStep],h='<div class="ob-q">'+s.q+'</div><div class="ob-hint">'+s.hint+'</div>';
s.opts.forEach(function(o){var on=String(obData[s.key])===String(o[0]);
h+='<button class="opt'+(on?' on':'')+'" data-ob="'+esc(o[0])+'" type="button"><div class="opt-ico">'+o[3]+'</div><div class="opt-tx"><b>'+esc(o[1])+'</b><small>'+esc(o[2])+'</small></div><div class="opt-check"></div></button>';});
if(obStep===3)h+='<div class="row2" style="margin-top:14px"><input class="field" id="obH" type="number" placeholder="身高 cm" value="170"><input class="field" id="obW" type="number" placeholder="体重 kg" value="65"></div>';
$('obStep').innerHTML=h;$('obProgress').style.width=((obStep+1)*25)+'%';$('obBack').hidden=obStep===0;$('obNext').textContent=obStep===3?'生成我的计划':'下一步';}
function finishOb(){obData.height=C.clampInt($('obH').value,120,220,170);obData.weight=C.clampInt($('obW').value,30,200,65);
S.profile=C.validateProfile(obData);S.plan=C.generatePlan(S.profile,C.EXERCISES);S.weights=[{date:C.dateKey(),kg:S.profile.weight}];save();
$('onboarding').hidden=true;$('main').hidden=false;render();toast('计划已生成，先练对再练重');}
function renderToday(){var p=todayPlan(),d=C.dateKey(),out='';
if(!p){$('v-today').innerHTML='<div class="empty"><b>还没有计划</b>去设置里重新生成</div>';return;}
var doneN=0,total=0;p.items.forEach(function(it){total+=it.sets;doneN+=doneSets(it.exId,d).length;});
var goal=C.goalById(S.profile.goal);
out+='<div class="hero"><h2>'+esc(p.title)+'</h2><p>'+esc(p.weekday)+' · '+esc(goal.name)+' · '+esc(S.profile.place==='gym'?'健身房':'居家')+'</p><div class="hero-row"><div><b>'+doneN+'/'+total+'</b><span>已完成组数</span></div><div><b>'+C.streakOf(S.sessions,d)+'</b><span>连续打卡天</span></div><div><b>'+C.volumeOf(S.logs.filter(function(l){return l.date===d;}))+'</b><span>今日容量 kg</span></div></div></div>';
if(p.rest)out+='<div class="card"><div class="ex-name">今天休息</div><div class="muted small" style="margin-top:6px">'+esc(p.note)+'</div></div>';
else{out+='<div class="note-bar">'+esc(p.note)+'</div>';
p.items.forEach(function(it){var e=C.EX_BY_ID[it.exId];if(!e)return;
var ds=doneSets(it.exId,d),last=C.lastLift(S.logs,it.exId),m=String(it.reps).match(/^\d+/),dr=m?m[0]:'';
out+='<div class="ex-card"><div class="ex-head">'+badge(e)+'<div style="flex:1"><div class="ex-name">'+esc(e.name)+'</div><div class="ex-meta">'+it.sets+' 组 × '+esc(it.reps)+' · '+esc(e.equip)+' · 休息 '+it.rest+'s</div></div><button class="ex-toggle'+(ds.length>=it.sets?' done':'')+'" data-act="toggle-all" data-ex="'+esc(e.id)+'" data-sets="'+it.sets+'" type="button">✓</button></div>';
for(var i=0;i<it.sets;i++){var rec=S.logs.filter(function(l){return l.date===d&&l.exId===e.id&&l.setIndex===i;})[0];
var w=rec?rec.weight:(last?last.weight:''),r=rec?rec.reps:dr;
out+='<div class="set-row"><span class="sn">第 '+(i+1)+' 组</span><input type="number" inputmode="decimal" data-w="'+esc(e.id)+'" data-i="'+i+'" value="'+esc(w)+'" placeholder="kg"><span class="unit">kg</span><input type="number" inputmode="numeric" data-r="'+esc(e.id)+'" data-i="'+i+'" value="'+esc(r)+'" placeholder="次"><span class="unit">次</span><button class="set-check'+(rec&&rec.done?' on':'')+'" data-act="set" data-ex="'+esc(e.id)+'" data-i="'+i+'" type="button">✓</button></div>';}
out+='<div class="ex-foot"><button class="btn btn-ghost btn-sm" data-act="detail" data-ex="'+esc(e.id)+'" type="button">动作要领</button><button class="btn btn-ghost btn-sm" data-act="timer" data-sec="'+it.rest+'" type="button">组间计时 '+it.rest+'s</button></div></div>';});
out+='<button class="btn btn-primary btn-block" data-act="finish" type="button">完成本次训练</button>';}
$('v-today').innerHTML=out;}
function renderPlan(){if(!S.plan){$('v-plan').innerHTML='<div class="empty"><b>还没有计划</b></div>';return;}
var w=S.plan.week,td=C.weekdayIndex();if(planDay===null)planDay=td;var h='<div class="week-scroll">';
w.forEach(function(d){h+='<button class="day-pill'+(planDay===d.day?' on':'')+(d.day===td?' today':'')+'" data-act="day" data-d="'+d.day+'" type="button"><b>'+esc(d.weekday)+'</b><small>'+(d.rest?'休息':d.items.length+' 个动作')+'</small><div class="day-dot'+(d.rest?' rest':'')+'"></div></button>';});
h+='</div>';var d=w[planDay];
h+='<div class="plan-head"><b>'+esc(d.title)+'</b><span>'+S.plan.profile.days+' 天/周 · '+esc(C.goalById(S.plan.profile.goal).name)+'</span></div><div class="card">';
if(d.rest)h+='<div class="muted small">'+esc(d.note)+'</div>';
else d.items.forEach(function(it){var e=C.EX_BY_ID[it.exId];if(!e)return;h+='<div class="mini-ex" data-act="detail" data-ex="'+esc(e.id)+'"><div class="mini-dot" style="background:'+gcolor(e.group)+'"></div><b>'+esc(e.name)+'</b><span>'+it.sets+' × '+esc(it.reps)+'</span></div>';});
h+='</div><div class="note-bar">'+esc(d.note)+'</div><button class="btn btn-ghost btn-block" data-act="regen" type="button">重新生成计划</button>';
h+='<div class="disclaimer">分化：'+esc(C.SPLITS[S.plan.profile.days].focus.join(' / '))+'。零基础自动排除杠铃深蹲、硬拉等高风险动作，并统一降到 3 组。</div>';
$('v-plan').innerHTML=h;}
function renderLib(){var h='<input class="search" id="libSearch" placeholder="搜动作名 / 肌群" value="'+esc(libQuery)+'"><div class="filters">';
h+='<button class="filter'+(libFilter==='all'?' on':'')+'" data-act="filter" data-f="all" type="button">全部</button>';
C.GROUPS.forEach(function(g){h+='<button class="filter'+(libFilter===g.id?' on':'')+'" data-act="filter" data-f="'+g.id+'" type="button">'+esc(g.name)+'</button>';});h+='</div>';
var list=C.EXERCISES.filter(function(e){if(libFilter!=='all'&&e.group!==libFilter)return false;if(libQuery&&(e.name+e.en+e.target).toLowerCase().indexOf(libQuery.toLowerCase())<0)return false;return true;});
h+='<div class="muted small" style="margin-bottom:10px">共 '+list.length+' 个动作</div>';
list.forEach(function(e){h+='<div class="lib-item" data-act="detail" data-ex="'+esc(e.id)+'">'+badge(e)+'<div style="flex:1"><div class="lib-name">'+esc(e.name)+'</div><div class="lib-sub">'+esc(e.equip)+' · '+esc(e.target)+'</div></div></div>';});
$('v-lib').innerHTML=h;}
function showDetail(id){var e=C.EX_BY_ID[id];if(!e)return;var g=C.groupById(e.group);
var h='<h3>'+esc(e.name)+'</h3><div class="sub">'+esc(e.en)+'</div>'+bodySvg(e.group);
h+='<div class="detail-tags"><span class="chip" style="background:'+g.color+'22;color:'+g.color+'">'+esc(g.name)+'</span><span class="chip">'+esc(e.equip)+'</span><span class="chip">'+esc(e.level===1?'入门':(e.level===2?'进阶':'高阶'))+'</span><span class="chip orange">'+(e.compound?'复合动作':'孤立动作')+'</span></div>';
h+='<div class="card"><div class="sec-title" style="margin-top:0">目标肌群</div><div class="small">'+esc(e.target)+'</div></div>';
h+='<div class="card"><div class="sec-title" style="margin-top:0">动作要领</div>';
e.cues.forEach(function(c,i){h+='<div class="cue"><i>'+(i+1)+'</i><span>'+esc(c)+'</span></div>';});h+='</div>';
h+='<div class="warn"><b>常见错误：</b>'+esc(e.mistakes.join('；'))+'</div>';
if(e.risky)h+='<div class="warn">高风险动作：零基础与强度封印期不会排进计划，建议有人保护再练。</div>';
h+='<div class="disclaimer">动作说明仅供学习参考，如有伤病请咨询专业医师或教练。</div>';openSheet(h);}
function renderMe(){var d=C.dateKey(),vol=C.volumeOf(S.logs),streak=C.streakOf(S.sessions,d);
var wk=C.weeklyVolume(S.logs,8,d),max=Math.max.apply(null,wk.map(function(x){return x.value;}).concat([1]));
var h='<div class="hero"><h2>坚持有迹可循</h2><p>数据只存在这台设备的浏览器里</p></div>';
h+='<div class="stat-grid"><div class="stat"><b>'+S.sessions.length+'</b><span>累计训练次数</span></div><div class="stat"><b>'+streak+'</b><span>连续打卡天数</span></div><div class="stat"><b>'+vol+'</b><span>累计容量 kg</span></div><div class="stat"><b>'+S.logs.filter(function(l){return l.done;}).length+'</b><span>完成组数</span></div></div>';
h+='<div class="card"><div class="sec-title" style="margin-top:0">近 8 周训练容量 (kg)</div><svg class="chart" viewBox="0 0 320 130" preserveAspectRatio="none">';
wk.forEach(function(x,i){var bh=Math.round(x.value/max*88),bx=8+i*39,by=110-bh;h+='<rect x="'+bx+'" y="'+by+'" width="26" height="'+Math.max(bh,2)+'" rx="5" fill="'+(i===7?'#FF7A45':'#166B54')+'"/>';h+='<text x="'+(bx+13)+'" y="126" font-size="9" text-anchor="middle" fill="#93A29B">'+esc(x.label)+'</text>';});
h+='</svg></div><div class="card"><div class="sec-title" style="margin-top:0">体重记录</div><div class="row2"><input class="field" id="wKg" type="number" placeholder="今日体重 kg"><button class="btn btn-primary btn-sm" data-act="save-weight" type="button">记一笔</button></div>';
if(S.weights.length){var last=S.weights[S.weights.length-1];h+='<div class="small muted">最近：'+esc(last.kg)+' kg（'+esc(last.date)+'）</div>';}
h+='</div><div class="card"><div class="sec-title" style="margin-top:0">我的设定</div><div class="list-row"><span>目标</span><b>'+esc(C.goalById(S.profile.goal).name)+'</b></div><div class="list-row"><span>经验</span><b>'+esc(S.profile.level==='new'?'零基础':(S.profile.level==='mid'?'有基础':'进阶'))+'</b></div><div class="list-row"><span>场地</span><b>'+esc(S.profile.place==='gym'?'健身房':'居家')+'</b></div><div class="list-row"><span>每周</span><b>'+S.profile.days+' 天</b></div></div>';
h+='<div class="disclaimer">序练是训练计划与记录工具，不提供医疗建议。训练前请评估自身状况；出现疼痛立即停止。数据保存在浏览器 localStorage，清除浏览器数据会一并删除。</div>';
$('v-me').innerHTML=h;}
function showSettings(){var h='<h3>设置</h3><div class="sub">调整计划或管理本地数据</div>';
h+='<button class="btn btn-ghost btn-block" data-act="restart" type="button" style="margin-bottom:8px">重新做问卷 / 换目标</button>';
h+='<button class="btn btn-ghost btn-block" data-act="export" type="button" style="margin-bottom:8px">导出训练数据 (JSON)</button>';
h+='<button class="btn btn-ghost btn-block" data-act="reset" type="button" style="margin-bottom:8px;color:#C0392B">清空全部数据</button>';
h+='<div class="disclaimer">版本 1.0 · 纯离线 · 无账号 · 无上传。</div>';openSheet(h);}
function setRecord(ex,i,field,val){var d=C.dateKey(),rec=S.logs.filter(function(l){return l.date===d&&l.exId===ex&&l.setIndex===i;})[0];
if(!rec){rec={date:d,exId:ex,setIndex:i,weight:'',reps:'',done:false,ts:Date.now()};S.logs.push(rec);}
rec[field]=C.clampInt(val,0,999,'');save();}
function toggleSet(ex,i){var d=C.dateKey(),rec=S.logs.filter(function(l){return l.date===d&&l.exId===ex&&l.setIndex===i;})[0];
if(!rec){rec={date:d,exId:ex,setIndex:i,weight:'',reps:'',done:false,ts:Date.now()};S.logs.push(rec);}
rec.done=!rec.done;rec.ts=Date.now();save();renderToday();if(rec.done&&navigator.vibrate)navigator.vibrate(30);}
function startTimer(sec){tmrLeft=C.clampInt(sec,15,300,60);$('timerFloat').hidden=false;$('timerNum').textContent=tmrLeft;
clearInterval(tmr);tmr=setInterval(function(){tmrLeft--;$('timerNum').textContent=Math.max(tmrLeft,0);if(tmrLeft<=0){clearInterval(tmr);toast('休息结束，下一组');if(navigator.vibrate)navigator.vibrate([80,60,80]);}},1000);}
function stopTimer(){clearInterval(tmr);$('timerFloat').hidden=true;}
function render(){$('topTitle').textContent={today:'今天',plan:'训练计划',lib:'动作库',me:'我的',coach:'专属方案'}[tab];
$('topSub').textContent=S.profile?(C.goalById(S.profile.goal).name+' · '+S.profile.days+' 天/周'):'先练对，再练重';
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
else if(a==='detail'){showDetail(ex);}
else if(a==='set'){toggleSet(ex,i);}
else if(a==='toggle-all'){var n=doneSets(ex,dk).length,total=parseInt(t.dataset.sets,10);
if(n>=total)S.logs=S.logs.filter(function(l){return !(l.date===dk&&l.exId===ex);});
else{for(var k=0;k<total;k++){var rec=S.logs.filter(function(l){return l.date===dk&&l.exId===ex&&l.setIndex===k;})[0];if(!rec){rec={date:dk,exId:ex,setIndex:k,weight:'',reps:'',ts:Date.now()};S.logs.push(rec);}rec.done=true;}}
save();renderToday();}
else if(a==='timer'){startTimer(t.dataset.sec);}
else if(a==='timer-stop'){stopTimer();}
else if(a==='timer-add'){tmrLeft+=30;$('timerNum').textContent=tmrLeft;}
else if(a==='finish'){if(!S.logs.some(function(l){return l.date===dk&&l.done;})){toast('先勾选至少一组再完成');return;}
if(!S.sessions.some(function(s){return s.date===dk;}))S.sessions.push({date:dk,volume:C.volumeOf(S.logs.filter(function(l){return l.date===dk;}))});
save();toast('打卡成功，明天见');render();}
else if(a==='regen'){S.plan=C.generatePlan(S.profile,C.EXERCISES);save();renderPlan();toast('计划已重新生成');}
else if(a==='save-weight'){var v=C.clampInt($('wKg').value,30,200,0);if(!v){toast('请输入体重');return;}
S.weights=S.weights.filter(function(x){return x.date!==dk;});S.weights.push({date:dk,kg:v});save();renderMe();toast('已记录');}
else if(a==='settings'){showSettings();}
else if(a==='restart'){closeSheet();S.profile=null;S.plan=null;save();boot();}
else if(a==='export'){closeSheet();openSheet('<h3>导出数据</h3><div class="sub">复制下面文本自行保存</div><textarea class="field" style="height:180px" readonly>'+esc(JSON.stringify(S))+'</textarea>');}
else if(a==='reset'){if(confirm('确定清空全部训练记录？此操作不可恢复')){S=C.emptyState();save();closeSheet();boot();toast('已清空');}}});
document.addEventListener('input',function(ev){var t=ev.target;
if(t.dataset.w!==undefined)setRecord(t.dataset.w,parseInt(t.dataset.i,10),'weight',t.value);
if(t.dataset.r!==undefined)setRecord(t.dataset.r,parseInt(t.dataset.i,10),'reps',t.value);
if(t.id==='libSearch'){libQuery=t.value;var pos=t.selectionStart;renderLib();var n=document.getElementById('libSearch');n.focus();n.setSelectionRange(pos,pos);}});
$('obNext').addEventListener('click',function(){if(obStep<3){obStep++;renderOb();}else finishOb();});
$('obBack').addEventListener('click',function(){if(obStep>0){obStep--;renderOb();}});
$('sheetMask').addEventListener('click',closeSheet);
boot();
})();