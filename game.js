(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var SAVE_KEY = "hkly_save_v1", MORNING_KEY = "hkly_morning_v1";
  var SLOT_NAMES = ["☀️ 上午", "🌆 下午", "🌙 晚上"];
  var FINAL_DAY = 18;
  var MAX_W = 20;
  var ITEM_INFO = {
    "桃木剑": { w: 2.5, gear: true, desc: "爷爷的遗物。随身携带时，灵力判定更有把握。" },
    "罗盘": { w: 1, gear: true, desc: "寻找阴气与执念的方向。" },
    "铜铃": { w: 0.5, gear: true, desc: "招魂、引魂用。" },
    "八卦镜": { w: 1.5, gear: true, desc: "照出灵体的真身。" },
    "护身玉": { w: 0.2, gear: true, desc: "随身携带时，受到的伤害减少两成。" },
    "镇煞符": { w: 0.05, gear: true, desc: "镇压灵体。用一张少一张。" },
    "糯米": { w: 1, gear: true, desc: "一包。能逼出灵体的形体。" },
    "符纸": { w: 0.02, gear: false, desc: "空白符纸，画符用。" },
    "安神香": { w: 0.1, gear: false, desc: "在店里点燃，恢复理智。" },
    "下午茶": { w: 0.3, gear: false, desc: "菠萝油加奶茶，可以请小玲吃。" }
  };
  var SHOP = [
    { k: "符纸", n: 10, price: 200, t: "空白符纸 ×10" },
    { k: "糯米", n: 1, price: 60, t: "糯米 ×1包" },
    { k: "安神香", n: 1, price: 250, t: "安神香 ×1" },
    { k: "下午茶", n: 1, price: 45, t: "下午茶（菠萝油＋奶茶）" },
    { k: "铜铃", n: 1, price: 600, t: "铜铃" },
    { k: "八卦镜", n: 1, price: 1200, t: "八卦镜" },
    { k: "护身玉", n: 1, price: 2800, t: "护身玉" }
  ];

  var FAST = /[?&]fast=1/.test(location.search);
  var s = null;          // 游戏状态
  var cont = null;       // 场景结束后的回调
  var busy = false;

  /* ================= 工具 ================= */
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function esc(t) { return String(t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function fill(t) {
    if (!s) return t;
    return String(t).replace(/\{name\}/g, s.name).replace(/\{孙\}/g, s.gender === "女" ? "孙女" : "孙子")
      .replace(/\{哥姐\}/g, s.gender === "女" ? "姐姐" : "哥哥");
  }
  function lunar(day) {
    var nums = ["", "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九"];
    var d = day + 25; // 第1天 = 六月廿六，六月共29天
    return d <= 29 ? "六月" + nums[d] : "七月" + nums[d - 29];
  }

  /* ================= 状态计算 ================= */
  function weight() {
    var w = 0;
    for (var k in s.items) if (ITEM_INFO[k] && ITEM_INFO[k].gear && s.carry[k] && s.items[k] > 0) w += ITEM_INFO[k].w * s.items[k];
    return Math.round(w * 10) / 10;
  }
  function effShanbi() { return clamp(s.shanbi - Math.max(0, Math.ceil((weight() - 8) * 1.5)), 0, 100); }
  function carry(st, k) { return st.items[k] > 0 && st.carry[k]; }
  function use(st, k) { if (st.items[k] > 0) st.items[k]--; }
  function affLabel(v) { return v <= -51 ? "敌对" : v <= -1 ? "冷漠" : v <= 20 ? "中立" : v <= 50 ? "友善" : v <= 80 ? "信任" : "深厚羁绊"; }
  function xlStage() {
    var v = s.aff.xl, st = v >= 80 ? 4 : v >= 60 ? 3 : v >= 40 ? 2 : v >= 20 ? 1 : 0;
    if (s.flags.xl_lifedeath) st = Math.max(st, 2);
    return ["陌生人", "留意关注", "在意关心", "好友羁绊", "重要之人"][st];
  }
  function statusText() {
    var arr = s.status.slice();
    if (s.san < 30) arr.push("精神恍惚"); else if (s.san < 60) arr.push("心神不宁");
    if (s.hp < 30) arr.push("重伤"); else if (s.hp < 60) arr.push("受伤");
    if (s.sp < 20) arr.push("疲惫");
    if (weight() > MAX_W) arr.push("超重");
    return arr.length ? arr.join("、") : "正常";
  }

  /* ================= 数值变化（返回提示行） ================= */
  var G = {
    carry: carry, use: use,
    lines: function (arr) { return arr; },
    dmg: function (st, n) {
      var r = n >= 999 ? 999 : Math.max(1, Math.round(n * (1 - st.tizhi / 110) * (carry(st, "护身玉") ? 0.8 : 1)));
      st.hp = Math.max(0, st.hp - r);
      return [{ chg: "💔 生命值 -" + Math.min(r, 100) }];
    },
    heal: function (st, n) { st.hp = clamp(st.hp + n, 0, 100); return [{ chg: "❤️ 生命值 +" + n }]; },
    san: function (st, n) {
      if (n < 0) n = Math.min(-1, Math.round(n * 0.8)); // 道士不易掉理智
      var before = st.san; st.san = clamp(st.san + n, 0, 100);
      var d = st.san - before; if (!d) return [];
      return [{ chg: (d < 0 ? "🌀 理智 " : "🧠 理智 +") + d }];
    },
    sp: function (st, n) { st.sp = clamp(st.sp + n, 0, 100); return []; },
    lingqi: function (st, n) { st.lingqi = clamp(st.lingqi + n, 0, st.lingqiMax); return [{ chg: "💠 灵气 " + (n > 0 ? "+" : "") + n }]; },
    money: function (st, n) { st.money += n; return [{ chg: "💰 " + (n > 0 ? "+$" : "-$") + Math.abs(n).toLocaleString() }]; },
    aff: function (st, who, n) {
      if (st.aff[who] === undefined) st.aff[who] = 0;
      var oldStage = who === "xl" ? xlStage() : null, oldLab = affLabel(st.aff[who]);
      st.aff[who] = clamp(st.aff[who] + n, -100, 100);
      var nm = who === "xl" ? "小玲" : who;
      var out = [{ chg: (n >= 0 ? "💗 " : "💢 ") + nm + " 好感 " + (n >= 0 ? "+" : "") + n }];
      var lab = affLabel(st.aff[who]);
      if (lab !== oldLab) out.push({ sys: "📈 " + nm + " 对你的态度变为「" + lab + "」。" });
      if (who === "xl") {
        var ns = xlStage();
        if (ns !== oldStage) {
          var order = ["陌生人", "留意关注", "在意关心", "好友羁绊", "重要之人"];
          out.push({ sys: "💞 小玲的感情阶段变为「" + ns + "」。" });
          if (order.indexOf(ns) > order.indexOf(oldStage) && !st.flags["stage_" + ns]) {
            st.flags["stage_" + ns] = 1;
            if (ns === "好友羁绊") st.flags.xl_past = 1;
            out = out.concat(XL_STAGE_EVENTS[ns] || []);
          }
        }
      }
      return out;
    },
    addStatus: function (st, t) { if (st.status.indexOf(t) < 0) st.status.push(t); },
    removeStatus: function (st, t) { st.status = st.status.filter(function (x) { return x !== t; }); },
    finishCase: function (st, id, result) {
      var c = CASES[id], out = [];
      st.cases[id] = result; st.active = null;
      if (st.relations.indexOf(id) < 0) st.relations.push(id);
      if (result === "good") out = out.concat(G.money(st, st.price), G.aff(st, c.client, 20), G.san(st, 8));
      else if (result === "seal") out = out.concat(G.money(st, st.price), G.aff(st, c.client, 5));
      else out = out.concat(G.aff(st, c.client, -30));
      st.done = (st.done || 0) + 1;
      st.nextOffer = st.day + rnd(2, 3);
      if (st.done >= 1 && !st.jinUnlocked[1]) { st.jinUnlocked[1] = true; out.push({ sys: "🧧 锦囊二微微发热，你可以打开它了。" }); }
      if (st.done >= 3 && !st.jinUnlocked[2]) { st.jinUnlocked[2] = true; out.push({ sys: "🧧 锦囊三的红绳自己松开了。" }); }
      return out;
    },
    ending: function (st, kind) { showEnding(kind); }
  };

  /* ================= 判定 ================= */
  function statMod(stat) {
    var m = 0;
    if (stat === "shanbi") m = Math.floor(effShanbi() / 10) - 2;
    else if (stat === "san") m = Math.floor(s.san / 10) - 5;
    else m = Math.floor(s[stat] / 5) - 2;
    if (stat === "lingli" && carry(s, "桃木剑")) m += 2;
    if (stat !== "san") m += s.san < 30 ? -4 : s.san < 50 ? -2 : 0;
    if (s.status.indexOf("被缠上") >= 0) m -= 2;
    if (s.sp < 15) m -= 2;
    return m;
  }
  function totalMod(ch) {
    var m = statMod(ch.stat);
    if (ch.talk && s.jin[0]) m += 3;
    if (ch.mod) m += ch.mod(s, G);
    return m;
  }
  function riskText(ch) {
    var p = (21 - (ch.dc - totalMod(ch))) / 20;
    return p >= 0.8 ? "把握很大" : p >= 0.55 ? "有一定风险" : p >= 0.3 ? "相当冒险" : "希望渺茫";
  }
  function roll(ch) {
    var d = rnd(1, 20);
    if (d === 20) return { ok: true, crit: true };
    if (d === 1) return { ok: false, crit: true };
    return { ok: d + totalMod(ch) >= ch.dc };
  }

  /* ================= 输出 ================= */
  var log = $("log"), dock = $("dock");
  function lineEl(l) {
    var el;
    if (typeof l === "string") { el = document.createElement("p"); el.className = "ln"; el.textContent = fill(l); }
    else if (Array.isArray(l)) {
      el = document.createElement("p"); el.className = "ln say";
      el.innerHTML = '<span class="who ' + (l[2] || "npc") + '">' + esc(fill(l[0])) + "</span>" + esc(fill(l[1]));
    } else {
      var k = Object.keys(l)[0];
      el = document.createElement(k === "pre" ? "pre" : "p");
      el.className = "ln " + k;
      el.textContent = fill(l[k]);
    }
    return el;
  }
  function print(lines, cb) {
    lines = (lines || []).filter(Boolean);
    var block = document.createElement("div"); block.className = "block";
    var delay = 0;
    lines.forEach(function (l) {
      var el = lineEl(l);
      el.style.animationDelay = delay + "ms";
      delay += (l && l.chg) ? 60 : 140;
      block.appendChild(el);
    });
    if (lines.length) { log.appendChild(block); trimLog(); scrollTo(block); }
    if (FAST) { block.querySelectorAll(".ln").forEach(function (x) { x.style.animation = "none"; x.style.opacity = 1; }); if (cb) setTimeout(cb, 0); return 0; }
    if (cb) setTimeout(cb, Math.min(delay, 2200));
    return delay;
  }
  function trimLog() { while (log.children.length > 160) log.removeChild(log.firstChild); }
  function scrollTo(el) {
    requestAnimationFrame(function () {
      var top = el.getBoundingClientRect().top + window.pageYOffset - ($("topbar").offsetHeight + 10);
      var bottomNeed = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: Math.min(Math.max(top, window.pageYOffset), bottomNeed), behavior: "smooth" });
    });
  }
  function scrollBottom() {
    requestAnimationFrame(function () {
      var bottom = document.documentElement.scrollHeight - window.innerHeight;
      var last = log.lastElementChild, target = bottom;
      if (last) {
        var top = last.getBoundingClientRect().top + window.pageYOffset - ($("topbar").offsetHeight + 10);
        target = Math.min(bottom, Math.max(top, window.pageYOffset));
      }
      window.scrollTo({ top: target, behavior: "smooth" });
    });
  }
  function clearDock() { dock.innerHTML = ""; }

  /* ================= 场景引擎 ================= */
  function runScene(id, done) {
    if (done) cont = done;
    if (id === "@accept") return acceptCase();
    if (id === "@decline") return declineCase();
    if (id === "@fin_xl") id = (s.flags.xl_knows || s.aff.xl >= 51) ? "fin_xlhold" : "fin_xlgo";
    if (id === "@fin_youwalk") id = (s.aff.xl >= 81 || (s.flags.xl_lifedeath && s.aff.xl >= 60)) ? "fin_xlpull" : "fin_open";
    var sc = STORY[id];
    if (!sc) { console.error("缺少场景", id); return endScene(); }
    s.scene = id;
    var out = (typeof sc.lines === "function" ? sc.lines(s) : sc.lines).slice();
    if (sc.enter) { var extra = sc.enter(s, G); if (extra && extra.length) out = out.concat(extra); }
    if (s.ended) return;
    print(out, function () {
      if (checkDeath(sc)) return;
      if (sc.go) return runScene(sc.go);
      if (sc.next) return showChoices([{ t: "▶ 继续", go: sc.next }], sc);
      if (sc.choices) return showChoices(sc.choices, sc);
      endScene();
    });
    updateStatus();
  }
  function showChoices(list, sc) {
    clearDock();
    var box = document.createElement("div"); box.className = "choices";
    list.forEach(function (ch) {
      if (ch.show && !ch.show(s, G)) return;
      var b = document.createElement("button"); b.className = "choice";
      var ok = !ch.req || ch.req(s, G);
      b.innerHTML = esc(fill(ch.t)) + (ch.check && ok ? '<span class="risk">〔🎲 ' + riskText(ch.check) + "〕</span>" : "") +
        (!ok ? '<span class="req">（' + esc(ch.reqText || "条件不足") + "）</span>" : "");
      if (!ok) b.disabled = true;
      b.onclick = function () { choose(ch, sc); };
      box.appendChild(b);
    });
    if (sc && sc.crisis) {
      for (var i = 0; i < 3; i++) {
        if (s.jinUnlocked[i] && !s.jin[i]) {
          (function (idx) {
            var b = document.createElement("button"); b.className = "choice jin";
            b.textContent = "🧧 打开" + JINNANG[idx].title;
            b.onclick = function () { clearDock(); openJin(idx, function () { showChoices(list, sc); }); };
            box.appendChild(b);
          })(i);
        }
      }
    }
    dock.appendChild(box);
    scrollBottom();
  }
  function choose(ch, sc) {
    if (busy) return; busy = true;
    clearDock();
    var out = [{ me: "▶ " + fill(ch.t) }];
    if (ch.eff) { var e = ch.eff(s, G); if (e && e.length) out = out.concat(e); }
    var target = ch.go;
    if (ch.check) {
      var r = roll(ch.check);
      out.push({ dice: "🎲 暗骰……" + (r.ok ? (r.crit ? "大成功！" : "成功。") : (r.crit ? "大失败！" : "失败。")) });
      target = r.ok ? ch.win : ch.lose;
    }
    print(out, function () {
      busy = false;
      if (checkDeath(sc)) return;
      updateStatus();
      if (ch.endSlot) { cont = null; s.scene = null; return endSlotNow(); }
      if (ch.end) return endScene();
      if (target) return runScene(target);
      endScene();
    });
    updateStatus();
  }
  function endScene() {
    var c = cont; cont = null; s.scene = null;
    save();
    if (c) c(); else showActions();
  }
  function checkDeath(sc) {
    if (s.ended) return true;
    if (s.hp <= 0) { showEnding("death", sc && sc.deathText); return true; }
    if (s.san <= 0) { showEnding("mad"); return true; }
    return false;
  }

  /* ================= 锦囊 ================= */
  function openJin(i, cb) {
    s.jin[i] = true;
    print([{ head: "🧧 你拆开了" + JINNANG[i].title + "。" }].concat(JINNANG[i].lines), function () { updateStatus(); save(); if (cb) cb(); });
  }

  /* ================= 委托 ================= */
  function nextCaseId() {
    var order = ["c1", "c2", "c3"];
    for (var i = 0; i < order.length; i++) if (!s.cases[order[i]]) return order[i];
    return null;
  }
  function acceptCase() {
    var id = s.offering, c = CASES[id];
    s.active = id; s.deadline = s.day + c.deadline; s.offering = null;
    print([{ sys: "📜 接下委托《" + c.title + "》，报酬 $" + s.price.toLocaleString() + "。\n需在 " + c.deadline + " 天内的晚上，选择「🕯️ 前往委托现场」（动态活动）。" }],
      function () { endScene(); });
  }
  function declineCase() {
    var id = s.offering; s.offering = null;
    s.declined[id] = (s.declined[id] || 0) + 1;
    var out = ["对方失望地离开了。"];
    if (s.declined[id] >= 2) { s.cases[id] = "skip"; out.push({ bad: "这单委托，你再也不会有机会接了。" }); s.done = (s.done || 0) + 1; if (s.done >= 3) s.jinUnlocked[2] = true; }
    s.nextOffer = s.day + 2;
    print(out, function () { endScene(); });
  }

  /* ================= 时段流程 ================= */
  function startSlot(fresh, resume) {
    if (!resume) { s.pts = 4; s.staticN = 0; s.dynN = 0; }
    save();
    if (s.slot === 0 && !resume) localStorage.setItem(MORNING_KEY, JSON.stringify(s));
    var head = [{ head: "📅 第 " + s.day + " 天 · 农历" + lunar(s.day) + " · " + SLOT_NAMES[s.slot] }];
    head.push(pick(FLAVOR[s.slot]));
    if (s.day >= 5 && Math.random() < 0.5) head.push(pick(FLAVOR_JULY));
    var queue = [];
    if (s.slot === 0 && fresh && s.evDay !== s.day) queue = morningEvents();
    if (s.day === FINAL_DAY && s.slot === 2) {
      print(head, function () { runScene("fin_start", function () {}); });
      return;
    }
    print(head, function () { runQueue(queue); });
  }
  function runQueue(q) {
    if (s.ended) return;
    if (!q.length) { if (s.slot === 0) s.evDay = s.day; save(); return showActions(); }
    var ev = q.shift();
    ev(function () { runQueue(q); });
  }
  function morningEvents() {
    var q = [];
    // 被缠上
    q.push(function (next) {
      if (s.status.indexOf("被缠上") >= 0 && s.hauntDay !== s.day) {
        s.hauntDay = s.day;
        print(["你又梦见了那辆小巴。", "有人在车上一遍一遍叫你的名字。"].concat(G.san(s, -5)), next);
      } else next();
    });
    // 交租
    q.push(function (next) {
      if (s.day % 7 === 0 && s.rentDay !== s.day) { s.rentDay = s.day; payRent(next); }
      else if (s.debt > 0 && s.day % 7 !== 0) chaseDebt(next); else next();
    });
    // 委托过期
    q.push(function (next) {
      if (s.active && s.day > s.deadline) {
        var id = s.active, c = CASES[id];
        var out = [{ bad: "⏰ 你没有在期限内处理《" + c.title + "》。" }];
        if (id === "c3") out.push("阿Ken打来电话，说阿文的心跳停了。", "电话那头，只剩下哭声。");
        else out.push(c.client + "打来电话，声音沙哑，说不用再麻烦你了。");
        out = out.concat(G.san(s, -12), G.finishCase(s, id, "fail"));
        print(out, next);
      } else next();
    });
    // 锦囊三
    q.push(function (next) {
      if (s.day === FINAL_DAY && !s.jin[2]) {
        s.jinUnlocked[2] = true;
        print([{ sys: "🧧 今天一早，锦囊三烫得像一块炭。你不能再等了。" }], function () { openJin(2, next); });
      } else if (s.day === FINAL_DAY) {
        print([{ bad: "🏮 今天是七月十四。天黑以后，它会来。" }], next);
      } else next();
    });
    // 新委托
    q.push(function (next) {
      var id = nextCaseId();
      if (!s.active && id && s.day >= s.nextOffer && s.day <= FINAL_DAY - 3) {
        s.offering = id; s.price = CASES[id].price;
        runScene(id + "_offer", next);
      } else next();
    });
    // 第一天
    return q;
  }
  function payRent(next) {
    var need = 6500 + (s.debt || 0);
    var out = [{ head: "💰 结算日：店租 $4,000 ＋ 小玲工资 $2,500" + (s.debt ? " ＋ 欠款 $" + s.debt.toLocaleString() : "") }];
    if (s.money >= need) {
      out = out.concat(G.money(s, -need), G.aff(s, "xl", 2));
      s.debt = 0;
      out.push("房东收了钱，点点头走了。");
    } else {
      if (s.money >= 2500) { out = out.concat(G.money(s, -2500)); s.debt = need - 2500; out.push("你先把小玲的工资付了。"); }
      else { s.debt = need; out = out.concat(G.aff(s, "xl", -12)); out.push(["小玲", "「工资……迟点给也没关系的。」", "xl"], "她这样说，但你看得出她在担心。"); }
      s.debtDue = s.day + 3;
      out.push({ bad: "🏠 房东给你三天时间补上 $" + s.debt.toLocaleString() + "。第 " + s.debtDue + " 天早上还交不出，店就要收回。" });
    }
    print(out, next);
  }
  function chaseDebt(next) {
    if (s.money >= s.debt) {
      var out = [{ sys: "🏠 你把欠下的 $" + s.debt.toLocaleString() + " 还清了。" }].concat(G.money(s, -s.debt));
      s.debt = 0; print(out, next);
    } else if (s.day >= s.debtDue) {
      showEnding("bankrupt");
    } else {
      print([{ bad: "🏠 还欠房东 $" + s.debt.toLocaleString() + "，期限是第 " + s.debtDue + " 天早上。" }], next);
    }
  }
  function endSlotNow() {
    clearDock(); cont = null;
    if (s.slot < 2) { s.slot++; startSlot(false); }
    else sleep();
  }
  function sleep() {
    var out = [{ head: "🛏️ 夜深了" }, "你锁好铁闸，熄了灯。"];
    if (s.sp < 10) out.push("你累得连衣服都没换，倒头就睡。");
    else out.push(pick(["窗外的霓虹灯一闪一闪，你很快就睡着了。", "楼下有人在唱卡拉OK，你翻了个身。", "你梦见爷爷在店里泡茶，一句话也没说。"]));
    s.sp = 100;
    var hpUp = Math.min(100 - s.hp, 15 + Math.floor(s.tizhi / 2)), sanUp = s.status.indexOf("被缠上") >= 0 ? 0 : Math.min(100 - s.san, 5);
    s.hp += hpUp; s.san += sanUp;
    s.lingqi = s.lingqiMax;
    s.chatToday = 0;
    s.day++; s.slot = 0;
    out.push({ chg: "⏰ 00:00 灵气已回满，体力恢复。" + (hpUp ? "❤️ 生命值 +" + hpUp + "　" : "") + (sanUp ? "🧠 理智 +" + sanUp : "") });
    print(out, function () { startSlot(true); });
  }

  /* ================= 行动 ================= */
  var ACTIONS = [
    { id: "read", n: "📖 读古籍", type: "s", sp: 5, d: "辩论↑",
      run: function () {
        var g = Math.random() < 0.45 ? 2 : 1; s.bianlun = Math.min(50, s.bianlun + g);
        return [pick(["你翻开爷爷留下的《驱邪辩》，一直读到眼睛发酸。", "你读了一卷讲「度化」的古书，边读边抄。", "你在旧书堆里找到一本批注满满的笔记。"]), { chg: "🗣️ 辩论 +" + g + "（" + s.bianlun + "/50）" }];
      } },
    { id: "meditate", n: "🧘 打坐静心", type: "s", sp: 3, d: "理智↑",
      run: function () { return ["你盘腿坐在神台前，呼吸慢慢变得绵长。"].concat(G.san(s, 7)); } },
    { id: "talisman", n: "🖌️ 画符", type: "s", sp: 5, d: "灵气25＋符纸1",
      req: function () { return s.lingqi >= 25 && s.items["符纸"] > 0; }, rt: function () { return s.items["符纸"] > 0 ? "灵气不足" : "没有符纸"; },
      run: function () {
        s.items["符纸"]--; var out = G.lingqi(s, -25);
        if (Math.random() < 0.15 + (s.san < 50 ? 0.25 : 0)) return ["你一笔下去，手抖了一下。", { bad: "符画坏了，只能烧掉。" }].concat(out);
        s.items["镇煞符"] = (s.items["镇煞符"] || 0) + 1;
        return ["你屏住呼吸，一笔画完。", "朱砂在符纸上隐隐发亮。", { good: "📿 镇煞符 +1（共 " + s.items["镇煞符"] + " 张）" }].concat(out);
      } },
    { id: "chat", n: "💬 和小玲聊天", type: "s", sp: 2, d: "好感↑",
      run: function () {
        var st = xlStage(), lines = pick(XL_CHATS[st]).slice();
        s.chatToday = (s.chatToday || 0) + 1;
        var g = s.chatToday <= 2 ? rnd(3, 5) : 1;
        return lines.concat(G.aff(s, "xl", g));
      } },
    { id: "tea", n: "🧋 请小玲吃下午茶", type: "s", sp: 1, d: "好感↑↑", show: function () { return s.items["下午茶"] > 0; },
      run: function () { s.items["下午茶"]--; return ["你把菠萝油和奶茶放到柜台上。", ["小玲", "「哇！你怎么知道我想吃这个？」", "xl"]].concat(G.aff(s, "xl", 7)); } },
    { id: "incense", n: "🪔 点安神香", type: "s", sp: 0, d: "理智↑↑", show: function () { return s.items["安神香"] > 0; },
      run: function () { s.items["安神香"]--; return ["檀香的味道在店里慢慢散开。"].concat(G.san(s, 15)); } },
    { id: "consult", n: "🧾 接待来客", type: "s", sp: 6, d: "赚一点钱", req: function () { return s.slot < 2; }, rt: function () { return "晚上没有客人"; },
      run: function () {
        var m = rnd(200, 600);
        return [pick(["一位阿婆来问新屋入伙要注意什么。", "一个中学生来买平安符，说下星期考试。", "有人来问家里的猫为什么老是盯着墙角。", "一对新婚夫妇来择日子。"])].concat(G.money(s, m));
      } },
    { id: "nap", n: "😴 小憩", type: "s", sp: -25, d: "体力↑",
      run: function () { return ["你靠在藤椅上眯了一会儿。", { chg: "⚡ 体力 +25" }]; } },
    { id: "body", n: "🏃 体能训练", type: "d", sp: 20, d: "体质↑",
      run: function () { var g = rnd(1, 2); s.tizhi = Math.min(50, s.tizhi + g); return [pick(["你在天台上扎马步，一扎就是半个钟。", "你沿着海滨长廊跑了一大圈。"]), { chg: "💪 体质 +" + g + "（" + s.tizhi + "/50）" }]; } },
    { id: "dodge", n: "🤸 身法训练", type: "d", sp: 20, d: "闪避↑",
      run: function () { var g = rnd(1, 3); s.shanbi = Math.min(100, s.shanbi + g); return [pick(["你在后巷的铁梯上来回跳，练脚步。", "你照着爷爷教的步法，一遍一遍走七星步。"]), { chg: "🌀 闪避 +" + g + "（" + s.shanbi + "/100）" }]; } },
    { id: "spirit", n: "🔥 灵力修炼", type: "d", sp: 15, d: "灵力↑ 耗灵气15", req: function () { return s.lingqi >= 15; }, rt: function () { return "灵气不足"; },
      run: function () {
        var g = rnd(1, 2); s.lingli = Math.min(50, s.lingli + g); s.spiritN = (s.spiritN || 0) + 1;
        var out = ["你运气行周天，把灵气一点一点压进丹田。", { chg: "✨ 灵力 +" + g + "（" + s.lingli + "/50）" }].concat(G.lingqi(s, -15));
        if (s.spiritN % 3 === 0) { s.lingqiMax += 5; out.push({ good: "💠 灵气上限 +5（" + s.lingqiMax + "）" }); }
        return out;
      } },
    { id: "job", n: "🪙 外出做小法事", type: "d", sp: 20, d: "赚钱，理智略降", out: true, req: function () { return s.slot < 2; }, rt: function () { return "晚上接不到"; },
      run: function () {
        var m = rnd(800, 1500);
        return [pick(["你去观塘帮一间新开的餐厅洒净。", "你去屯门帮一户人家送走了一只常来敲窗的「东西」。", "你去荃湾一间旧工厂做了一场小法事。"])].concat(G.money(s, m), G.san(s, -3));
      } },
    { id: "shop", n: "🛒 去庙街法器铺", type: "d", sp: 8, d: "购买法器", out: true,
      run: function () { setTimeout(function () { openModal("shop"); }, 400); return ["你走进庙街尽头那间没有招牌的小铺。", ["老何", "「哟，清叔的{孙}来了。想要点什么？」", "npc"]].concat(G.aff(s, "老何", 1)); } },
    { id: "case", n: "🕯️ 前往委托现场", type: "d", sp: 15, d: "", out: true, isCase: true,
      show: function () { return !!s.active; }, req: function () { return s.slot === 2; }, rt: function () { return "只能在晚上去"; } }
  ];

  function actState(a) {
    if (a.show && !a.show()) return null;
    var cost = a.type === "s" ? 1 : 2;
    var why = "";
    if (s.pts < cost) why = "行动力不足";
    else if (a.type === "s" && s.staticN >= 3) why = "本时段静态已满";
    else if (a.type === "d" && s.dynN >= 2) why = "本时段动态已满";
    else if (a.sp > 0 && s.sp < a.sp) why = "体力不足";
    else if (a.out && weight() > MAX_W) why = "负重超标，出不了门";
    else if (a.req && !a.req()) why = a.rt ? a.rt() : "条件不足";
    return { cost: cost, why: why };
  }
  function showActions() {
    if (s.ended) return;
    updateStatus();
    clearDock();
    var card = document.createElement("div"); card.className = "act-card";
    var dots = ""; for (var i = 0; i < 4; i++) dots += i < s.pts ? "●" : "○";
    card.innerHTML = '<div class="act-head"><b>第 ' + s.day + " 天 · " + SLOT_NAMES[s.slot] + '</b><span class="pts">行动力 ' + dots + "</span></div>" +
      '<pre class="ln" style="opacity:1;animation:none">' + esc(statusLine()) + "</pre>" +
      '<p class="act-hint">🟢 静态 1 点（最多 3 项）　🔵 动态 2 点（最多 2 项）' + (s.active ? "　🕯️ 进行中：《" + CASES[s.active].title + "》，期限第 " + s.deadline + " 天" : "") + "</p>";
    [["s", "🟢 静态活动（在店里）"], ["d", "🔵 动态活动（出门／训练）"]].forEach(function (g) {
      var wrap = document.createElement("div"); wrap.className = "act-group";
      wrap.innerHTML = "<h4>" + g[1] + "</h4>";
      var grid = document.createElement("div"); grid.className = "act-grid";
      ACTIONS.forEach(function (a) {
        if (a.type !== g[0]) return;
        var st = actState(a); if (!st) return;
        var b = document.createElement("button");
        b.className = "act " + (a.isCase ? "case" : a.type === "s" ? "sta" : "dyn");
        var desc = a.isCase ? "《" + CASES[s.active].title + "》" : a.d;
        b.innerHTML = esc(fill(a.n)) + "<small>" + esc(st.why || desc + (a.sp > 0 ? " · 体力-" + a.sp : "")) + "</small>";
        if (st.why) b.disabled = true;
        b.onclick = function () { doAction(a); };
        grid.appendChild(b);
      });
      wrap.appendChild(grid); card.appendChild(wrap);
    });
    var custom = document.createElement("div"); custom.className = "custom";
    custom.innerHTML = '<input id="custom-in" maxlength="40" placeholder="✏️ 自定义行动，例如：去街市买菜">' + "<button id=\"custom-go\">执行</button>";
    card.appendChild(custom);
    var end = document.createElement("button"); end.className = "endslot";
    end.textContent = s.slot < 2 ? "⏭️ 结束" + SLOT_NAMES[s.slot].slice(2) + "，进入" + SLOT_NAMES[s.slot + 1].slice(2) : "🛏️ 结束今天，去睡觉";
    end.onclick = endSlotNow;
    card.appendChild(end);
    dock.appendChild(card);
    $("custom-go").onclick = doCustom;
    $("custom-in").onkeydown = function (e) { if (e.key === "Enter") doCustom(); };
    if (s.pts === 0) print([{ sys: "📌 DM提醒：这个时段的行动力已经用完了。" }]);
  }
  function doAction(a) {
    if (busy) return;
    var st = actState(a); if (!st || st.why) return;
    s.pts -= st.cost;
    if (a.type === "s") s.staticN++; else s.dynN++;
    if (a.sp > 0) s.sp = Math.max(0, s.sp - a.sp); else if (a.sp < 0) s.sp = Math.min(100, s.sp - a.sp);
    clearDock();
    if (a.isCase) {
      print([{ me: "▶ " + a.n + "：《" + CASES[s.active].title + "》" }], function () { runScene(s.active + "_go", function () { endSlotNow(); }); });
      return;
    }
    busy = true;
    var out = [{ me: "▶ " + fill(a.n) }].concat(a.run());
    print(out, function () { busy = false; if (!checkDeath()) { save(); showActions(); } });
    updateStatus();
  }

  var UNREAL = ["飞", "瞬移", "隐身", "穿墙", "魔法", "超能力", "时间倒流", "穿越", "变身", "复活", "召唤神龙", "喷火", "激光", "读心", "长生不老", "中六合彩", "无敌", "核弹", "机甲"];
  var CUSTOM_MAP = [
    [/读|书|看书|学习/, "read"], [/打坐|冥想|静心/, "meditate"], [/画符|符咒/, "talisman"],
    [/小玲|聊天|说话|谈心/, "chat"], [/香/, "incense"], [/客人|接待|开店|营业/, "consult"],
    [/休息|睡|躺|小憩/, "nap"], [/跑步|运动|健身|体能|扎马/, "body"], [/闪避|身法|步法/, "dodge"],
    [/修炼|练功|灵力/, "spirit"], [/法事|打工|赚钱/, "job"], [/买|庙街|法器|购物|老何/, "shop"], [/委托|调查|现场/, "case"]
  ];
  function doCustom() {
    var inp = $("custom-in"), t = (inp.value || "").trim();
    if (!t || busy) return;
    for (var i = 0; i < UNREAL.length; i++) {
      if (t.indexOf(UNREAL[i]) >= 0) {
        s.unreal = (s.unreal || 0) + 1;
        clearDock();
        var out = [{ me: "▶ " + t }];
        if (s.unreal === 1) {
          out.push({ bad: "🚫 DM：这是一个偏现实的世界。" }, { bad: "你是道士，不是神仙，做不到这种事。" }, { bad: "如果再有这种念头，你会开始怀疑自己的理智。" });
          print(out, showActions);
        } else {
          var r = roll({ stat: "san", dc: 12 });
          out.push({ dice: "🎲 暗骰（理智）……" + (r.ok ? "成功。" : "失败。") });
          if (r.ok) out.push("你猛地回过神。", "刚才那个念头，荒唐得让你自己都吓了一跳。");
          else out = out.concat(["你真的以为自己做到了。", "直到小玲摇着你的肩膀，你才发现自己一直站在原地，对着空气说话。", { bad: "那是幻觉。" }], G.san(s, -10), G.aff(s, "xl", -2));
          print(out, function () { if (!checkDeath()) showActions(); });
        }
        updateStatus();
        return;
      }
    }
    for (var j = 0; j < CUSTOM_MAP.length; j++) {
      if (CUSTOM_MAP[j][0].test(t)) {
        var a = ACTIONS.filter(function (x) { return x.id === CUSTOM_MAP[j][1]; })[0];
        var st = actState(a);
        if (!st || st.why) { print([{ me: "▶ " + t }, { bad: "现在做不到：" + (st ? st.why : "条件不足") + "。" }]); return; }
        return doAction(a);
      }
    }
    // 普通小事
    if (s.pts < 1 || s.staticN >= 3) { print([{ me: "▶ " + t }, { bad: "这个时段已经没有余力做别的事了。" }]); return; }
    s.pts -= 1; s.staticN++; s.sp = Math.max(0, s.sp - 3);
    clearDock();
    print([{ me: "▶ " + t }, pick(["你花了点时间做这件事。", "你照自己的意思去做了。"]), "日子平平淡淡地过去了一点。"], showActions);
  }

  /* ================= 状态栏 ================= */
  function statusLine() {
    return "【HP:" + s.hp + "/100 | SAN:" + s.san + "/100 | SP:" + s.sp + "/100 | 负重:" + weight() + "/" + MAX_W + "kg | $" + s.money.toLocaleString() + " | 灵气:" + s.lingqi + "/" + s.lingqiMax + " | 状态:" + statusText() + "】";
  }
  function updateStatus() {
    if (!s) return;
    $("statusline").textContent = "第" + s.day + "天 " + lunar(s.day) + " " + SLOT_NAMES[s.slot] + "\n" + statusLine();
  }

  /* ================= 弹窗 ================= */
  function openModal(kind) {
    var body = $("modal-body"), h = "";
    if (kind === "stats") {
      h = "<h3>📊 属性</h3><pre class='stat-card'>" + esc(
        "姓名：" + s.name + "（" + s.gender + "，18岁，道士）\n" +
        "外貌：" + s.looks + "/10" + (s.feature ? "，" + s.feature : "") + "\n" +
        "性格：" + (s.mbti || "—") + "\n" +
        "────────────────────\n" +
        "❤️ 生命值 HP　" + s.hp + "/100\n" +
        "🧠 理智值 SAN " + s.san + "/100\n" +
        "⚡ 体力 SP　　" + s.sp + "/100\n" +
        "✨ 灵力　　　 " + s.lingli + "/50\n" +
        "💪 体质　　　 " + s.tizhi + "/50\n" +
        "🌀 闪避　　　 " + s.shanbi + "/100（负重后 " + effShanbi() + "）\n" +
        "🗣️ 辩论　　　 " + s.bianlun + "/50\n" +
        "💠 灵气　　　 " + s.lingqi + "/" + s.lingqiMax + "\n" +
        "💰 金钱　　　 $" + s.money.toLocaleString() + (s.debt ? "（欠租 $" + s.debt.toLocaleString() + "）" : "") + "\n" +
        "🎒 负重　　　 " + weight() + "/" + MAX_W + "kg\n" +
        "🩺 状态　　　 " + statusText() + "\n" +
        "────────────────────\n" +
        "📜 委托：" + ["c1", "c2", "c3"].map(function (id) { var r = s.cases[id]; return "《" + CASES[id].title + "》" + ({ good: "圆满", seal: "封印", fail: "失败", skip: "错过" }[r] || (s.active === id ? "进行中" : "未接")); }).join("\n　　　") + "\n" +
        "🏮 距离七月十四：" + Math.max(0, FINAL_DAY - s.day) + " 天") + "</pre>";
    } else if (kind === "bag") {
      h = "<h3>🎒 背包</h3><p class='muted' style='font-size:13px;margin:0 0 6px'>点「携带」决定出门带什么。负重 <b>" + weight() + "/" + MAX_W + "kg</b>，超过 8kg 会拖慢闪避。</p>";
      Object.keys(ITEM_INFO).forEach(function (k) {
        var n = s.items[k] || 0; if (!n) return;
        var info = ITEM_INFO[k];
        h += "<div class='bag-row'><div>" + k + " ×" + n + "<small>" + info.desc + (info.gear ? "（" + info.w + "kg）" : "") + "</small></div>" +
          (info.gear ? "<button data-carry='" + k + "' class='" + (s.carry[k] ? "on" : "") + "'>" + (s.carry[k] ? "✅ 携带" : "携带") + "</button>" : "") + "</div>";
      });
      h += "<h3 style='margin-top:14px'>🧧 锦囊</h3>";
      for (var i = 0; i < 3; i++) {
        h += "<div class='bag-row'><div>" + JINNANG[i].title + "<small>" + (s.jin[i] ? "已打开" : s.jinUnlocked[i] ? "可以打开了" : "时候未到") + "</small></div>" +
          (s.jin[i] ? "<button data-reread='" + i + "'>重读</button>" : s.jinUnlocked[i] ? "<button data-jin='" + i + "' class='danger'>打开</button>" : "") + "</div>";
      }
    } else if (kind === "rel") {
      var tree = s.name + "（道士 · 玄清堂）\n";
      tree += "├── 👴 爷爷 ············ 已故\n";
      tree += "├── 👧 金小玲（助理）\n│     好感 " + (s.aff.xl >= 0 ? "+" : "") + s.aff.xl + "｜" + affLabel(s.aff.xl) + "｜" + xlStage() + "\n";
      tree += "│     " + (s.xl.age || 20) + "岁 · " + (s.xl.looks || "马尾，笑起来有虎牙") + " · " + (s.xl.mbti || "ENFP，嘴硬心软") + "\n";
      var hasHe = s.aff["老何"] !== undefined;
      var clients = s.relations.filter(function (id) { return CASES[id]; });
      tree += (clients.length ? "├── " : "└── ") + "🧙 老何（法器铺）" + (hasHe ? "  好感 +" + s.aff["老何"] + "｜" + affLabel(s.aff["老何"]) : "  未见面") + "\n";
      if (clients.length) {
        tree += "└── 📜 委托人\n";
        clients.forEach(function (id, idx) {
          var c = CASES[id], v = s.aff[c.client] || 0;
          tree += "      " + (idx === clients.length - 1 ? "└── " : "├── ") + c.client + "  好感 " + (v >= 0 ? "+" : "") + v + "｜" + affLabel(v) + "\n";
        });
      }
      h = "<h3>🕸️ 关系网</h3><pre class='stat-card'>" + esc(tree) + "</pre>" +
        "<pre class='stat-card' style='border-color:#2a3142;color:#8f97a8'>好感区间：敌对 -100~-51 · 冷漠 -50~-1 · 中立 0~20\n　　　　　友善 21~50 · 信任 51~80 · 深厚羁绊 81~100</pre>" +
        "<button class='menu-btn danger' data-fire='1'>辞退小玲</button>";
    } else if (kind === "shop") {
      var disc = (s.aff["老何"] || 0) >= 10 ? 0.9 : 1;
      h = "<h3>🛒 老何法器铺</h3><p class='muted' style='font-size:13px;margin:0 0 6px'>现金 $" + s.money.toLocaleString() + (disc < 1 ? " · 老熟客九折" : "") + "</p>";
      SHOP.forEach(function (it, idx) {
        var p = Math.round(it.price * disc);
        h += "<div class='shop-row'><div>" + it.t + "<small>" + ITEM_INFO[it.k].desc + "</small></div><button data-buy='" + idx + "'" + (s.money < p ? " disabled" : "") + ">$" + p.toLocaleString() + "</button></div>";
      });
    } else if (kind === "menu") {
      h = "<h3>☰ 菜单</h3><button class='menu-btn' data-m='morning'>⏪ 回到今天早上</button><button class='menu-btn danger' data-m='restart'>🗑️ 放弃存档，重新开始</button>" +
        "<p class='muted' style='font-size:12px'>游戏会在每个时段开始时自动存档。</p>";
    }
    body.innerHTML = h;
    $("modal").hidden = false;
    body.onclick = function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.dataset.carry) { var k = t.dataset.carry; s.carry[k] = !s.carry[k]; save(); updateStatus(); openModal("bag"); refreshDockIfActions(); }
      else if (t.dataset.jin) { var i = +t.dataset.jin; closeModal(); if (s.scene) { openJin(i); } else { clearDock(); openJin(i, showActions); } }
      else if (t.dataset.reread) { var j = +t.dataset.reread; body.innerHTML = "<h3>" + JINNANG[j].title + "</h3>" + JINNANG[j].lines.map(function (l) { return lineEl(l).outerHTML; }).join(""); body.querySelectorAll(".ln").forEach(function (x) { x.style.opacity = 1; x.style.animation = "none"; }); }
      else if (t.dataset.buy) {
        var it = SHOP[+t.dataset.buy], p = Math.round(it.price * ((s.aff["老何"] || 0) >= 10 ? 0.9 : 1));
        if (s.money < p) return;
        s.money -= p; s.items[it.k] = (s.items[it.k] || 0) + it.n;
        if (ITEM_INFO[it.k].gear && s.carry[it.k] === undefined) s.carry[it.k] = true;
        var out = [{ chg: "🛒 买了" + it.t + "，-$" + p.toLocaleString() }];
        if (Math.random() < 0.5) out = out.concat(G.aff(s, "老何", 2));
        print(out); updateStatus(); save(); openModal("shop");
      }
      else if (t.dataset.fire) { if (confirm("爷爷说过，不能辞退小玲，直到一切结束。\n\n你确定要辞退她吗？")) { closeModal(); showEnding("fire"); } }
      else if (t.dataset.m === "morning") { var m = localStorage.getItem(MORNING_KEY); if (m && confirm("回到今天早上？之后的进度会丢失。")) { closeModal(); s = JSON.parse(m); resumeGame(true); } }
      else if (t.dataset.m === "restart") { if (confirm("确定放弃当前存档？")) { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(MORNING_KEY); location.reload(); } }
    };
  }
  function closeModal() { $("modal").hidden = true; }
  function refreshDockIfActions() { if (dock.querySelector(".act-card")) showActions(); }
  $("modal-x").onclick = closeModal;
  $("modal").onclick = function (e) { if (e.target === $("modal")) closeModal(); };
  document.querySelectorAll("[data-open]").forEach(function (b) { b.onclick = function () { if (s) openModal(b.dataset.open); }; });

  /* ================= 结局 ================= */
  var ENDINGS = {
    death: { title: "💀 死亡", lines: ["你眼前一黑。", "最后听见的，是雨声。"] },
    mad: { title: "🌀 疯癫结局", lines: ["你开始分不清哪些声音是真的。", "有人说，玄清堂的新老板每天对着空椅子泡茶。", "椅子上，坐满了看不见的客人。"] },
    bankrupt: { title: "🏚️ 坏结局 · 玄清堂结业", lines: ["房东换了锁。", "你抱着爷爷的法器箱站在街上。", "小玲一直陪你站到天黑。", "七月十四那一晚，她没有了门神的保护。", "后来，再也没有人见过她。"] },
    fire: { title: "🥀 坏结局 · 爷爷的遗言", lines: ["小玲没有哭。", "她只是把钥匙放在柜台上，轻声说了一句「保重」。", "那天晚上，店门外的门神画像，自己裂开了。", "三天后，你在报纸的角落看到一则新闻。", "一名年轻女子在家中离奇身亡，死因不明。", "你终于明白了爷爷那句话的意思。", "可是已经太迟了。"] },
    open: { title: "🚪 坏结局 · 门开了", lines: ["铁闸的锁「咔哒」一声弹开。", "门外什么都没有。", "只有一阵冷风吹进来，吹灭了七盏灯。", "等你回过神，小玲已经不见了。", "柜台上，留着她那天带来的那杯冻柠茶。", "冰早就化了。"] },
    betray: { title: "🖤 坏结局 · 还债的人", lines: ["你把小玲推向那团影子。", "她回头看你的那一眼，你一辈子都忘不了。", "邪物满意地走了。", "你活了下来。", "可是从那天起，你再也画不出一张像样的符。", "玄清堂的招牌，在第二年的台风里掉了下来。"] },
    sacrifice: { title: "🕯️ 牺牲结局 · 以命换命", lines: ["你握住桃木剑，把剑尖对准自己的心口。", "「要命，拿我的。」", "影子停住了。", "它似乎在衡量，哪一条命更值钱。", "最后，它选了你。", "天亮的时候，小玲在神台前醒来。", "七盏灯只剩下一盏还亮着。", "那一年之后，玄清堂还开着。", "新老板是一个扎马尾的女生。", "她画的符歪歪扭扭，却总是很灵。"] },
    win: { title: "🔥 好结局 · 破煞", lines: ["桃木剑劈开影子的一刻，七盏灯同时爆出金光。", "邪物发出一声尖叫，碎成了满屋的纸灰。", "天亮了。", "小玲坐在地上，哭着笑，笑着哭。", "你们一起推开铁闸。", "街上的人刚刚开始收拾昨晚的火盆，好像什么都没有发生过。"] },
    "true": { title: "🌅 真结局 · 债已两清", lines: ["「债主已经收过一次。」", "「一个老人用剩下的寿命替她还了。」", "「按规矩，你不能再收。」", "影子沉默了很久。", "最后，它慢慢退回了黑暗里。", "「……那个老道士，教出了个好传人。」", "天亮的时候，第一缕阳光照在爷爷的遗照上。", "你好像看见，照片里的他笑了一下。", "小玲把两杯冻柠茶放在柜台上。", "「小老板，今天还开门吗？」", "「开。」"] }
  };
  function showEnding(kind, deathText) {
    if (s.ended) return;
    s.ended = kind;
    var e = ENDINGS[kind] || ENDINGS.death;
    var lines = (kind === "death" && deathText) ? deathText : e.lines;
    var summary = "存活天数：" + s.day + " 天\n" +
      "委托：" + ["c1", "c2", "c3"].map(function (id) { return "《" + CASES[id].title + "》" + ({ good: "圆满", seal: "封印", fail: "失败", skip: "错过" }[s.cases[id]] || "未完成"); }).join(" / ") + "\n" +
      "小玲：好感 " + s.aff.xl + "｜" + affLabel(s.aff.xl) + "｜" + xlStage() + "\n" +
      "锦囊：已打开 " + s.jin.filter(Boolean).length + "/3";
    if (kind === "true" || kind === "win") summary += "\n\n玄清堂，继续营业。";
    var html = "<h2>" + e.title + "</h2>" + lines.map(function (l) { return "<p>" + esc(fill(l)) + "</p>"; }).join("") +
      "<pre class='stat-card' style='margin-top:16px'>" + esc(summary) + "</pre>";
    var canRetry = kind === "death" || kind === "mad";
    html += (canRetry ? "<button class='big ghost' id='end-morning'>⏪ 回到今天早上</button>" : "") + "<button class='big' id='end-restart'>🕯️ 重新开始</button>";
    localStorage.removeItem(SAVE_KEY);
    setTimeout(function () {
      $("ending-card").innerHTML = html;
      $("game").hidden = true; $("ending").hidden = false; window.scrollTo(0, 0);
      $("end-restart").onclick = function () { localStorage.removeItem(MORNING_KEY); location.reload(); };
      if (canRetry) $("end-morning").onclick = function () {
        var m = localStorage.getItem(MORNING_KEY); if (!m) return location.reload();
        s = JSON.parse(m); $("ending").hidden = true; resumeGame(true);
      };
    }, kind === "death" ? 900 : 400);
  }

  /* ================= 存档 ================= */
  function save() { if (s && !s.ended) localStorage.setItem(SAVE_KEY, JSON.stringify(s)); }
  function resumeGame(fromMorning) {
    showScreen("game");
    log.innerHTML = ""; clearDock(); cont = null; busy = false;
    s.ended = false; s.scene = null;
    print([{ sys: fromMorning ? "⏪ 回到了第 " + s.day + " 天的早上。" : "📖 继续上次的故事。" }]);
    updateStatus();
    if (fromMorning) startSlot(true, false); else startSlot(s.slot === 0, true);
  }
  function showScreen(id) { ["title", "create", "game", "ending"].forEach(function (x) { $(x).hidden = x !== id; }); window.scrollTo(0, 0); }

  /* ================= 角色创建 ================= */
  $("f-looks").oninput = function () { $("f-looks-val").textContent = this.value; };
  $("btn-new").onclick = function () { showScreen("create"); };
  $("btn-continue").onclick = function () { var d = localStorage.getItem(SAVE_KEY); if (!d) return; s = JSON.parse(d); resumeGame(false); };
  if (localStorage.getItem(SAVE_KEY)) $("btn-continue").hidden = false;

  var pending = null;
  $("btn-create").onclick = function () {
    var name = $("f-name").value.trim();
    if (!name) { $("create-err").textContent = "请先填写姓名。"; $("create-err").hidden = false; return; }
    $("create-err").hidden = true;
    var mbti = $("f-mbti").value || pick(["INTJ", "INFP", "ENFP", "ISTP", "ENTJ", "ISFJ", "ESTP", "INFJ"]);
    var st = {
      name: name, gender: $("f-gender").value, looks: +$("f-looks").value, feature: $("f-feature").value.trim(), mbti: mbti,
      xl: { age: +$("x-age").value || 0, looks: $("x-looks").value.trim(), mbti: $("x-mbti").value.trim() },
      day: 1, slot: 0, pts: 4, staticN: 0, dynN: 0,
      hp: 100, san: 100, sp: 100,
      lingli: rnd(10, 16), tizhi: rnd(10, 16), shanbi: rnd(22, 30), bianlun: rnd(10, 16),
      money: 9000, lingqi: 60, lingqiMax: 100,
      items: { "桃木剑": 1, "罗盘": 1, "铜铃": 1, "镇煞符": 2, "符纸": 6, "糯米": 1 },
      carry: { "桃木剑": true, "罗盘": true, "铜铃": true, "镇煞符": true, "糯米": true, "八卦镜": true, "护身玉": true },
      aff: { xl: 10 }, flags: {}, status: [], cases: {}, declined: {}, relations: [],
      jin: [false, false, false], jinUnlocked: [true, false, false],
      active: null, deadline: 0, nextOffer: 2, debt: 0, done: 0
    };
    // 性格微调
    if (mbti[0] === "E") st.bianlun += 2;
    if (mbti[1] === "S") st.tizhi += 2; else st.lingli += 1;
    if (mbti[2] === "T") st.lingli += 1; else st.bianlun += 1;
    if (mbti[3] === "P") st.shanbi += 3;
    st.lingli = Math.min(20, st.lingli); st.tizhi = Math.min(20, st.tizhi); st.bianlun = Math.min(20, st.bianlun); st.shanbi = Math.min(35, st.shanbi);
    pending = st;
    var card = "【主角】" + st.name + "｜" + st.gender + "｜18岁｜道士\n外貌：" + st.looks + "/10" + (st.feature ? "，" + st.feature : "") + "\n性格：" + st.mbti + "\n\n" +
      "✨ 灵力 " + st.lingli + "/50　💪 体质 " + st.tizhi + "/50\n🌀 闪避 " + st.shanbi + "/100　🗣️ 辩论 " + st.bianlun + "/50\n" +
      "❤️ HP 100　🧠 SAN 100　⚡ SP 100　💠 灵气 60/100\n💰 $9,000\n\n" +
      "【金小玲】助理｜女｜" + (st.xl.age || 20) + "岁\n" + (st.xl.looks || "马尾，笑起来有虎牙") + "｜" + (st.xl.mbti || "ENFP，嘴硬心软") + "\n对灵异知识一无所知。";
    $("create-result").innerHTML = "<pre class='stat-card'>" + esc(card) + "</pre><button class='big' id='btn-start'>🏮 就这样，开始故事</button><button class='big ghost' id='btn-reroll'>🎲 重新随机</button>";
    $("create-result").hidden = false;
    $("btn-reroll").onclick = function () { $("btn-create").click(); };
    $("btn-start").onclick = function () {
      s = pending; localStorage.removeItem(MORNING_KEY);
      showScreen("game"); log.innerHTML = "";
      updateStatus();
      runScene("intro", function () { startSlot(false); });
    };
    $("create-result").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.__game = { get: function () { return s; }, G: G, roll: roll, mod: totalMod, run: function (id) { runScene(id); } };
})();
