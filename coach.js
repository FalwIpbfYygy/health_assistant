(function(){
'use strict';
var C=window.FitCore,SK='xulian.v1';
function esc(s){return C.escapeHtml(s);}
/* v1.3: 移除硬编码的教练 A/B/D 计划。计划唯一真相源 = 用户问卷生成的 S.plan（见 app.js/core.js）。入门页只保留通用建议与动态展示用户自己的计划。 */
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
function badge(s){return '<span class="coach-tag">'+esc(s)+'</span>';}
/* v1.3: 入门页计划区动态展示用户自己问卷生成的 S.plan，不再写死第二套计划 */
function userPlanBlock(){
 var st=null;try{st=JSON.parse(localStorage.getItem(SK)||'null');}catch(e){}
 if(!st||!st.plan||!st.plan.week||!st.profile)return '<div class="coach-sub">还没有训练计划。到「设置」里做一次问卷，系统会按你的目标 / 经验 / 场地生成一套，这里会同步显示。</div>';
 var td=C.weekdayIndex();
 var rows=st.plan.week.map(function(d){
  var sub=d.rest?'休息 / 主动恢复':(d.title||'训练')+' · '+d.items.length+' 个动作';
  return '<div class="coach-week-row'+(d.day===td?' today':'')+'"><b>'+esc(d.weekday)+'</b><span class="cw-title">'+esc(sub)+'</span>'+(d.day===td?'<span class="cw-sub">今天</span>':'')+'</div>';
 }).join('');
 return '<div class="coach-sub">这是你当前唯一的训练计划（在「设置」里重做问卷会更新）。同一套也显示在「计划」页——入门指南讲「怎么练对」，计划讲「练什么」，两者一致不冲突。</div><div class="coach-week">'+rows+'</div><div class="note-bar">照「计划」页执行即可；本页其余内容为通用建议，不会改动你的计划或记录。</div>';
}
function sec(title,body){return '<section class="coach-sec"><h3>'+esc(title)+'</h3>'+body+'</section>';}
function ul(arr){return '<ul class="coach-ul">'+arr.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';}
function html(){
 var h=[];
 h.push('<div class="coach-hero"><div class="coach-kicker">新手入门 · 通用指南</div><h2>先练对，再练重。</h2><p>刚开始别急着追重量。前两周把动作做标准：肩胛稳住、离心控住、脖子放松。健身骗不了人，练多少得多少。</p></div>');
h.push(sec('新手从这里开始','<p>刚开始建议从空杆 / 最轻档起步，推肩用最轻哑铃，引体先练离心，每次带上背部和肩袖稳定动作。重量不是起点，动作质量才是。</p><div class="note-bar">前两周先不加重量，把动作做标准比做多重要。</div>'));
 h.push(sec('先改这 3 个动作错误',ERRORS.map(function(e){return '<div class="coach-ex"><div class="coach-ex-h"><b>'+esc(e[0])+'</b><span>常见表现：'+esc(e[1])+'</span></div><p>'+esc(e[2])+'</p></div>';}).join('')+'<div class="note-bar">这三个不解决，加重量毫无意义——一大半是耸肩和失控漏掉的力，不是胸没力气。</div>'));
 h.push(sec('你的本周训练计划',userPlanBlock()));
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
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.XulianCoach={render:render};
})();
