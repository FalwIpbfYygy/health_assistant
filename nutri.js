/* 序练 XULIAN - 饮食数字校准 + 疲倦自查（补全版）v1.2
 * 纯本地计算：无网络 / 无账号 / 无上传 / 无 eval。
 * UMD：Node 可 require 做逻辑自检；浏览器挂 window.XulianNutri 并自动 mount。
 * 只新增不改既有：运行时包装 XulianCoach.render 注入入口卡，data-nt 独立事件命名空间。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.XulianNutri = api;
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.mount);
      else api.mount();
    }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var VERSION = '1.2.0';
  var ACTIVITY = [
    ['sedentary', '久坐（几乎不运动）', 1.2],
    ['light', '轻度（每周 1–3 次）', 1.375],
    ['moderate', '中度（每周 3–5 次）', 1.55],
    ['active', '较高（每周 6–7 次）', 1.725]
  ];
  var GOALS = [
    ['recomp', '增肌减脂同步（身体重组）'],
    ['cut', '先降体脂'],
    ['bulk', '先增肌']
  ];

  function round10(n) { return Math.round(n / 10) * 10; }
  function toNum(v) { var n = Number(v); return isFinite(n) ? n : NaN; }
  function clamp(v, min, max, def) {
    var n = toNum(v);
    if (isNaN(n)) return def;
    return n < min ? min : (n > max ? max : n);
  }
  function enumOf(v, list, def) {
    for (var i = 0; i < list.length; i++) if (list[i][0] === v) return v;
    return def;
  }
  function inArr(v, arr) { return arr.indexOf(v) >= 0; }
  function bmiLabel(bmi) {
    if (bmi < 18.5) return '偏瘦';
    if (bmi < 24) return '正常';
    if (bmi < 28) return '超重';
    return '肥胖';
  }

  /* ============ 纯计算：饮食数字校准 ============ */
  function calcMacros(input) {
    input = input || {};
    var usedDefault = { h: false, w: false, a: false };

    var sex = input.sex === 'female' ? 'female' : 'male';
    var ageRaw = input.age;
    var age = (ageRaw === '' || ageRaw === null || ageRaw === undefined) ? (usedDefault.a = true, 25) : clamp(ageRaw, 16, 80, 25);
    var heightCm = (input.heightCm === '' || input.heightCm === null || input.heightCm === undefined) ? (usedDefault.h = true, 170) : clamp(input.heightCm, 130, 220, 170);
    var weightKg = (input.weightKg === '' || input.weightKg === null || input.weightKg === undefined) ? (usedDefault.w = true, 65) : clamp(input.weightKg, 35, 200, 65);

    var bfRaw = input.bodyFatPct;
    var hasBf = !(bfRaw === '' || bfRaw === null || bfRaw === undefined) && isFinite(Number(bfRaw));
    var bf = hasBf ? clamp(bfRaw, 3, 60, 0) : null;

    var activity = enumOf(input.activity, ACTIVITY, 'light');
    var goal = enumOf(input.goal, GOALS, 'recomp');
    var actRow = ACTIVITY.filter(function (a) { return a[0] === activity; })[0];
    var factor = actRow[2];

    // BMR：Mifflin-St Jeor 为主口径（与入门指南一致）；有体脂时给 Katch-McArdle 参考
    var bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161));
    var bmrKatch = null;
    if (hasBf) {
      var lbm = weightKg * (1 - bf / 100);
      bmrKatch = Math.round(370 + 21.6 * lbm);
    }
    var tdee = Math.round(bmr * factor);

    // 目标热量系数（身体重组取轻微赤字，与既有口径一致）
    var ratio = goal === 'cut' ? [0.75, 0.83] : (goal === 'bulk' ? [1.05, 1.12] : [0.85, 0.92]);
    var sexFloor = sex === 'male' ? 1500 : 1200;
    var floor = goal === 'cut' ? sexFloor : (goal === 'bulk' ? Math.round(bmr) : Math.max(sexFloor, Math.round(bmr * 0.95)));
    var kcalMin = round10(tdee * ratio[0]);
    var kcalMax = round10(tdee * ratio[1]);
    var floorApplied = false;
    if (kcalMin < floor) {
      kcalMin = floor;
      floorApplied = true;
      if (kcalMax < kcalMin) kcalMax = kcalMin;
    }

    // 宏量
    var pPerKg = goal === 'cut' ? [1.8, 2.2] : (goal === 'bulk' ? [1.6, 2.0] : [1.8, 2.0]);
    var proteinMin = Math.round(weightKg * pPerKg[0]);
    var proteinMax = Math.round(weightKg * pPerKg[1]);
    var fatMin = Math.round(weightKg * 0.75);
    var fatMax = Math.round(weightKg * 0.9);

    var kMid = (kcalMin + kcalMax) / 2;
    var pMid = (proteinMin + proteinMax) / 2;
    var fMid = (fatMin + fatMax) / 2;
    var carbMid = Math.max(0, Math.round((kMid - pMid * 4 - fMid * 9) / 4));
    var carbMax = Math.max(carbMid, Math.round((kcalMax - proteinMin * 4 - fatMin * 9) / 4));
    var carbMin = Math.max(0, Math.round((kcalMin - proteinMax * 4 - fatMax * 9) / 4));
    if (carbMin > carbMid) carbMin = carbMid;

    // 水 / 蔬菜
    var waterMin = Math.round(weightKg * 30);
    var waterMax = Math.round(weightKg * 35);
    var veg = '300–500';

    var bmi = Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;

    // 提示
    var warnings = [];
    if (usedDefault.h || usedDefault.w || usedDefault.a) {
      var parts = [];
      if (usedDefault.a) parts.push('年龄 25');
      if (usedDefault.h) parts.push('身高 170cm');
      if (usedDefault.w) parts.push('体重 65kg');
      warnings.push('以下未填项用了通用默认值（' + parts.join(' / ') + '），填入真实数据更准。');
    }
    if (floorApplied) warnings.push('已到安全热量下限，不建议再往下压；再低容易乏力、掉肌肉、训练表现下滑。');
    if (carbMid < 130) warnings.push('碳水偏低（约 ' + carbMid + 'g），可能让训练状态变差，可下调脂肪比例或提高热量。');
    if (bmiLabel(bmi) === '肥胖' || bmiLabel(bmi) === '超重') warnings.push('BMI 属' + bmiLabel(bmi) + '区间，建议以身体重组 / 先减脂为主，慎用大幅盈余的增肌。');
    if (hasBf && ((sex === 'male' && bf > 25) || (sex === 'female' && bf > 32))) warnings.push('体脂偏高，身体重组或先减脂更适合你，别急着猛吃增肌。');
    if (bmrKatch !== null && Math.abs(bmrKatch - bmr) / bmr > 0.12) warnings.push('体脂法与公式法估算差异较大，热量按区间看待更稳妥，别当精确值。');

    var kcalNote = goal === 'cut'
      ? '明确热量赤字，先降体脂；蛋白拉满以尽量保住肌肉。'
      : (goal === 'bulk'
        ? '轻微热量盈余，优先增肌；体脂偏高时慎用，别把自己喂胖。'
        : '在维持热量基础上小幅赤字，配合足量蛋白与力量训练，争取降脂同时保住甚至增加肌肉。这是新手最推荐的起点。');

    return {
      version: VERSION, sex: sex, age: age, heightCm: heightCm, weightKg: weightKg,
      bodyFatPct: bf, activity: activity, activityName: actRow[1], goal: goal,
      goalName: goal === 'cut' ? '先降体脂' : (goal === 'bulk' ? '先增肌' : '身体重组'),
      bmr: bmr, bmrKatch: bmrKatch, tdee: tdee, factor: factor,
      kcalMin: kcalMin, kcalMax: kcalMax, kcalNote: kcalNote, floorApplied: floorApplied,
      proteinMin: proteinMin, proteinMax: proteinMax, proteinPerKg: pPerKg,
      fatMin: fatMin, fatMax: fatMax,
      carbMin: carbMin, carbMax: carbMax, carbMid: carbMid,
      waterMin: waterMin, waterMax: waterMax, veg: veg,
      bmi: bmi, bmiLabel: bmiLabel(bmi), warnings: warnings
    };
  }

  /* ============ 纯计算：疲倦自查（补全版） ============ */
  function assessFatigue(ans) {
    ans = ans || {};
    var e = function (v, arr) { return inArr(v, arr) ? v : ''; };
    var fatigueType = e(ans.fatigueType, ['whole', 'sore', 'dizzy', 'breath', 'mental']);
    var duration = e(ans.duration, ['halfhour', 'hours', 'nextday', 'days']);
    var training = e(ans.training, ['strength_cardio', 'cardio', 'strength', 'video', 'none']);
    var preworkout = e(ans.preworkout, ['none', 'longago', 'normal', 'snack']);
    var perWeek = e(ans.perWeek, ['1_2', '3_4', '5_6', 'daily', 'irregular']);
    var sleep = e(ans.sleep, ['short', 'ok', 'good', 'irregular']);
    var timeSlot = e(ans.timeSlot, ['morning', 'afternoon', 'evening', 'night', 'irregular']);
    var weightTrend = e(ans.weightTrend, ['down', 'flat', 'up', 'norecord']);
    var history = Array.isArray(ans.history)
      ? ans.history.filter(function (x) { return inArr(x, ['anemia', 'thyroid', 'infection', 'sleepdisorder', 'none', 'unsure']); })
      : [];

    var redFlags = [];
    if (fatigueType === 'dizzy') redFlags.push('头晕 / 恶心 / 心慌：不是普通疲劳。立即停止训练、坐下休息、补水；反复出现或伴胸闷胸痛请尽快就医（心电图 + 血常规）。');
    if (fatigueType === 'breath') redFlags.push('呼吸很急、心跳很快：训练中心率异常升高要警惕。立即停止并慢走平复；静息后仍持续或伴胸痛、晕厥感请就医评估心肺。');
    if (duration === 'days') redFlags.push('疲劳持续两三天以上：持续不缓解需要排查贫血、甲状腺、感染或睡眠障碍，别全归咎于健身，建议查血常规与甲功。');
    var hisMap = { anemia: '贫血', thyroid: '甲状腺问题', infection: '近期感染', sleepdisorder: '睡眠障碍' };
    history.forEach(function (h) {
      if (hisMap[h]) redFlags.push('你勾选了「' + hisMap[h] + '」：这类情况会明显放大训练后的疲劳，训练强度先降下来，并把症状告知医生。');
    });

    var causes = [];
    function add(label, p, reason, actions) { causes.push({ label: label, p: p, r: reason, actions: actions }); }

    // 睡眠：新手恢复第一杠杆
    if (sleep === 'short') add('睡眠不足', 1, '每天不到 6 小时，肌肉和神经都来不及恢复，这是新手疲劳最常见也最被低估的原因。', ['每周把睡觉时间提前 20 分钟，固定起床时间，用 4–5 周挪到 23 点', '保证 7–9 小时；睡前 4-7-8 呼吸帮助入睡']);
    else if (sleep === 'irregular') add('作息紊乱', 1, '睡觉时间忽早忽晚，比单纯睡得少更伤恢复，生物钟乱了白天就是没精神。', ['先固定起床时间，再倒推睡觉时间', '周末也别大幅补觉，波动控制在 1 小时内']);

    // 训练前能量
    if (preworkout === 'none') add('训练前空腹', 1, '基本饿着肚子练，血糖偏低，容易乏力、训练表现下滑。', ['训练前 1–2 小时吃一顿含主食 + 蛋白的正餐', '来不及就训练前 15–30 分钟吃 1 根香蕉或 1–2 片面包']);
    else if (preworkout === 'longago') add('训练前能量断档', 1, '吃饭离训练太久，练的时候能量已经掉下来了。', ['把正餐挪到训练前 1–2 小时', '训练前 30 分钟补一点碳水（香蕉 / 面包 / 无糖酸奶）']);

    // 训练量 / 频率
    if (perWeek === '5_6' || perWeek === 'daily') add('训练量超出恢复能力', 1, '新手每周 2–3 次就够。几乎天天练会让疲劳累积，越练越虚。', ['降到每周 2–3 次力量，每次 20–35 分钟', '不连续安排高强度，每个动作 1–2 组起步、留 3–4 次余力']);

    // 有氧强度
    if (training === 'cardio' || training === 'video') add('有氧 / 燃脂强度过高', 2, '跳绳、跑步、跟练燃脂对零基础和心肺弱的人冲击很大，心率飙升就明显疲惫。', ['有氧先降到轻松步行 10–20 分钟', '避开跳绳 / 跑步 / HIIT，力量从最轻档起步']);

    // 热量赤字 / 体重趋势
    if (weightTrend === 'down') add('热量可能吃太少', 2, '体重掉太快（尤其伴随乏力）往往是热量赤字过大，身体没足够燃料。', ['热量回到身体重组区间（约维持热量的 85–92%）', '蛋白拉满，别极端节食；每周降 0.3–0.6kg 较稳']);

    // 精神疲惫 / 压力
    if (fatigueType === 'mental') add('精神疲惫 / 恢复不足', 2, '不想动、提不起劲，多为恢复不足叠加生活压力，不一定是练多了。', ['状态差那天改做最低配：10 分钟拉伸 + 3 组面拉，保住连续性', '先把睡眠睡够，再谈加重量']);

    // 水分电解质
    if (training !== 'none' && training !== '') add('水分 / 电解质可能不足', 3, '出汗多、天气热又补水少，会明显加重疲劳。', ['按体重 30–35ml/kg 补水，训练日再加 500ml', '大量出汗时适当补钠（淡盐 / 电解质水）']);

    // 肌肉酸痛
    if (fatigueType === 'sore') add('延迟性肌肉酸痛（DOMS）', 3, '第一次做某动作后局部酸胀僵硬是正常的，通常几天内自行缓解，不影响生活。', ['每个动作降到 1–2 组，留 3–4 次余力', '轻活动 / 拉伸促进恢复，别硬撑大重量']);

    // 无记录
    if (weightTrend === 'norecord') add('还没有记录体重 / 腰围', 3, '没有数据就判断不了热量该不该调，凭感觉容易走偏。', ['连测 2–3 周体重（每周 3 次取均值）和腰围', '盯腰围和训练表现，比单看体重更有意义']);

    // 还没开始练
    if (training === 'none') add('还没正式开始训练', 3, '如果日常就疲劳，先别急着加训练，把睡眠和饮食基础打稳。', ['优先排查睡眠、饮食与身体状态', '基础稳了再从每周 2 次、每次 20 分钟起步']);

    causes.sort(function (a, b) { return a.p - b.p; });

    var summary;
    if (redFlags.length) {
      summary = '先处理上面的「需要留意」——在排除健康问题之前，先别把疲劳归因于训练强度，更不要硬撑加量。';
    } else if (fatigueType === 'sore') {
      summary = '你描述的主要是局部肌肉酸痛，属于新手正常的延迟性酸痛。把组数和强度降下来，几天内会缓解。';
    } else if (causes.length) {
      summary = '你最可能的问题是「' + causes[0].label + '」。优先解决这一项，再谈加重量；多条同时中，按上面顺序从上往下改。';
    } else {
      summary = '你的回答没有明显短板。保持每周 2–3 次、每次 20–35 分钟的轻量训练，睡够 7–9 小时，训练前后正常吃，观察一周再调整。';
    }

    var disclaimer = '以上为常见原因的规则化自查，不替代医疗诊断。出现头晕、胸痛、心悸、呼吸困难、晕厥，或疲劳持续不缓解，请立即停止训练并就医排查（血常规、甲功、心肺等）。';

    return { version: VERSION, redFlags: redFlags, causes: causes, summary: summary, disclaimer: disclaimer };
  }

  /* ============ UI（仅浏览器） ============ */
  var state = {
    ntView: 'macro',
    macro: { sex: 'male', age: '', heightCm: '', weightKg: '', bodyFatPct: '', activity: 'light', goal: 'recomp' },
    fatigue: { fatigueType: '', duration: '', training: '', preworkout: '', perWeek: '', sleep: '', timeSlot: '', weightTrend: '', history: [] }
  };

  function el(id) { return document.getElementById(id); }
  function h(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

  function ensureDOM() {
    if (el('ntSheet')) return;
    var phone = document.querySelector('.phone') || document.body;
    var mask = document.createElement('div');
    mask.className = 'sheet-mask'; mask.id = 'ntMask'; mask.hidden = true; mask.setAttribute('data-nt', 'close');
    var sheet = document.createElement('div');
    sheet.className = 'sheet nt-sheet'; sheet.id = 'ntSheet'; sheet.hidden = true;
    sheet.innerHTML =
      '<div class="sheet-handle"></div>' +
      '<div class="nt-head"><div><h3>饮食 & 恢复自查</h3><div class="sub">数据只在本机计算，不上传</div></div><button class="nt-x" data-nt="close" type="button" aria-label="关闭">✕</button></div>' +
      '<div class="nt-tabs">' +
      '<button data-nt="tab" data-v="macro" class="on" type="button">饮食校准</button>' +
      '<button data-nt="tab" data-v="fatigue" type="button">疲倦自查</button>' +
      '</div><div class="nt-body" id="ntBody"></div>';
    phone.appendChild(mask);
    phone.appendChild(sheet);
  }

  function enhanceCoach() {
    var box = el('v-coach');
    if (!box || box.querySelector('.nt-entry')) return;
    var card = document.createElement('section');
    card.className = 'nt-entry';
    card.setAttribute('data-nt', 'open');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML =
      '<div class="nt-entry-ico">营</div>' +
      '<div class="nt-entry-tx"><b>饮食校准 + 疲倦自查</b><span>算一算该吃多少 · 练完为什么这么累</span></div>' +
      '<div class="nt-entry-go">开始 ›</div>';
    var hero = box.querySelector('.coach-hero');
    if (hero && hero.nextSibling) box.insertBefore(card, hero.nextSibling);
    else box.appendChild(card);
  }

  function openSheet() {
    ensureDOM();
    document.body.classList.add('sheet-open');
    el('ntMask').hidden = false;
    el('ntSheet').hidden = false;
    el('ntSheet').scrollTop = 0;
    renderView(state.ntView);
  }
  function closeSheet() {
    var s = el('ntSheet');
    if (!s) return;
    document.body.classList.remove('sheet-open');
    el('ntMask').hidden = true;
    s.hidden = true;
  }
  function switchTab(v) {
    state.ntView = v;
    var tabs = document.querySelectorAll('.nt-tabs [data-nt="tab"]');
    Array.prototype.forEach.call(tabs, function (b) { b.classList.toggle('on', b.getAttribute('data-v') === v); });
    var body = el('ntBody'); if (body) body.scrollTop = 0;
    renderView(v);
  }

  function pick(scope, key, val, multi) {
    var obj = state[scope];
    if (multi) {
      var arr = obj[key] || [];
      if (val === 'none') arr = ['none'];
      else {
        arr = arr.filter(function (x) { return x !== 'none' && x !== 'unsure'; });
        var i = arr.indexOf(val);
        if (i >= 0) arr.splice(i, 1); else arr.push(val);
        if (!arr.length) arr = ['none'];
      }
      obj[key] = arr;
    } else {
      obj[key] = val;
    }
    var grp = document.querySelector('[data-nt="pick"][data-scope="' + scope + '"][data-k="' + key + '"]');
    if (grp) {
      var box = grp.closest('.nt-picks') || grp.parentNode;
      Array.prototype.forEach.call(box.querySelectorAll('[data-nt="pick"]'), function (b) {
        var bv = b.getAttribute('data-val');
        var on = multi ? (obj[key].indexOf(bv) >= 0 && !(bv === 'none' && obj[key].length > 1)) : (obj[key] === bv);
        b.classList.toggle('on', on);
      });
    }
  }

  function pickHTML(scope, key, opts, multi) {
    var obj = state[scope];
    return '<div class="nt-picks">' + opts.map(function (o) {
      var on = multi ? ((obj[key] || []).indexOf(o[0]) >= 0 && !(o[0] === 'none' && (obj[key] || []).length > 1)) : (obj[key] === o[0]);
      return '<button type="button" class="nt-pick' + (on ? ' on' : '') + '" data-nt="pick" data-scope="' + scope + '" data-k="' + key + '" data-val="' + h(o[0]) + '"' + (multi ? ' data-multi="1"' : '') + '>' + h(o[1]) + '</button>';
    }).join('') + '</div>';
  }

  function renderMacro() {
    var m = state.macro;
    var html =
      '<section class="nt-sec">' +
      '<h4>① 填你的基本情况</h4>' +
      '<span class="nt-label">性别</span>' + pickHTML('macro', 'sex', [['male', '男'], ['female', '女']], false) +
      '<span class="nt-label">年龄 / 身高 / 体重</span>' +
      '<div class="nt-row"><input class="field" type="number" inputmode="numeric" data-scope="macro" data-k="age" placeholder="年龄 如 25" value="' + h(m.age) + '"><input class="field" type="number" inputmode="decimal" data-scope="macro" data-k="heightCm" placeholder="身高cm 如 170" value="' + h(m.heightCm) + '"><input class="field" type="number" inputmode="decimal" data-scope="macro" data-k="weightKg" placeholder="体重kg 如 65" value="' + h(m.weightKg) + '"></div>' +
      '<span class="nt-label">体脂率（选填，有更准）</span><input class="field" type="number" inputmode="decimal" data-scope="macro" data-k="bodyFatPct" placeholder="如 22%，不知道可留空" value="' + h(m.bodyFatPct) + '">' +
      '<span class="nt-label">日常活动量</span>' + pickHTML('macro', 'activity', ACTIVITY.map(function (a) { return [a[0], a[1]]; }), false) +
      '<span class="nt-label">这次的目标</span>' + pickHTML('macro', 'goal', GOALS, false) +
      '<div class="nt-hint">先不要极端节食。身体重组（轻微赤字 + 足量蛋白 + 力量训练）是新手最稳的起点。</div>' +
      '<button class="btn btn-primary btn-block" data-nt="calc" type="button" style="margin-top:12px">算出我的每日目标</button>' +
      '</section><div id="ntMacroOut"></div>';
    el('ntBody').innerHTML = html;
  }

  function doCalc() {
    var r = calcMacros(state.macro);
    var out = el('ntMacroOut'); if (!out) return;
    var s = '';
    s += '<section class="nt-sec"><h4>② 你的每日目标</h4>';
    s += '<div class="nt-big">' +
      '<div class="kcal"><b>' + r.kcalMin + '–' + r.kcalMax + '</b><span>每日热量 kcal</span></div>' +
      '<div><b>' + r.tdee + '</b><span>维持热量 TDEE</span></div>' +
      '</div>';
    s += '<div class="nt-hint" style="margin:0 0 12px">' + h(r.kcalNote) + '</div>';
    s += '<div class="nt-macro">' +
      '<div><b>' + r.proteinMin + '–' + r.proteinMax + 'g</b><span>蛋白质 · ' + r.proteinPerKg[0] + '–' + r.proteinPerKg[1] + 'g/kg</span></div>' +
      '<div><b>' + r.fatMin + '–' + r.fatMax + 'g</b><span>脂肪</span></div>' +
      '<div><b>' + r.carbMin + '–' + r.carbMax + 'g</b><span>碳水 · 约 ' + r.carbMid + 'g</span></div>' +
      '<div><b>' + r.veg + 'g</b><span>蔬菜 / 天</span></div>' +
      '<div><b>' + (r.waterMin / 1000).toFixed(1) + '–' + (r.waterMax / 1000).toFixed(1) + 'L</b><span>饮水 · 训练日 +500ml</span></div>' +
      '<div><b>' + r.bmi + '</b><span>BMI · ' + h(r.bmiLabel) + '</span></div>' +
      '</div>';
    s += '<div class="nt-hint">基础代谢 BMR 约 ' + r.bmr + ' kcal' + (r.bmrKatch !== null ? '（体脂法参考 ' + r.bmrKatch + '）' : '') + ' · 活动系数 ' + r.factor + '。示范三餐约 1800 kcal，够不到目标时补一份主食或 1 个蛋 + 1 杯奶。肉类按生重或熟重统一记，别混算。</div>';
    if (r.warnings.length) {
      s += '<div class="nt-warn">' + r.warnings.map(function (w) { return '<div>· ' + h(w) + '</div>'; }).join('') + '</div>';
    }
    s += '</section>';
    s += '<div class="nt-result-note">通用估算，公式（Mifflin-St Jeor / Katch-McArdle）给的是起点不是精确值。连续 2–3 周盯体重（每周 3 次取均值）与腰围再调整。不提供医疗建议；有基础疾病请咨询医生或注册营养师。</div>';
    out.innerHTML = s;
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderFatigue() {
    var f = state.fatigue;
    var html =
      '<section class="nt-sec"><h4>练完为什么这么累？</h4>' +
      '<div class="nt-hint" style="margin:0 0 6px">先分清「局部肌肉酸痛」和「全身疲倦」，处理方式完全不同。按真实情况选，9 项都可改。</div>' +

      '<span class="nt-label">1 · 主要是哪种疲倦？</span>' + pickHTML('fatigue', 'fatigueType', [['whole', '全身没力气、想睡'], ['sore', '肌肉酸痛（腿 / 胸）'], ['dizzy', '头晕、恶心、心慌'], ['breath', '呼吸急、心跳快'], ['mental', '精神疲惫、次日不想动']], false) +

      '<span class="nt-label">2 · 持续多久？</span>' + pickHTML('fatigue', 'duration', [['halfhour', '半小时就恢复'], ['hours', '几小时后恢复'], ['nextday', '第二天仍累'], ['days', '持续两三天以上']], false) +

      '<span class="nt-label">3 · 现在主要练什么？</span>' + pickHTML('fatigue', 'training', [['strength_cardio', '力量 + 有氧'], ['cardio', '跳绳 / 跑步等有氧'], ['strength', '俯卧撑 / 深蹲等力量'], ['video', '跟视频做燃脂'], ['none', '还没正式开始']], false) +

      '<span class="nt-label">4 · 训练前怎么吃？</span>' + pickHTML('fatigue', 'preworkout', [['none', '基本没吃'], ['longago', '吃了但隔很久'], ['normal', '前 1–2 小时正常吃'], ['snack', '香蕉 / 面包等小食']], false) +

      '<span class="nt-label">5 · 每周练几次？</span>' + pickHTML('fatigue', 'perWeek', [['1_2', '1–2 次'], ['3_4', '3–4 次'], ['5_6', '5–6 次'], ['daily', '几乎每天'], ['irregular', '不固定']], false) +

      '<span class="nt-label">6 · 每天睡多久？（常被漏掉，却最关键的之一）</span>' + pickHTML('fatigue', 'sleep', [['short', '不到 6 小时'], ['ok', '6–7 小时'], ['good', '7–9 小时'], ['irregular', '作息很乱']], false) +

      '<span class="nt-label">7 · 一般几点练？</span>' + pickHTML('fatigue', 'timeSlot', [['morning', '早上'], ['afternoon', '下午'], ['evening', '傍晚'], ['night', '晚上'], ['irregular', '不固定']], false) +

      '<span class="nt-label">8 · 最近体重 / 腰围趋势？</span>' + pickHTML('fatigue', 'weightTrend', [['down', '在下降'], ['flat', '基本持平'], ['up', '在上升'], ['norecord', '没记录']], false) +

      '<span class="nt-label">9 · 身体情况（可多选）</span>' + pickHTML('fatigue', 'history', [['none', '都正常'], ['anemia', '贫血'], ['thyroid', '甲状腺'], ['infection', '近期感染'], ['sleepdisorder', '睡眠障碍'], ['unsure', '不确定']], true) +

      '<button class="btn btn-primary btn-block" data-nt="assess" type="button" style="margin-top:14px">生成我的分析</button>' +
      '</section><div id="ntFatigueOut"></div>';
    el('ntBody').innerHTML = html;
  }

  function doAssess() {
    var f = state.fatigue;
    if (!f.fatigueType) { toastNt('先选一下「主要是哪种疲倦」'); return; }
    var r = assessFatigue(f);
    var out = el('ntFatigueOut'); if (!out) return;
    var s = '';
    if (r.redFlags.length) {
      s += '<div class="nt-flag"><b>⚑ 需要留意</b>' + r.redFlags.map(function (x) { return '<div style="margin:5px 0">· ' + h(x) + '</div>'; }).join('') + '</div>';
    }
    s += '<section class="nt-sec"><h4>可能的原因（按优先级）</h4>';
    s += '<div class="nt-summary">' + h(r.summary) + '</div>';
    if (r.causes.length) {
      r.causes.forEach(function (c) {
        s += '<div class="nt-cause p' + c.p + '"><span class="t">' + h(c.label) + '</span><span class="p">' + (c.p === 1 ? '优先' : (c.p === 2 ? '次要' : '提示')) + '</span>';
        s += '<div class="r">' + h(c.r) + '</div><ul>' + c.actions.map(function (a) { return '<li>' + h(a) + '</li>'; }).join('') + '</ul></div>';
      });
    } else {
      s += '<div class="nt-empty">没有明显短板，保持现状观察一周即可。</div>';
    }
    s += '</section>';
    s += '<div class="nt-result-note">' + h(r.disclaimer) + '</div>';
    out.innerHTML = s;
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function toastNt(msg) {
    var t = document.createElement('div');
    t.className = 'nt-toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 1900);
  }

  function renderView(v) { if (v === 'fatigue') renderFatigue(); else renderMacro(); }

  function bind() {
    document.addEventListener('click', function (ev) {
      var t = ev.target && ev.target.closest ? ev.target.closest('[data-nt]') : null;
      if (!t) return;
      var a = t.getAttribute('data-nt');
      if (a === 'open') { openSheet(); return; }
      if (a === 'close') { closeSheet(); return; }
      if (a === 'tab') { switchTab(t.getAttribute('data-v')); return; }
      if (a === 'pick') {
        var scope = t.getAttribute('data-scope');
        pick(scope, t.getAttribute('data-k'), t.getAttribute('data-val'), t.getAttribute('data-multi') === '1');
        return;
      }
      if (a === 'calc') { doCalc(); return; }
      if (a === 'assess') { doAssess(); return; }
    });
    document.addEventListener('keydown', function (ev) {
      var s = el('ntSheet');
      if (ev.key === 'Escape' && s && !s.hidden) closeSheet();
    });
    document.addEventListener('input', function (ev) {
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var scope = t.getAttribute('data-scope'), k = t.getAttribute('data-k');
      if (scope && k && state[scope] && state[scope].hasOwnProperty(k)) state[scope][k] = t.value;
    });
    document.addEventListener('keypress', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var t = ev.target;
      if (t && t.classList && t.classList.contains('nt-entry')) { ev.preventDefault(); openSheet(); }
    });
  }

  function mount() {
    if (el('ntSheet')) return;
    ensureDOM();
    enhanceCoach();
    var C = window.XulianCoach;
    if (C && typeof C.render === 'function') {
      var orig = C.render;
      C.render = function () { orig(); enhanceCoach(); };
    }
    bind();
  }

  return {
    version: VERSION,
    calcMacros: calcMacros,
    assessFatigue: assessFatigue,
    mount: mount,
    _round10: round10
  };
});
