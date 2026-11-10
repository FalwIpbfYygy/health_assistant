(function(){
'use strict';
var C=window.FitCore,SK='xulian.v1',MK='xulian.coach.v1';
var P={goal:'muscle',level:'new',place:'gym',days:3,height:170,weight:65,coach:true};
function esc(s){return C.escapeHtml(s);}
var A=[
 {id:'bb_bench',sets:3,reps:'8',rest:90,load:'空杆 / 固定器械最轻档',cue:['肩胛后收压实，全程不耸肩','脖子放松、下巴微收','眼睛盯天花板一个固定点','下放数 3 秒，不顶力竭']},
 {id:'db_shoulder_press',sets:3,reps:'8',rest:90,load:'最轻档哑铃',cue:['别死抓哑铃，多用肩的力量推','头不偏、看镜中眉心','下放 3 秒','第 3 组做不满 8 下就停，不补']},
 {id:'face_pull',sets:3,reps:'12',rest:60,load:'弹力带 / 龙门架最轻档',cue:['拉到眉心、肘不高于肩','脖子不往前探','回放 3 秒','要肩胛骨中间酸，不是脖子酸']}
];
var B=[
 {id:'assisted_pullup',sets:4,reps:'3',rest:90,load:'辅助引体，只练离心',cue:['踩辅助到顶，4 秒慢放','不许掉下来','肩胛先下沉再放','脖子放松、眼看正前方一点']},
 {id:'seated_row',sets:3,reps:'10',rest:90,load:'器械最轻档',cue:['不耸肩、不后仰借力','拉到下腹停 1 秒','回放 3 秒']},
 {id:'band_external_rotation',sets:3,reps:'12',rest:60,load:'弹力带最轻档 / 靠墙天使',cue:['大臂贴身不抬、肩不往上跑','肋骨别翻','宁可少做几次也别快']}
];
var D=[
 {id:'face_pull',sets:3,reps:'12',rest:60,load:'弹力带最轻档',cue:['不耸肩','回放 3 秒','要中背酸']},
 {id:'band_external_rotation',sets:3,reps:'12',rest:60,load:'弹力带最轻档',cue:['大臂贴身','肩不往上跑']},
 {id:'dead_bug',sets:3,reps:'8',rest:60,load:'徒手',cue:['腰贴地不塌','慢，不甩腿','核心不稳就减次数']}
];
var ERRORS=[
 ['耸肩 / 斜方肌代偿','肩膀往上缩、斜方肌抢戏、脖子先酸','每组启动前先做 2 次肩胛后收下沉（把肩胛骨塞进后背口袋），保持住再推；手别死抓；脖子先酸就停，这组不算'],
 ['脖子紧、头偏、眼睛乱飘','头歪、眼神乱飘、全身绷紧','全程只盯一个固定点（镜中眉心或器械正前方），下巴微收做双下巴；轨迹用余光看，不转头去追'],
 ['离心失控、下放掉下来','下放直接掉、没有控制','所有动作统一 3 秒慢放 + 1 秒推起，心里数 1-2-3；引体第一周只练离心，踩辅助到顶后 4 秒慢放，不要求拉上去']
];
var RULES=[
 '所有动作从退阶 / 空杆 / 最轻重量开始；前两周一律不加重量。',
 '一周 2-3 次，每次 2-3 个动作，40-50 分钟。时间多不等于该多练，零基础普遍卡在肩胛稳不住、脖子乱代偿。',
 '每个动作都带错误提醒：不耸肩、脖子放松、眼睛固定看一个点、离心 3 秒慢放。',
 '每次至少 1 个背部 / 肩袖稳定动作，专门对抗驼背和肩胛前引。',
 '每周只认一条升级信号，达标才准升；一次只升一样，不许卧推和推肩同时加。',
 '不做大重量深蹲 / 硬拉 / 颈后推，不跑步、不跳绳、不 HIIT；有氧只有热身 5-8 分钟和休息日散步。',
 '蛋白按体重(kg) × 1.8g / 天：4 个蛋 + 3 份掌心肉 + 1 杯奶 + 1 份豆制品（按体重换算份量）。',
 '体脂偏高别猛吃：体重基本不动、蛋白拉满、力量往上走。猛加热量只会胖得更快。'
];
var UPGRADE=[
 ['第 1 周','3×8 全程不耸肩、脖子不紧、慢放 3 秒','达标才进下一档'],
 ['第 2 周','卧推 3×10、推肩 3×12','连续两次训练都稳'],
 ['第 3 周','加 2.5kg（两边各 1.25kg）；组数升到 4 组','一次只改一样'],
 ['第 4 周起','空杆当热身，再考虑第二个动作加重量','别跳步']
];
var MEALS=[
 ['周一 练A','沙县鸡腿饭：去皮、加卤蛋、加青菜、饭半份、浇汁另放，再单点 1 个鸡腿','黄焖鸡：少油少盐、去皮、加青菜加蛋，汤别泡饭'],
 ['周二','兰州拉面：加双份牛肉 + 卤蛋，面少，不要油泼辣子','麻辣烫：清汤不喝汤，多鸡蛋 / 豆腐 / 豆皮 / 瘦肉，不点丸类、午餐肉、油条'],
 ['周三','轻食：双份鸡胸 + 加蛋，酱另放只用一半','沙县鸡腿饭，同周一点法'],
 ['周四 练B','麻辣烫，同周二点法','兰州双份牛肉 + 卤蛋'],
 ['周五','黄焖鸡，去皮少油 + 加蛋加青菜','便利店兜底：即食鸡胸 1 盒 + 2 茶叶蛋 + 无糖酸奶'],
 ['周六','沙县鸡腿饭，同周一点法','轻食双份鸡胸 + 蛋'],
 ['周日','快餐：一掌心瘦肉 + 2 蛋 + 青菜，饭半份','麻辣烫清汤 + 豆制品瘦肉']
];
var FALLBACK=[
 '不管点什么，每餐多加一份肉或 2 个蛋（沙县加鸡腿、拉面加牛肉、麻辣烫多夹两份豆皮）。',
 '训练日训练后 1 小时内吃一顿有肉的正餐。',
 '当天明显没吃够，睡前补便利店即食鸡胸 1 盒 + 2 个茶叶蛋。底线约 100g 蛋白。'
];
var SLEEP=[
 '训练收尾 8 分钟：门框胸大肌拉伸 30 秒 ×2 → 上斜方肌拉伸 30 秒 ×2 → 婴儿式背阔拉伸 60 秒 → 仰卧 90/90 呼吸 2 分钟（吸 4 秒、呼 6 秒）。',
 '睡前 4-7-8 呼吸 4 轮：鼻吸 4 秒 → 屏 7 秒 → 口呼 8 秒，躺着做，呼完别数数、别看手机。',
 '固定 8:00 起床比固定几点睡更管用；训练排在上午或下午 4 点前结束，晚上练完交感兴奋反而更难睡。',
 '状态差到完全不想练的日子：最低配训练 = 10 分钟拉伸 + 3 组面拉，算打卡不断。连续性能救你，强度不能。'
];
var STANDARD=[
 '空杆卧推 3×10、3 秒慢放、全程不耸肩脖子不紧，空杆从累变成热身。',
 '哑铃推肩最轻档 3×12，酸在肩中束，不是脖子 / 斜方肌。',
 '辅助引体离心 4 秒 ×3 下 ×4 组，不再掉下来。',
 '面拉 3×15，肩胛骨中间酸，脖子不酸。',
 '靠墙站：后脑勺 + 上背 + 臀三点贴墙，稳住 60 秒。',
 '4 次训练全勤（2 次/周 × 2 周），训练当晚更容易放松下来。',
 '体重不要求涨，允许上下 1kg；看镜子肩打开的程度和训练记录，不看秤。'
];
function plan(){
 var w=C.WEEKDAY.map(function(name,d){
  var src=null,title='休息 / 主动恢复',note='散步 20 分钟，或做 8 分钟拉伸 + 3 组面拉（最低配训练，算打卡）。';
  if(d===0){src=A;title='训练 A · 推 + 肩胛';note='强度封印：空杆 / 最轻档，前两周不加重量。今天只练 3 个动作，做标准比做多重要。';}
  if(d===3){src=B;title='训练 B · 拉 + 肩袖';note='引体只练离心 4 秒慢放，不要求拉上去。肩不耸、脖子不紧，这组才算。';}
  if(d===5){src=D;title='体态专项（可选）';note='状态差就跳过，不算断。10-15 分钟，全部最轻档。';}
  return {day:d,weekday:name,rest:!src,title:title,focus:null,items:(src||[]).map(function(x,i){return {exId:x.id,order:i,sets:x.sets,reps:x.reps,rest:x.rest,load:x.load};}),note:note};
 });
 return {id:'coach-zero-to-muscle-v1',profile:P,week:w};
}
function apply(reload){
 var st;
 try{st=C.normalizeState(JSON.parse(localStorage.getItem(SK)||'null'));}catch(e){st=C.normalizeState(null);}
 st.profile=P;st.plan=plan();
 if(!st.weights||!st.weights.length)st.weights=[{date:C.dateKey(),kg:70}];
 var ok=false;try{localStorage.setItem(SK,JSON.stringify(st));localStorage.setItem(MK,'1');ok=true;}catch(e){}
 if(reload&&ok&&window.location&&window.location.reload)window.location.reload();
}
function auto(){
 /* public build: never overwrite anyone's profile/plan. New users go through the generic questionnaire; existing users keep their own plan. */
}
function badge(s){return '<span class="coach-tag">'+esc(s)+'</span>';}
function exBlock(list){
 return list.map(function(x){
  var e=C.EX_BY_ID[x.id],name=e?e.name:x.id;
  return '<div class="coach-ex"><div class="coach-ex-h"><b>'+esc(name)+'</b><span>'+x.sets+' 组 × '+esc(x.reps)+' 次 · 休息 '+x.rest+'s</span></div><div class="coach-load">'+esc(x.load)+'</div><ul>'+x.cue.map(function(c){return '<li>'+esc(c)+'</li>';}).join('')+'</ul></div>';
 }).join('');
}
function sec(title,body){return '<section class="coach-sec"><h3>'+esc(title)+'</h3>'+body+'</section>';}
function ul(arr){return '<ul class="coach-ul">'+arr.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';}
function html(){
 var h=[];
 h.push('<div class="coach-hero"><div class="coach-kicker">新手入门 · 通用指南</div><h2>先练对，再练重。</h2><p>刚开始别急着追重量。前两周把动作做标准：肩胛稳住、离心控住、脖子放松。健身骗不了人，练多少得多少。</p></div>');
h.push(sec('新手从这里开始','<p>刚开始建议从空杆 / 最轻档起步，推肩用最轻哑铃，引体先练离心，每次带上背部和肩袖稳定动作。重量不是起点，动作质量才是。</p><div class="note-bar">前两周先不加重量，把动作做标准比做多重要。</div>'));
 h.push(sec('先改这 3 个动作错误',ERRORS.map(function(e){return '<div class="coach-ex"><div class="coach-ex-h"><b>'+esc(e[0])+'</b><span>常见表现：'+esc(e[1])+'</span></div><p>'+esc(e[2])+'</p></div>';}).join('')+'<div class="note-bar">这三个不解决，加重量毫无意义——一大半是耸肩和失控漏掉的力，不是胸没力气。</div>'));
 h.push(sec('第一周训练计划','<div class="coach-sub">一周 2 次（周一 A / 周四 B），隔天；每次 40-50 分钟 = 热身 8 分钟 + 3 个动作约 28 分钟 + 收尾拉伸 8 分钟。周六体态专项可选。热身只用快走 5 分钟 + 肩绕环 / 猫牛 / 胸椎伸展。</div><h4>训练 A · 推 + 肩胛</h4>'+exBlock(A)+'<h4>训练 B · 拉 + 肩袖</h4>'+exBlock(B)+'<h4>体态专项（周六可选，状态差就跳过）</h4>'+exBlock(D)+'<div class="note-bar">两次都含体态动作（面拉 / 肩外旋），专门对抗肩胛前引和上斜方代偿。</div>'));
 h.push(sec('升级信号：一周一条，看得见才准升','<div class="coach-steps">'+UPGRADE.map(function(u,i){return '<div class="coach-step"><b>'+esc(u[0])+'</b><span>'+esc(u[1])+'</span><i>'+esc(u[2])+'</i></div>';}).join('')+'</div><div class="note-bar">第一周按 3 组封印；第 3 周稳了再升到 4 组。加重量必须是 2.5kg 不是 5kg，一次只改一样。</div>'));
 h.push(sec('铁律',ul(RULES)));
 h.push(sec('一周外卖对照表','<div class="coach-sub">早餐每天固定：2 个鸡蛋 + 1 杯无糖豆浆 / 牛奶 + 1 份主食，约 22g 蛋白。训练日晚餐放在训练后 1 小时内。</div><div class="coach-meals">'+MEALS.map(function(m){return '<div class="coach-meal"><b>'+esc(m[0])+'</b><div><span>午餐</span>'+esc(m[1])+'</div><div><span>晚餐</span>'+esc(m[2])+'</div></div>';}).join('')+'</div>'));
 h.push(sec('蛋白公式：体重(kg) × 1.8g / 天','<p>体重(kg) × 1.8g，recomp 期要顶格。<b>4 个鸡蛋（约 26g）+ 3 份掌心大小的肉（每份 100-120g 熟重，约 70g）+ 1 杯奶 / 豆浆（8g）+ 1 份豆制品（12g）+ 主食青菜零头（14g）</b>。最简记法：每餐「1 掌心肉 + 1 个蛋」，再加早晚各 1 个蛋和 1 杯奶，基本就够。</p><h4>最低配版：完全不改点外卖的习惯，也照样进步</h4>'+ul(FALLBACK)+'<div class="note-bar">前两周的进步主要来自神经适应（动作变稳、空杆变轻），不是长肌肉，所以这个底线照样能让你看见变化。</div>'));
 h.push(sec('睡眠 / 恢复 / 状态差',ul(SLEEP)));
 h.push(sec('2 周后你应该达到的明确标准',ul(STANDARD)));
 h.push('<section class="coach-sec"><div class="disclaimer">这是通用入门建议，仅供参考，不会改动你的训练计划或记录。要按自己的目标排计划，请在「设置」里重新做问卷；本页所有内容都在本地，不上传。</div></section>');
 h.push('<div class="coach-quote">新手的路：把重量放轻、把动作练对，前两周只盯一件事——肩膀别抢戏。坚持两个月，空杆就能当热身。</div>');
 return h.join('');
}
function render(){var el=document.getElementById('v-coach');if(el)el.innerHTML=html();}
function $(id){return document.getElementById(id);}
function strip(){
 var s=$('coachStrip');if(!s)return;
 var d=C.weekdayIndex(),p=null;
 try{p=JSON.parse(localStorage.getItem(SK)||'null');}catch(e){}
 var day=p&&p.plan&&p.plan.week?p.plan.week[d]:null;
 var txt='新手入门指南 · 今天'+(day&&!day.rest?'练 '+esc(day.title):'休息 / 主动恢复');
 s.innerHTML='<span>'+txt+'</span><b>查看 ›</b>';
}
function sync(){
 var s=$('coachStrip'),m=$('main');
 if(s&&m)s.hidden=m.hidden||curTab!=='today';
}
var curTab='today';
function boot(){
 strip();sync();render();
 document.addEventListener('click',function(ev){
  var t=ev.target&&ev.target.closest?ev.target.closest('[data-tab],[data-coach],[id="coachStrip"]'):null;
  if(!t)return;
  if(t.getAttribute('data-tab')){curTab=t.getAttribute('data-tab');sync();return;}
  if(t.id==='coachStrip'){var b=document.querySelector('[data-tab="coach"]');if(b)b.click();}
 });
 if(window.MutationObserver){
  var m=$('main');if(m)new window.MutationObserver(sync).observe(m,{attributes:true,attributeFilter:['hidden']});
 }
}
auto();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.XulianCoach={render:render,apply:apply,plan:plan};
})();
