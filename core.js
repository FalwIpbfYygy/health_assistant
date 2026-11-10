/* 序练 XULIAN - 纯逻辑内核：无 DOM、无网络、零依赖。浏览器 window.FitCore / Node require */
(function(root,factory){var a=factory();if(typeof module==='object'&&module.exports)module.exports=a;if(root)root.FitCore=a;})
(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
var GROUPS=[{id:'chest',name:'胸',color:'#E8734A'},{id:'back',name:'背',color:'#3E7BD6'},{id:'shoulder',name:'肩',color:'#D69A2C'},{id:'leg',name:'腿',color:'#5B8C5A'},{id:'arm',name:'手臂',color:'#9B6BC9'},{id:'core',name:'核心',color:'#C4567E'},{id:'cardio',name:'有氧',color:'#2E9C9C'}];
var GOALS=[{id:'muscle',name:'增肌',desc:'以复合动作为主，渐进加重量',sets:4,reps:'8-10',rest:90},{id:'fat',name:'减脂',desc:'短间歇高次数，末尾加低冲击有氧',sets:3,reps:'12-15',rest:45},{id:'shape',name:'塑形',desc:'均衡容量，注重动作控制',sets:3,reps:'12',rest:60}];
var LEVELS=[{id:'new',name:'零基础',desc:'前两周强度封印，先把动作做对'},{id:'mid',name:'有基础',desc:'练过 3 个月以上'},{id:'pro',name:'进阶',desc:'熟悉自由重量'}];
var PLACES=[{id:'gym',name:'健身房',desc:'器械齐全'},{id:'home',name:'居家',desc:'哑铃 / 弹力带 / 徒手'}];
var WEEKDAY=['周一','周二','周三','周四','周五','周六','周日'];
var SPLITS={3:{slots:[0,2,4],focus:['push','pull','legs']},4:{slots:[0,1,3,4],focus:['upper','lower','upper','lower']},5:{slots:[0,1,2,3,4],focus:['chest','back','legs','shoulder','core']},6:{slots:[0,1,2,3,4,5],focus:['push','pull','legs','push','pull','legs']}};
var FOCUS_NAME={push:'推 · 胸/肩/三头',pull:'拉 · 背/二头',legs:'腿/臀/核心',upper:'上肢综合',lower:'下肢综合',chest:'胸 + 三头',back:'背 + 二头',shoulder:'肩 + 手臂',core:'核心 + 弱项补齐'};
var FOCUS_GROUPS={push:['chest','shoulder','arm'],pull:['back','arm'],legs:['leg','core'],upper:['chest','back','shoulder','arm'],lower:['leg','core'],chest:['chest','arm'],back:['back','arm'],shoulder:['shoulder','arm'],core:['core','leg']};
/* 动作库紧凑格式：[id,名称,en,部位,器械,场地(gym/home/both),等级1-3,复合1/0,风险1/0,目标肌群,要领(|分隔),常见错误] */
var RAW=[
['bb_bench','杠铃卧推','Barbell Bench Press','chest','杠铃','g',2,1,0,'胸大肌/三头','肩胛后缩下沉贴凳|下放至乳头连线且小臂垂直|推起不锁死手肘','耸肩借力导致肩前侧发酸'],
['db_bench','哑铃平板卧推','Dumbbell Bench Press','chest','哑铃','b',1,1,0,'胸大肌/三头','起始哑铃在胸两侧掌心朝脚|手肘约45度不要完全外展|顶端哑铃靠近但不碰撞','手肘90度外展挤压肩关节'],
['incline_db','上斜哑铃卧推','Incline Dumbbell Press','chest','哑铃','b',2,1,0,'上胸/三角肌前束','凳面30度即可过高变推肩|沿胸上方推起轨迹略内收|手腕保持中立不后折','凳角超过60度'],
['machine_press','坐姿器械推胸','Machine Chest Press','chest','固定器械','g',1,0,0,'胸大肌','把手调至与胸中部同高|肩胛贴靠背垫推出时不含胸|回放至胸部有拉伸感','座位过低或耸肩顶配重'],
['pushup','俯卧撑','Push-up','chest','徒手','b',1,1,0,'胸大肌/三头/核心','头到脚跟成一条直线|手肘约45度向后不向外撇|下放至胸口离地一拳','塌腰翘臀或颈部前伸'],
['cable_fly','绳索夹胸','Cable Fly','chest','龙门架','g',2,0,0,'胸大肌内侧','手肘微屈固定像抱大树|用肘带动而不是用手拉|顶端停一秒挤压','屈肘过多变成推'],
['lat_pulldown','高位下拉','Lat Pulldown','back','固定器械','g',1,1,0,'背阔肌/肱二头肌','先沉肩胛再屈肘拉|拉至锁骨上沿躯干后倾10度|回放让肩胛充分上提','颈后下拉或大幅后仰借力'],
['seated_row','坐姿绳索划船','Seated Cable Row','back','固定器械','g',1,1,0,'中背部/背阔肌','挺胸后肩胛后缩启动|拉向肚脐手肘贴身向后|回放不含胸驼背','用腰前后晃动带重量'],
['db_row','单臂哑铃划船','Single-arm DB Row','back','哑铃','b',1,1,0,'背阔肌/中背部','一手一膝撑凳背部平直|先肩胛后缩再拉肘向髋|顶端停一秒缓慢下放','躯干跟着旋转借力'],
['face_pull','面拉','Face Pull','back','龙门架/弹力带','b',1,0,0,'三角肌后束/肩袖','绳索设在眉心高度|拉向额头同时外旋手高于肘|感受中背发酸','重量过大变成划船或耸肩'],
['straight_arm_pushdown','直臂下压','Straight-arm Pushdown','back','龙门架','g',2,0,0,'背阔肌','手肘微屈固定全程角度不变|只靠背阔肌把杆压到大腿前|顶端充分拉伸','屈肘变成三头下压'],
['assisted_pullup','辅助引体/离心引体','Assisted Pull-up','back','引体辅助器','g',2,1,0,'背阔肌/肱二头肌','先挂住沉肩胛再拉|上拉到锁骨缓慢下放3-5秒|做不起来就只练离心','甩腿蹬腿借力'],
['band_row','弹力带划船','Band Row','back','弹力带','h',1,1,0,'中背部/背阔肌','坐地腿伸直带子绕脚掌|挺胸沉肩把手肘拉向体侧|顶端夹紧肩胛停一秒','含胸驼背或只用手臂'],
['db_shoulder_press','哑铃推肩','Dumbbell Shoulder Press','shoulder','哑铃','b',2,1,0,'三角肌前束/中束','坐稳收腹别让腰反弓|起始哑铃在耳侧小臂垂直|顶端不锁肘不压斜方肌','颈后推是肩关节红线'],
['machine_shoulder_press','器械推肩','Machine Shoulder Press','shoulder','固定器械','g',1,0,0,'三角肌前束/中束','把手调到与耳朵同高|腰背贴实靠垫核心收紧|缓慢回放不靠惯性','座位过低变成上斜推胸'],
['lateral_raise','哑铃侧平举','Lateral Raise','shoulder','哑铃','b',1,0,0,'三角肌中束','手肘微屈小指略高于拇指|举到肩膀高度即可|想象用肘往两侧远处送','重量过大靠甩导致斜方肌代偿'],
['rear_delt_fly','俯身反向飞鸟','Rear Delt Fly','shoulder','哑铃','b',2,0,0,'三角肌后束/中背','髋部折叠背部平直|手肘微屈固定向两侧打开|顶端肩胛微微收拢','用腰直起来带重量'],
['band_external_rotation','弹力带肩外旋','Band External Rotation','shoulder','弹力带','b',1,0,0,'肩袖/冈下肌','大臂贴身肘屈90度|只让前臂向外转|最轻阻力慢速控制','大臂离开身体或用躯干旋转'],
['goblet_squat','高脚杯深蹲','Goblet Squat','leg','哑铃','b',1,1,0,'股四头肌/臀大肌/核心','哑铃贴胸手肘朝下|膝盖对准脚尖臀部向后坐|蹲到大腿平行脚跟不抬','膝盖内扣或含胸弓背'],
['leg_press','器械腿举','Leg Press','leg','固定器械','g',1,1,0,'股四头肌/臀大肌','腰臀贴实座椅别卷骨盆|下放到膝盖约90度即停|推起不锁死膝盖','下放过深导致骨盆后倾'],
['bb_squat','杠铃深蹲','Barbell Back Squat','leg','杠铃','g',3,1,1,'股四头肌/臀大肌/竖脊肌','杠位稳定肩胛收紧|全程核心绷紧膝跟脚尖同向|蹲到大腿平行或略低','底部圆腰（骨盆眨眼）'],
['rdl','罗马尼亚硬拉','Romanian Deadlift','leg','杠铃/哑铃','g',3,1,1,'腘绳肌/臀大肌','膝微屈固定髋部向后推|杠铃贴腿下行背部平直|感到拉伸即停靠臀起身','弯腰下放或蹲成深蹲'],
['bulgarian_split','保加利亚分腿蹲','Bulgarian Split Squat','leg','哑铃/徒手','b',2,1,0,'股四头肌/臀大肌','后脚搭凳前脚距离适中|重心压前脚垂直下沉|上身略前倾膝不内扣','前脚过近顶膝盖'],
['leg_curl','坐姿腿弯举','Leg Curl','leg','固定器械','g',1,0,0,'腘绳肌','膝轴对准机器转轴|下压到底停一秒再放回|臀部不离开座椅','抬臀借力或回放甩配重'],
['calf_raise','站姿提踵','Calf Raise','leg','徒手/器械','b',1,0,0,'腓肠肌/比目鱼肌','脚掌前半踩稳脚跟悬空|抬到最高停一秒|缓慢下放充分拉伸','靠弹震上下'],
['db_curl','哑铃弯举','Dumbbell Curl','arm','哑铃','b',1,0,0,'肱二头肌','大臂夹紧体侧不动|只弯前臂顶端停一秒|下放接近伸直不锁肘','甩腰借力或大臂摆动'],
['hammer_curl','锤式弯举','Hammer Curl','arm','哑铃','b',1,0,0,'肱桡肌/肱二头肌','掌心相对全程中立握|大臂固定缓慢起落|顶端不翻转手腕','用手腕甩'],
['cable_pushdown','绳索下压','Triceps Pushdown','arm','龙门架','g',1,0,0,'肱三头肌','大臂贴身夹紧肘当铰链|压到底略分开绳索|回放让小臂接近平行地面','大臂前移或靠身体下压'],
['overhead_extension','过顶哑铃臂屈伸','Overhead Triceps Extension','arm','哑铃','b',2,0,0,'肱三头肌长头','大臂贴近耳朵固定|只动前臂缓慢下放脑后|顶端不锁死手肘','大臂乱晃或腰部反弓'],
['close_grip_bench','窄距卧推','Close-grip Bench Press','arm','杠铃','g',2,1,0,'肱三头肌/胸大肌','握距略窄于肩手肘贴身|下放至下胸小臂垂直|别让手肘向外张开','握距过窄伤手腕'],
['plank','平板支撑','Plank','core','徒手','b',1,0,0,'腹横肌/核心稳定','肘在肩正下方收腹夹臀|头到脚跟一条直线|均匀呼吸不憋气','臀部抬太高或塌腰'],
['dead_bug','死虫','Dead Bug','core','徒手','b',1,0,0,'腹横肌/核心抗伸展','腰背贴地腰椎不悬空|对侧手脚缓慢伸出|腰一拱起就缩小幅度','动作过快甩动'],
['bird_dog','鸟狗','Bird Dog','core','徒手','b',1,0,0,'核心抗旋转/竖脊肌','四点跪姿骨盆水平|对侧手脚伸到与躯干平行|顶端停两秒别让腰晃','塌腰或扭胯'],
['lying_leg_raise','仰卧举腿','Lying Leg Raise','core','徒手','b',2,0,0,'下腹部','腰背压实地面双手垫臀下|双腿下放到腰要拱起前停|全程慢速不借惯性','腰部离地'],
['pallof_press','Pallof 抗旋转推','Pallof Press','core','龙门架/弹力带','b',2,0,0,'腹斜肌/核心抗旋转','侧对锚点双手贴胸|推出时抵抗身体旋转|顶端停两秒再收回','躯干被带转'],
['brisk_walk','坡度快走','Incline Walk','cardio','跑步机/户外','b',1,0,0,'心肺/脂肪供能','坡度6-10速度能说完整句子|摆臂自然不扶扶手|保持15-25分钟匀速','抓扶手把强度走没了'],
['elliptical','椭圆机','Elliptical','cardio','固定器械','g',1,0,0,'心肺/低冲击有氧','挺胸站稳脚掌全程贴合踏板|阻力与步频平衡不空转|保持15-25分钟','含胸驼背压把手'],
['rowing_machine','划船机','Rowing Machine','cardio','固定器械','g',2,0,0,'心肺/全身协调','顺序：腿蹬→髋展开→手拉|回程反向：手→髋→腿|背部保持平直','一上来就用手拉']
];
var E=RAW.map(function(r){return {id:r[0],name:r[1],en:r[2],group:r[3],equip:r[4],place:r[5]==='g'?['gym']:(r[5]==='h'?['home']:['gym','home']),level:r[6],compound:!!r[7],risky:!!r[8],target:r[9],cues:r[10].split('|'),mistakes:[r[11]]};});
var EX_BY_ID={};E.forEach(function(e){EX_BY_ID[e.id]=e;});

/* === v1.1 derived exercise metadata (public build, pure functions) === */
var EQUIP_MAP=[['\u6760\u94c3','barbell'],['\u54d1\u94c3','dumbbell'],['\u5f92\u624b','bodyweight'],['\u56fa\u5b9a\u5668\u68b0','machine'],['\u9f99\u95e8\u67b6','cable'],['\u5f39\u529b\u5e26','band'],['\u5f15\u4f53\u8f85\u52a9\u5668','machine'],['\u8dd1\u6b65\u673a','cardio'],['\u6237\u5916','cardio'],['\u5668\u68b0','machine']];
function equipKeys(e){var s=(e&&e.equip)||'',out=[];EQUIP_MAP.forEach(function(p){if(s.indexOf(p[0])>=0&&out.indexOf(p[1])<0)out.push(p[1]);});return out.length?out:['other'];}
function levelName(n){return n===1?'\u5165\u95e8':(n===2?'\u8fdb\u9636':'\u9ad8\u9636');}
function inputMode(e){if(e&&e.group==='cardio')return 'time';var ks=equipKeys(e);var soft=ks.every(function(k){return k==='bodyweight'||k==='band';});return soft?'reps':'weight';}
function needsWeight(e){return inputMode(e)==='weight';}
function demoOf(e){return 'assets/demo/'+((e&&e.id)?e.id:'_missing')+'.svg';}
var PREP={chest:'\u80a1\u80e1\u540e\u6536\u4e0b\u6c89\uff0c\u7a7a\u6746/\u6700\u8f7b\u6863\u7a7a\u4e3e 1 \u7ec4\uff0c\u5148\u6fc0\u6d3b\u80f8\u4e0e\u4e09\u5934\u3002',back:'\u5148\u505a 2 \u6b21\u80a1\u80e1\u540e\u6536\u4e0b\u6c89\uff0c\u6700\u8f7b\u6863\u62c9 1 \u7ec4\u627e\u56de\u80cc\u90e8\u53d1\u529b\u611f\u3002',shoulder:'\u80a9\u7ed5\u73af + \u6700\u8f7b\u54d1\u94c3\u7a7a\u4e3e 1 \u7ec4\uff0c\u8116\u5b50\u653e\u677e\u3001\u4e0d\u8018\u80a9\u3002',leg:'\u5f92\u624b\u6df1\u8e72\u4e0e\u81c0\u6865\u5404 10 \u6b21\u70ed\u8eab\uff0c\u819d\u76d6\u5bf9\u51c6\u811a\u5c16\u3002',arm:'\u6700\u8f7b\u91cd\u91cf\u5c48\u4f38 1 \u7ec4\uff0c\u628a\u81c2\u5173\u8282\u6d3b\u52a8\u5f00\u3002',core:'\u732b\u725b 8 \u6b21 + 90/90 \u547c\u5438\uff0c\u8170\u80cc\u5148\u538b\u5b9e\u5730\u9762\u3002',cardio:'\u5761\u5ea6/\u963b\u529b\u4ece\u6700\u4f4e\u6863\u8d77\u6b65\uff0c\u5f3a\u5ea6\u4ee5\u80fd\u8bf4\u5b8c\u6574\u53e5\u5b50\u4e3a\u51c6\u3002'};
function prepOf(e){return PREP[e&&e.group]||'\u5148\u7528\u6700\u8f7b\u963b\u529b\u505a 1 \u7ec4\u70ed\u8eab\uff0c\u6fc0\u6d3b\u76ee\u6807\u90e8\u4f4d\u3002';}
function planDisclaimer(p){p=p||{};if(p.level==='new')return '\u96f6\u57fa\u7840\uff1a\u81ea\u52a8\u6392\u9664\u6760\u94c3\u6df1\u8e72\u3001\u786c\u62c9\u7b49\u9ad8\u98ce\u9669\u52a8\u4f5c\uff0c\u7edf\u4e00\u964d\u5230 3 \u7ec4\uff1b\u524d\u4e24\u5468\u5f3a\u5ea6\u5c01\u5370\uff0c\u4e0d\u52a0\u91cd\u91cf\u3002';if(p.level==='pro')return '\u8fdb\u9636\uff1a\u5f00\u653e\u5168\u90e8\u52a8\u4f5c\uff08\u542b\u6760\u94c3\u6df1\u8e72\u3001\u786c\u62c9\u7b49\uff09\uff0c\u6309\u76ee\u6807\u5b89\u6392\u7ec4\u6570\u4e0e\u95f4\u6b47\u3002';return '\u6709\u57fa\u7840\uff1a\u590d\u5408\u52a8\u4f5c + \u5b64\u7acb\u52a8\u4f5c\u642d\u914d\uff0c\u6309\u76ee\u6807\u5b89\u6392\u7ec4\u6570\u4e0e\u95f4\u6b47\uff0c\u91cd\u91cf\u5faa\u5e8f\u6e10\u8fdb\u3002';}

function clampInt(v,min,max,def){var n=parseInt(v,10);if(isNaN(n))return def;return n<min?min:(n>max?max:n);}
function goalById(id){for(var i=0;i<GOALS.length;i++)if(GOALS[i].id===id)return GOALS[i];return GOALS[0];}
function groupById(id){for(var i=0;i<GROUPS.length;i++)if(GROUPS[i].id===id)return GROUPS[i];return GROUPS[0];}
function exById(id,lib){var a=lib||E;for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null;}
function bodyNum(v,min,max,def){var n=Number(v);if(!isFinite(n)||n<=0)return def;return clampInt(n,min,max,def);}
function validateProfile(p){p=p||{};var ok=function(a,id){return a.some(function(x){return x.id===id;});};var d=[3,4,5,6].indexOf(Number(p.days))>=0?Number(p.days):3;return {goal:ok(GOALS,p.goal)?p.goal:'muscle',level:ok(LEVELS,p.level)?p.level:'new',place:ok(PLACES,p.place)?p.place:'gym',days:d,height:bodyNum(p.height,120,220,170),weight:bodyNum(p.weight,30,200,65)};}
function pickExercises(focus,profile,count,lib){
var groups=FOCUS_GROUPS[focus]||['chest'];
var maxLevel=profile.level==='new'?1:(profile.level==='mid'?2:3);
var pool=lib.filter(function(e){return groups.indexOf(e.group)>=0&&e.place.indexOf(profile.place)>=0&&e.level<=maxLevel&&!(profile.level==='new'&&e.risky);});
pool.sort(function(a,b){var ac=a.compound?0:1,bc=b.compound?0:1;if(ac!==bc)return ac-bc;if(a.level!==b.level)return a.level-b.level;return a.id<b.id?-1:(a.id>b.id?1:0);});
var byGroup={};groups.forEach(function(g){byGroup[g]=[];});pool.forEach(function(e){byGroup[e.group].push(e);});
var picked=[],seen={},round=0;
while(picked.length<count&&round<20){var added=false;
groups.forEach(function(g){var b=byGroup[g];if(picked.length<count&&b[round]&&!seen[b[round].id]){seen[b[round].id]=true;picked.push(b[round]);added=true;}});
if(!added)pool.forEach(function(e){if(picked.length<count&&!seen[e.id]){seen[e.id]=true;picked.push(e);}});
round++;}
return picked;}
/* 生成一周计划：纯函数，同输入永远同输出 */
function generatePlan(raw,lib){var p=validateProfile(raw);var list=lib||E;var split=SPLITS[p.days];var goal=goalById(p.goal);
var isNew=p.level==='new';var count=isNew?4:(p.level==='mid'?5:6);var sets=isNew?3:goal.sets;var reps=isNew?'10-12':goal.reps;var rest=isNew?75:goal.rest;
var week=WEEKDAY.map(function(name,d){var slot=split.slots.indexOf(d);
if(slot<0)return {day:d,weekday:name,rest:true,title:'休息 / 主动恢复',focus:null,items:[],note:'散步 20 分钟或做 10 分钟拉伸，帮助恢复。'};
var focus=split.focus[slot];var items=pickExercises(focus,p,count,list).map(function(e,i){return {exId:e.id,order:i,sets:sets,reps:reps,rest:rest};});
if(p.goal==='fat'){var c=list.filter(function(e){return e.group==='cardio'&&e.place.indexOf(p.place)>=0;})[0];if(c)items.push({exId:c.id,order:items.length,sets:1,reps:'15-25 分钟',rest:0});}
return {day:d,weekday:name,rest:false,title:FOCUS_NAME[focus],focus:focus,items:items,note:isNew?'强度封印：前两周不加重量，先把每个动作做标准。':'保持动作节奏，组间别刷太久手机。'};});
return {id:'plan-'+p.goal+'-'+p.level+'-'+p.place+'-'+p.days,profile:p,week:week};}
function pad2(n){return n<10?'0'+n:''+n;}
function dateKey(d){var x=d?new Date(d):new Date();return x.getFullYear()+'-'+pad2(x.getMonth()+1)+'-'+pad2(x.getDate());}
function weekdayIndex(d){var x=d?new Date(d):new Date();return (x.getDay()+6)%7;}
function isoWeekStart(key){var a=String(key).split('-');var d=new Date(+a[0],+a[1]-1,+a[2]);d.setDate(d.getDate()-weekdayIndex(d));return dateKey(d);}
function volumeOf(logs){var t=0;(logs||[]).forEach(function(l){if(l.done){var w=Number(l.weight)||0,r=Number(l.reps)||0;if(w>0&&r>0)t+=w*r;}});return Math.round(t);}
function streakOf(sessions,today){var set={};(sessions||[]).forEach(function(s){if(s&&s.date)set[s.date]=true;});var base=today?new Date(today):new Date();if(!set[dateKey(base)])base.setDate(base.getDate()-1);var n=0,g=0;while(set[dateKey(base)]&&g<3660){n++;g++;base.setDate(base.getDate()-1);}return n;}
function weeklyVolume(logs,n,today){n=clampInt(n,1,52,8);var buckets={},order=[],i;var base=today?new Date(today):new Date();base.setDate(base.getDate()-weekdayIndex(base));
for(i=n-1;i>=0;i--){var d=new Date(base);d.setDate(d.getDate()-7*i);var k=dateKey(d);buckets[k]=0;order.push(k);}
(logs||[]).forEach(function(l){if(!l||!l.done||!l.date)return;var k=isoWeekStart(l.date);if(Object.prototype.hasOwnProperty.call(buckets,k)){buckets[k]+=(Number(l.weight)||0)*(Number(l.reps)||0);}});
return order.map(function(k,idx){return {label:idx===n-1?'本周':(n-idx-1)+'周前',value:Math.round(buckets[k]),weekStart:k};});}
function lastLift(logs,exId){var best=null;(logs||[]).forEach(function(l){if(!l||l.exId!==exId||!l.done||!l.date)return;if(!best||l.date>best.date||(l.date===best.date&&(l.ts||0)>(best.ts||0)))best=l;});return best?{weight:best.weight,reps:best.reps}:null;}
function escapeHtml(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function emptyState(){return {v:1,profile:null,plan:null,logs:[],sessions:[],weights:[],settings:{restSec:60}};}
function normalizeState(raw){var s=emptyState();if(!raw||typeof raw!=='object')return s;
if(raw.profile&&typeof raw.profile==='object'){s.profile=raw.profile;s.plan=raw.plan||null;}
s.logs=Array.isArray(raw.logs)?raw.logs.filter(function(x){return x&&typeof x==='object';}):[];
s.sessions=Array.isArray(raw.sessions)?raw.sessions.filter(function(x){return x&&typeof x==='object'&&x.date;}):[];
s.weights=Array.isArray(raw.weights)?raw.weights.filter(function(x){return x&&x.date&&!isNaN(Number(x.kg));}):[];
if(raw.settings&&typeof raw.settings==='object')s.settings.restSec=clampInt(raw.settings.restSec,15,300,60);
return s;}
return {GROUPS:GROUPS,GOALS:GOALS,LEVELS:LEVELS,PLACES:PLACES,WEEKDAY:WEEKDAY,SPLITS:SPLITS,FOCUS_NAME:FOCUS_NAME,EXERCISES:E,EX_BY_ID:EX_BY_ID,equipKeys:equipKeys,levelName:levelName,inputMode:inputMode,needsWeight:needsWeight,demoOf:demoOf,prepOf:prepOf,planDisclaimer:planDisclaimer,validateProfile:validateProfile,generatePlan:generatePlan,pickExercises:pickExercises,goalById:goalById,groupById:groupById,exById:exById,dateKey:dateKey,weekdayIndex:weekdayIndex,isoWeekStart:isoWeekStart,volumeOf:volumeOf,streakOf:streakOf,weeklyVolume:weeklyVolume,lastLift:lastLift,escapeHtml:escapeHtml,clampInt:clampInt,emptyState:emptyState,normalizeState:normalizeState};
});
