/* 香港灵异模拟器 · 剧情数据
 * 行格式：
 *   "文字"                    旁白（一句一行）
 *   ["名字", "台词", 类别]      对白，类别：xl 小玲 / ye 爷爷 / ghost 灵体 / npc 路人 / evil 邪物
 *   {sys:"..."} {good:"..."} {bad:"..."} {big:"..."} {letter:"..."}
 * 选项：{t, show(s), req(s), reqText, check:{stat, dc, mod(s)}, eff(s,G), win, lose, go, end, endSlot, once}
 */
var STORY = {};
var CASES = {};

/* ===================== 开场 ===================== */
STORY.intro = {
  lines: [
    {big: "🌧️ 油麻地 · 玄清堂"},
    "雨已经下了三天。",
    "旧街尽头，「玄清堂」的木招牌被雨水泡得发黑。",
    "这是爷爷留下的店。",
    "也是你长大的地方。",
    "你是孤儿。",
    "是爷爷在一个下雨的晚上，把你从庙街的骑楼底下抱了回来。",
    "他是道士。",
    "他教你认符、画符、看罗盘，也教你怎么和「不该存在的东西」说话。",
    "几年前，他说自己老了，金盆洗手。",
    "三个月前，他却突然接下一张委托，再次出山。",
    "也是那时候，他聘请了一个助理，叫金小玲。",
    "半个月前，委托完成了。",
    "没过几天，爷爷就走了。",
    "临走前，他握着你的手，说了三句话。",
    ["爷爷", "「店，交给你了。」", "ye"],
    ["爷爷", "「不能辞退小玲，直到一切结束。」", "ye"],
    ["爷爷", "「三个锦囊……到时候，你自然知道该什么时候打开。」", "ye"],
    "他没有说「一切」指的是什么。",
    "现在，你继承了这间店、一箱法器、三个锦囊。",
    "还有每七天要交的店租，和小玲的工资。",
    {sys: "📅 今天是农历六月廿六。再过十几天，就是七月十四。"}
  ],
  choices: [{ t: "🚪 推开店门", go: "day1" }]
};

STORY.day1 = {
  lines: [
    "门铃「叮」地响了一声。",
    "一个扎着马尾的女生探头进来，手里提着两杯冻柠茶。",
    ["小玲", "「老板……啊，不对，现在是小老板了。」", "xl"],
    ["小玲", "「我照常来上班，可以吗？」", "xl"],
    "她笑得有点勉强。",
    "你知道，她也在难过。"
  ],
  choices: [
    { t: "「当然可以。以后请多指教。」", eff: function (s, G) { return G.aff(s, "xl", 6); }, go: "day1b" },
    { t: "「……嗯。」", go: "day1b" },
    { t: "「爷爷不在了，你怕不怕？」", eff: function (s, G) { return G.aff(s, "xl", 4); }, go: "day1c" }
  ]
};
STORY.day1c = {
  lines: [
    "小玲把冻柠茶放到你面前，想了想。",
    ["小玲", "「怕。」", "xl"],
    ["小玲", "「但我更怕你一个人撑不住。」", "xl"]
  ],
  next: "day1b"
};
STORY.day1b = {
  lines: [
    "你打开爷爷留下的木箱。",
    "桃木剑、罗盘、一只铜铃、几张画好的镇煞符，还有一叠空白符纸。",
    "最底下，压着三个用红绳扎好的锦囊。",
    "锦囊上分别写着：「一」「二」「三」。",
    {sys: "📌 DM提示：每个时段（上午／下午／晚上）有 4 点行动力。\n🟢 静态活动（在店里）每项 1 点，每个时段最多 3 项。\n🔵 动态活动（出门、训练、运动）每项 2 点，每个时段最多 2 项。\n🌙 晚上结束后会自动睡觉，体力和灵气会恢复。\n💰 每 7 天要交店租 $4,000 和小玲的工资 $2,500。"}
  ],
  choices: [{ t: "开始营业", end: true }]
};

/* ===================== 锦囊 ===================== */
var JINNANG = [
  {
    title: "锦囊一",
    lines: [
      {letter: "「凡怨灵，先问其名，再问其愿。\n以理服之，胜于以力制之。」"},
      "字迹是爷爷的，一笔一画都很用力。",
      {good: "✨ 之后和灵体交谈、说服时，会更有把握。"}
    ]
  },
  {
    title: "锦囊二",
    lines: [
      {letter: "「阴路问名，切莫应答。\n反问其名，可知其来处。」"},
      "纸的背面还有一行小字：「孩子，别怕。」",
      {good: "✨ 你知道了在「阴路」上被问名字时该怎么做。"}
    ]
  },
  {
    title: "锦囊三",
    lines: [
      {letter: "「七月十四，鬼门大开。\n三个月前那张委托，委托人是小玲的母亲。\n她年轻时向邪物借命，换回了小玲一条命。\n如今，邪物来收债。\n我以余寿，替她挡了一次。\n但它还会再来，就在七月十四那一晚。\n店里的门神与结界，是护她的最后一道墙。\n所以，不能让她离开。\n当晚：关门，点七星灯。\n不论听见谁敲门，都不要开。\n孩子，这一关，要你自己过了。」"},
      "你拿着信纸，很久都没有说话。",
      "原来爷爷最后接下的那张委托，就是小玲。",
      {bad: "⚠️ 七月十四晚上，邪物会来。准备好镇煞符、灵气，还有……小玲对你的信任。"}
    ]
  }
];

/* ===================== 委托一：红伞 ===================== */
CASES.c1 = { title: "红伞", client: "陈太", clientRole: "委托人（福安楼住客）", deadline: 3, price: 6000 };

STORY.c1_offer = {
  lines: [
    {big: "📜 新委托"},
    "门铃响了。",
    "进来的是一位五十多岁的太太，手里紧紧攥着一把折好的雨伞。",
    ["陈太", "「请问……清叔在吗？」", "npc"],
    "你告诉她，爷爷上个月走了。",
    "你是他的{孙}，现在店由你来管。",
    "陈太愣住了，眼眶一下子红了。",
    "她犹豫了很久，才慢慢开口。",
    ["陈太", "「我住在深水埗一栋旧唐楼，叫福安楼，七楼。」", "npc"],
    ["陈太", "「这个月开始，每晚三点多，楼梯转角都站着一个女人。」", "npc"],
    ["陈太", "「她撑着一把红伞。」", "npc"],
    ["陈太", "「在楼梯里撑伞……你说，这正常吗？」", "npc"],
    ["陈太", "「昨晚，她站到我家门口了。」", "npc"]
  ],
  go: "c1_hub"
};
STORY.c1_hub = {
  lines: [],
  choices: [
    { t: "「那个女人有没有说过什么？」", show: function (s) { return !s.flags.c1_q1; },
      eff: function (s) { s.flags.c1_q1 = 1; }, check: { stat: "bianlun", dc: 10 }, win: "c1_q1w", lose: "c1_q1l" },
    { t: "「这栋楼以前出过什么事吗？」", show: function (s) { return !s.flags.c1_q2; },
      eff: function (s) { s.flags.c1_q2 = 1; }, check: { stat: "bianlun", dc: 12 }, win: "c1_q2w", lose: "c1_q2l" },
    { t: "谈报酬", go: "c1_price" }
  ]
};
STORY.c1_q1w = { lines: [
  "陈太用力想了想。",
  ["陈太", "「她……好像一直在问：「他来了没有？」」", "npc"],
  {good: "🔎 线索：红伞女人在等一个人。"}
], go: "c1_hub", enter: function (s) { s.flags.c1_wait = 1; } };
STORY.c1_q1l = { lines: ["陈太一想起那晚就发抖，什么也说不出来。"], go: "c1_hub" };
STORY.c1_q2w = { lines: [
  "陈太压低了声音。",
  ["陈太", "「听老街坊说，十几年前，天台的水箱房里找到过一个租客。」", "npc"],
  ["陈太", "「姓何，是个年轻女孩。」", "npc"],
  {good: "🔎 线索：她可能姓何。"}
], go: "c1_hub", enter: function (s) { s.flags.c1_name = 1; } };
STORY.c1_q2l = { lines: ["陈太摇摇头，说她才搬来几年，不清楚。"], go: "c1_hub" };

STORY.c1_price = {
  lines: [["陈太", "「我没有多少钱……六千块，可以吗？」", "npc"]],
  choices: [
    { t: "「可以。这件事交给我。」", eff: function (s, G) { s.price = 6000; return G.aff(s, "陈太", 15); }, go: "@accept" },
    { t: "「这种事有风险，至少要九千。」", check: { stat: "bianlun", dc: 13 }, win: "c1_pw", lose: "c1_pl" },
    { t: "「抱歉，这单我暂时接不了。」", go: "@decline" }
  ]
};
STORY.c1_pw = { lines: ["陈太咬了咬牙，点头答应了。", ["陈太", "「只要能让她走……九千就九千。」", "npc"]],
  enter: function (s) { s.price = 9000; }, go: "@accept" };
STORY.c1_pl = { lines: ["陈太的脸色变得很难看。", ["陈太", "「清叔以前……从来不会这样跟街坊讲价。」", "npc"], "最后还是六千。"],
  enter: function (s, G) { s.price = 6000; return G.aff(s, "陈太", -10); }, go: "@accept" };

STORY.c1_go = {
  lines: [
    {big: "🌙 深水埗 · 福安楼"},
    "凌晨两点半。",
    "福安楼的铁闸半掩着，楼梯灯一闪一闪。",
    "看更伯坐在门口的塑料凳上，收音机里放着粤剧。"
  ],
  choices: [
    { t: "「阿伯，这栋楼以前有没有一个姓何的女孩？」", show: function (s) { return s.flags.c1_name; },
      check: { stat: "bianlun", dc: 8 }, win: "c1_guard", lose: "c1_guardl" },
    { t: "「阿伯，这栋楼……以前出过事吗？」", show: function (s) { return !s.flags.c1_name; },
      check: { stat: "bianlun", dc: 11 }, win: "c1_guard", lose: "c1_guardl" },
    { t: "不打扰他，直接上楼", go: "c1_stairs" }
  ]
};
STORY.c1_guard = {
  lines: [
    "看更伯关掉收音机，叹了口气。",
    ["看更伯", "「你说的是何小曼吧。」", "npc"],
    ["看更伯", "「那女孩很乖的，每天都跟我打招呼。」", "npc"],
    ["看更伯", "「她男朋友说好了，下雨那天来接她去注册结婚。」", "npc"],
    ["看更伯", "「那天下了一整晚的雨。」", "npc"],
    ["看更伯", "「她撑着男朋友送的红伞，在楼梯口等了一夜。」", "npc"],
    ["看更伯", "「后来……就在天台水箱房找到了她。」", "npc"],
    ["看更伯", "「那把伞，一直没找到。」", "npc"],
    {good: "🔎 线索：她叫何小曼。红伞不见了。"}
  ],
  enter: function (s) { s.flags.c1_name = 1; s.flags.c1_full = 1; },
  choices: [{ t: "谢过看更伯，上楼", go: "c1_stairs" }]
};
STORY.c1_guardl = { lines: ["看更伯摆摆手，把收音机开得更大声了。", ["看更伯", "「半夜三更，别问这些。」", "npc"]],
  choices: [{ t: "上楼", go: "c1_stairs" }] };

STORY.c1_stairs = {
  crisis: true,
  lines: [
    "你一层一层往上走。",
    "到了五楼，楼梯灯「啪」地灭了。",
    "空气一下子冷了下来。",
    "楼梯转角，有一把红伞。",
    "伞下面，是一双湿透的红色布鞋。",
    ["？？？", "「……他来了没有？」", "ghost"]
  ],
  enter: function (s, G) { return G.san(s, -6); },
  go: "c1_face"
};
STORY.c1_face = {
  crisis: true, lines: [],
  choices: [
    { t: "「何小曼，我知道你在等谁。」", show: function (s) { return s.flags.c1_name; },
      check: { stat: "bianlun", dc: 9, talk: true }, win: "c1_talk", lose: "c1_angry" },
    { t: "「你在等谁？」", show: function (s) { return !s.flags.c1_name; },
      check: { stat: "bianlun", dc: 12, talk: true }, win: "c1_talk", lose: "c1_angry" },
    { t: "🧭 取出罗盘，找她的执念所在", req: function (s, G) { return G.carry(s, "罗盘"); }, reqText: "没带罗盘",
      check: { stat: "lingli", dc: 11 }, win: "c1_compass", lose: "c1_angry" },
    { t: "📿 贴上镇煞符，强行镇压", req: function (s, G) { return G.carry(s, "镇煞符"); }, reqText: "没带镇煞符",
      eff: function (s, G) { G.use(s, "镇煞符"); }, check: { stat: "lingli", dc: 13 }, win: "c1_seal", lose: "c1_sealfail" },
    { t: "🏃 转身就跑", check: { stat: "shanbi", dc: 10 }, win: "c1_flee", lose: "c1_fall" }
  ]
};
STORY.c1_talk = {
  lines: [
    "红伞轻轻抖了一下。",
    ["何小曼", "「你……认识他？」", "ghost"],
    ["何小曼", "「他说下雨就来接我的。」", "ghost"],
    ["何小曼", "「我等了好久，好久。」", "ghost"],
    "伞沿抬起，露出一张苍白的脸。",
    "她很年轻，比小玲大不了几岁。"
  ],
  enter: function (s) { s.flags.c1_name = 1; },
  choices: [
    { t: "「我帮你把伞找回来，好吗？」", go: "c1_umbrella" },
    { t: "「他不会来了。可是你不用再等了。」", check: { stat: "bianlun", dc: 12, talk: true }, win: "c1_release", lose: "c1_sad" }
  ]
};
STORY.c1_release = {
  lines: [
    "她沉默了很久。",
    ["何小曼", "「……原来，已经这么久了。」", "ghost"],
    "伞慢慢合上。",
    "她的身影像雾一样淡了下去。",
    "楼梯灯重新亮起。"
  ],
  go: "c1_goodend"
};
STORY.c1_sad = {
  lines: [
    ["何小曼", "「你骗我！」", "ghost"],
    "红伞猛地合上。",
    "楼道里所有的铁门同时砰砰作响。"
  ],
  enter: function (s, G) { return [].concat(G.san(s, -10), G.dmg(s, 10)); },
  choices: [
    { t: "「对不起。我帮你把伞找回来。」", go: "c1_umbrella" },
    { t: "🏃 往楼下逃", check: { stat: "shanbi", dc: 11 }, win: "c1_flee", lose: "c1_fall" }
  ]
};
STORY.c1_compass = {
  lines: [
    "罗盘的指针疯狂转了几圈，最后死死指向天花板。",
    "天台。",
    "伞下的女人没有动，只是一直重复那一句话。"
  ],
  go: "c1_umbrella"
};
STORY.c1_umbrella = {
  lines: [
    "你绕过她，爬上了天台。",
    "水箱房的铁门锈得几乎推不开。",
    "角落里，一把褪了色的红伞，被塞在两根水管之间。",
    "伞柄上刻着一行小字。",
    {letter: "「雨天，我来接你。」"},
    "你撑开伞，走回五楼。"
  ],
  enter: function (s, G) { return G.san(s, -3); },
  go: "c1_give"
};
STORY.c1_give = {
  lines: [
    "你把伞递过去。",
    "她伸出手，指尖冰冷，却很轻。",
    ["何小曼", "「原来……他来过。」", "ghost"],
    ["何小曼", "「他把伞藏在这里，是怕我淋雨。」", "ghost"],
    "她笑了。",
    "楼梯灯一盏一盏亮了起来。",
    "再回头时，转角只剩下一滩慢慢变干的水渍。"
  ],
  go: "c1_goodend"
};
STORY.c1_goodend = {
  lines: [
    {good: "✨ 委托完成：何小曼离开了。"},
    "第二天一早，陈太提着一袋橙来到店里。",
    ["陈太", "「昨晚，我睡了这个月第一个好觉。」", "npc"]
  ],
  enter: function (s, G) { return G.finishCase(s, "c1", "good"); },
  choices: [{ t: "回店里", endSlot: true }]
};
STORY.c1_angry = {
  crisis: true,
  lines: [
    "伞面慢慢转了过来。",
    "伞下什么都没有。",
    "只有一股冲天的水腥味，扑面而来。"
  ],
  enter: function (s, G) { return [].concat(G.dmg(s, 20), G.san(s, -8)); },
  choices: [
    { t: "📿 贴上镇煞符", req: function (s, G) { return G.carry(s, "镇煞符"); }, reqText: "没带镇煞符",
      eff: function (s, G) { G.use(s, "镇煞符"); }, check: { stat: "lingli", dc: 12 }, win: "c1_seal", lose: "c1_sealfail" },
    { t: "🧘 念净心咒，稳住心神", check: { stat: "san", dc: 11 }, win: "c1_calm", lose: "c1_angry2" },
    { t: "🏃 往楼下逃", check: { stat: "shanbi", dc: 12 }, win: "c1_flee", lose: "c1_fall" }
  ]
};
STORY.c1_calm = { lines: ["你闭上眼，一字一字念完净心咒。", "再睁开眼时，红伞又回到了转角。", "她还在等。"], go: "c1_face2" };
STORY.c1_face2 = {
  crisis: true, lines: [],
  choices: [
    { t: "「何小曼，我知道你在等谁。」", show: function (s) { return s.flags.c1_name; },
      check: { stat: "bianlun", dc: 10, talk: true }, win: "c1_talk", lose: "c1_angry2" },
    { t: "「你在等谁？」", show: function (s) { return !s.flags.c1_name; },
      check: { stat: "bianlun", dc: 13, talk: true }, win: "c1_talk", lose: "c1_angry2" },
    { t: "🏃 往楼下逃", check: { stat: "shanbi", dc: 11 }, win: "c1_flee", lose: "c1_fall" }
  ]
};
STORY.c1_angry2 = {
  lines: ["冰冷的水从天花板上倾泻下来。", "你被冲得撞在铁闸上。"],
  enter: function (s, G) { return [].concat(G.dmg(s, 25), G.san(s, -10)); },
  choices: [{ t: "🏃 拼命往楼下逃", check: { stat: "shanbi", dc: 10 }, win: "c1_flee", lose: "c1_fall" }]
};
STORY.c1_seal = {
  lines: [
    "符纸一贴上伞面，就「嗤」地冒起一阵白烟。",
    "女人的身影被压进墙角的影子里。",
    "楼道安静了。",
    "但你知道，她没有离开，只是被关了起来。",
    {sys: "💼 委托完成（封印）。陈太付了钱，看你的眼神却有些复杂。"}
  ],
  enter: function (s, G) { return [].concat(G.san(s, -5), G.finishCase(s, "c1", "seal")); },
  choices: [{ t: "回店里", endSlot: true }]
};
STORY.c1_sealfail = {
  crisis: true,
  lines: ["符纸在半空中烧成了灰。", "一只湿冷的手掐住了你的脖子。"],
  enter: function (s, G) { return [].concat(G.dmg(s, 25), G.san(s, -10)); },
  choices: [
    { t: "「何小曼！他没有忘记你！」", show: function (s) { return s.flags.c1_name; },
      check: { stat: "bianlun", dc: 11, talk: true }, win: "c1_talk", lose: "c1_angry2" },
    { t: "🏃 挣脱，往楼下逃", check: { stat: "shanbi", dc: 12 }, win: "c1_flee", lose: "c1_fall" }
  ]
};
STORY.c1_fall = {
  lines: ["你脚下一滑，从楼梯上滚了下去。", "身后，一直有雨声跟着你。"],
  enter: function (s, G) { return G.dmg(s, 30); },
  go: "c1_flee"
};
STORY.c1_flee = {
  lines: [
    "你冲出福安楼，一直跑到大街上才停下。",
    "回头看，七楼陈太家的窗口，站着一个撑伞的影子。",
    {bad: "❌ 委托失败。"}
  ],
  enter: function (s, G) { return [].concat(G.san(s, -10), G.finishCase(s, "c1", "fail")); },
  choices: [{ t: "狼狈地回店里", endSlot: true }]
};

/* ===================== 委托二：最后一班红色小巴 ===================== */
CASES.c2 = { title: "最后一班红色小巴", client: "阿强", clientRole: "委托人（小巴司机）", deadline: 3, price: 8000 };

STORY.c2_offer = {
  lines: [
    {big: "📜 新委托"},
    "一个穿着背心的中年男人冲进店里，满头大汗。",
    ["阿强", "「师傅！你一定要帮帮我！」", "npc"],
    ["阿强", "「我开通宵红色小巴的，跑半山那条夜路。」", "npc"],
    ["阿强", "「这半个月，每晚最后一班车，都会多一个乘客。」", "npc"],
    ["阿强", "「上车的时候没看见，一到弯道，倒后镜里后排就坐着一个穿校服的男孩。」", "npc"],
    ["阿强", "「收车一数钱……钱箱里多了一张冥币。」", "npc"],
    ["阿强", "「昨晚，冥币上写着三个字：「快到了」。」", "npc"]
  ],
  go: "c2_hub"
};
STORY.c2_hub = {
  lines: [],
  choices: [
    { t: "「那个男孩在哪里下车？」", show: function (s) { return !s.flags.c2_q1; },
      eff: function (s) { s.flags.c2_q1 = 1; }, check: { stat: "bianlun", dc: 10 }, win: "c2_q1w", lose: "c2_q1l" },
    { t: "「这条路以前出过事吗？」", show: function (s) { return !s.flags.c2_q2; },
      eff: function (s) { s.flags.c2_q2 = 1; }, check: { stat: "bianlun", dc: 12 }, win: "c2_q2w", lose: "c2_q2l" },
    { t: "谈报酬", go: "c2_price" }
  ]
};
STORY.c2_q1w = { lines: [["阿强", "「他从来没下过车。」", "npc"], ["阿强", "「每次过了九曲弯，一眨眼就不见了。」", "npc"], {good: "🔎 线索：男孩在九曲弯出现和消失。"}], go: "c2_hub" };
STORY.c2_q1l = { lines: ["阿强抓着头发，说他根本不敢细看。"], go: "c2_hub" };
STORY.c2_q2w = { lines: [
  "阿强脸色发白。",
  ["阿强", "「行内的老司机说过，二十年前，有一辆小巴在九曲弯翻了车。」", "npc"],
  ["阿强", "「车上有个补习完回家的学生仔，姓陈。」", "npc"],
  ["阿强", "「他家住的那个旧屋邨，后来都拆了。」", "npc"],
  {good: "🔎 线索：男孩姓陈，是要回家的学生。"}
], enter: function (s) { s.flags.c2_story = 1; }, go: "c2_hub" };
STORY.c2_q2l = { lines: ["阿强说他入行才三年，什么都不知道。"], go: "c2_hub" };
STORY.c2_price = {
  lines: [["阿强", "「八千！我全部身家就八千！」", "npc"]],
  choices: [
    { t: "「行，今晚开始跟车。」", eff: function (s, G) { s.price = 8000; return G.aff(s, "阿强", 15); }, go: "@accept" },
    { t: "「要跟阴路打交道，一万二。」", check: { stat: "bianlun", dc: 14 }, win: "c2_pw", lose: "c2_pl" },
    { t: "「抱歉，这单我暂时接不了。」", go: "@decline" }
  ]
};
STORY.c2_pw = { lines: ["阿强哭丧着脸，最后还是答应了。", ["阿强", "「命比钱重要……一万二。」", "npc"]], enter: function (s) { s.price = 12000; }, go: "@accept" };
STORY.c2_pl = { lines: ["阿强急得快哭了。", "你心一软，还是收了八千。"], enter: function (s, G) { s.price = 8000; return G.aff(s, "阿强", -5); }, go: "@accept" };

STORY.c2_go = {
  lines: [
    {big: "🌙 半山夜路 · 红色小巴"},
    "凌晨十二点四十分。",
    "你坐上了最后一班红色小巴。",
    "车上只有你和阿强。",
    "收音机沙沙作响，车一路往山上开。"
  ],
  choices: [
    { t: "坐到最后一排", eff: function (s, G) { s.flags.c2_back = 1; return G.san(s, -4); }, go: "c2_meet" },
    { t: "坐在司机旁边", go: "c2_meet" },
    { t: "🍚 在后排座位撒一把糯米", req: function (s, G) { return G.carry(s, "糯米"); }, reqText: "没带糯米",
      eff: function (s, G) { G.use(s, "糯米"); s.flags.c2_rice = 1; }, go: "c2_rice" }
  ]
};
STORY.c2_rice = {
  lines: ["糯米落在座位上，一粒一粒变黑。", "后排慢慢「坐」出了一个人形。", "它被糯米压着，显得很痛苦。"],
  go: "c2_meet"
};
STORY.c2_meet = {
  crisis: true,
  lines: [
    "车驶进九曲弯。",
    "倒后镜里，后排多了一个男孩。",
    "他穿着二十年前的旧款校服，书包湿漉漉的。",
    ["男孩", "「{哥姐}，你叫什么名字？」", "ghost"]
  ],
  go: "c2_face"
};
STORY.c2_face = {
  crisis: true, lines: [],
  choices: [
    { t: "告诉他你的名字", show: function (s) { return !s.flags.c2_named; },
      eff: function (s) { s.flags.c2_named = 1; }, go: "c2_trap" },
    { t: "不回答，反问：「你呢？你叫什么名字？」",
      check: { stat: "bianlun", dc: 11, talk: true, mod: function (s) { return (s.flags.c2_story ? 3 : 0) + (s.jin[1] ? 3 : 0) - (s.flags.c2_rice ? 2 : 0); } },
      win: "c2_talk", lose: "c2_crash" },
    { t: "🪞 用八卦镜照他", req: function (s, G) { return G.carry(s, "八卦镜"); }, reqText: "没带八卦镜",
      check: { stat: "lingli", dc: 13 }, win: "c2_mirror", lose: "c2_crash" },
    { t: "📿 贴上镇煞符", req: function (s, G) { return G.carry(s, "镇煞符"); }, reqText: "没带镇煞符",
      eff: function (s, G) { G.use(s, "镇煞符"); },
      check: { stat: "lingli", dc: 14, mod: function (s) { return s.flags.c2_rice ? 3 : 0; } }, win: "c2_seal", lose: "c2_crash" }
  ]
};
STORY.c2_trap = {
  lines: [
    "你刚说出口，就后悔了。",
    "男孩笑了。",
    ["男孩", "「{name}……我记住了。」", "ghost"],
    "一股寒意顺着脊椎爬上来。",
    {bad: "⚠️ 你被缠上了。"}
  ],
  enter: function (s, G) { G.addStatus(s, "被缠上"); return G.san(s, -18); },
  go: "c2_face"
};
STORY.c2_mirror = {
  lines: ["八卦镜里映出的，是一个浑身是水的男孩。", "他捂着眼睛缩成一团。", ["男孩", "「好亮……我只是想回家……」", "ghost"]],
  choices: [
    { t: "放下镜子：「你叫什么名字？」", check: { stat: "bianlun", dc: 9, talk: true }, win: "c2_talk", lose: "c2_crash" },
    { t: "📿 趁机贴上镇煞符", req: function (s, G) { return G.carry(s, "镇煞符"); }, reqText: "没带镇煞符",
      eff: function (s, G) { G.use(s, "镇煞符"); }, check: { stat: "lingli", dc: 10 }, win: "c2_seal", lose: "c2_crash" }
  ]
};
STORY.c2_talk = {
  lines: [
    ["男孩", "「我叫陈子朗。」", "ghost"],
    ["子朗", "「我补习完了，要回家。」", "ghost"],
    ["子朗", "「可是车一直开不到。」", "ghost"],
    ["子朗", "「每一晚，都开不到。」", "ghost"]
  ],
  choices: [
    { t: "「阿强，下山，去他以前住的屋邨。」", check: { stat: "bianlun", dc: 11 }, win: "c2_home", lose: "c2_panic" },
    { t: "骗他：「你已经到家了，下车吧。」", check: { stat: "bianlun", dc: 15, talk: true }, win: "c2_lie", lose: "c2_crash" }
  ]
};
STORY.c2_panic = {
  lines: ["阿强吓得一脚踩死刹车。", ["阿强", "「疯了！我不去！」", "npc"], "车尾甩了半圈，你的头撞在车窗上。", "好不容易，你才让阿强冷静下来，掉头下山。"],
  enter: function (s, G) { return [].concat(G.dmg(s, 10), G.san(s, -4)); },
  go: "c2_home"
};
STORY.c2_home = {
  lines: [
    "旧屋邨早就拆了，现在是一片围着铁皮的工地。",
    "小巴在路边停下。",
    "子朗背起书包，从后门走了下去。",
    "他回头朝你挥了挥手。",
    ["子朗", "「谢谢你送我回家。」", "ghost"],
    "工地的探照灯闪了一下。",
    "再看时，路边只剩下一张被雨打湿的补习班单张。",
    {good: "✨ 委托完成：子朗回家了。"}
  ],
  enter: function (s, G) { G.removeStatus(s, "被缠上"); return G.finishCase(s, "c2", "good"); },
  choices: [{ t: "坐阿强的车回店里", endSlot: true }]
};
STORY.c2_lie = {
  lines: ["子朗看了看窗外，犹豫着下了车。", "他站在路边，一脸迷茫。", "车开远了，你从倒后镜里看见，他还站在原地。", {sys: "💼 委托完成（勉强）。小巴上再也没有多出来的乘客，但你心里并不好受。"}],
  enter: function (s, G) { G.removeStatus(s, "被缠上"); return [].concat(G.san(s, -6), G.finishCase(s, "c2", "seal")); },
  choices: [{ t: "回店里", endSlot: true }]
};
STORY.c2_seal = {
  lines: ["符纸贴上的一刻，车里所有的灯都灭了。", "等灯再亮起来，后排空空如也。", "座位上只留下一滩水。", {sys: "💼 委托完成（封印）。"}],
  enter: function (s, G) { G.removeStatus(s, "被缠上"); return [].concat(G.san(s, -5), G.finishCase(s, "c2", "seal")); },
  choices: [{ t: "回店里", endSlot: true }]
};
STORY.c2_crash = {
  lines: [
    ["男孩", "「为什么……为什么不让我回家！」", "ghost"],
    "小巴猛地一甩。",
    "车灯扫过护栏，下面是黑漆漆的山崖。",
    "阿强死死抓着方向盘，方向盘却自己往崖边转。"
  ],
  enter: function (s, G) { return G.san(s, -10); },
  choices: [
    { t: "🤸 扑过去帮阿强扭方向盘", check: { stat: "shanbi", dc: 11 }, win: "c2_saved", lose: "c2_hit" },
    { t: "🧘 大喝一声，念镇魂咒", check: { stat: "lingli", dc: 12 }, win: "c2_saved", lose: "c2_hit" }
  ]
};
STORY.c2_saved = {
  lines: ["车头在离护栏半尺的地方停住了。", "后排空了。", "只有钱箱里，又多了一张冥币。", {bad: "❌ 委托失败。男孩还会回来。"}],
  enter: function (s, G) { return [].concat(G.dmg(s, 10), G.finishCase(s, "c2", "fail")); },
  choices: [{ t: "回店里", endSlot: true }]
};
STORY.c2_hit = {
  deathText: ["小巴撞穿护栏，翻下了山坡。", "黑暗里，有个孩子在你耳边说：", "「{name}，我们一起回家吧。」"],
  lines: ["小巴狠狠撞在护栏上。", "玻璃碎了一地。"],
  enter: function (s, G) { return G.dmg(s, 45); },
  go: "c2_saved"
};

/* ===================== 委托三：废校钟声 ===================== */
CASES.c3 = { title: "废校钟声", client: "阿Ken", clientRole: "委托人（大学生）", deadline: 2, price: 7000 };

STORY.c3_offer = {
  lines: [
    {big: "📜 新委托"},
    "一个戴眼镜的大学生站在门口，眼睛布满血丝。",
    ["阿Ken", "「你就是玄清堂的师傅？」", "npc"],
    ["阿Ken", "「前天晚上，我和阿文去西贡一间废校拍探险直播。」", "npc"],
    ["阿Ken", "「半夜十二点，钟楼的钟自己响了。」", "npc"],
    ["阿Ken", "「那口钟……根本没有绳子。」", "npc"],
    ["阿Ken", "「阿文说听到有人叫他上课，自己走上了钟楼。」", "npc"],
    ["阿Ken", "「下来之后他就晕倒了，现在还躺在医院，医生说查不出原因。」", "npc"],
    "你听完，心里一沉。",
    "这是失魂。",
    "魂离体越久，越难叫回来。",
    {bad: "⏳ 这单委托只有 2 天时间。"}
  ],
  go: "c3_price"
};
STORY.c3_price = {
  lines: [["阿Ken", "「我只是学生……我和同学凑了七千块。」", "npc"]],
  choices: [
    { t: "「够了。救人要紧。」", eff: function (s, G) { s.price = 7000; return [].concat(G.aff(s, "阿Ken", 20), G.aff(s, "xl", 3)); }, go: "@accept" },
    { t: "「招魂很伤元气，一万。」", check: { stat: "bianlun", dc: 13 }, win: "c3_pw", lose: "c3_pl" },
    { t: "「抱歉，这单我暂时接不了。」", go: "@decline" }
  ]
};
STORY.c3_pw = { lines: ["阿Ken低着头说，他去借。", "小玲在旁边看了你一眼，没说话。"], enter: function (s, G) { s.price = 10000; return G.aff(s, "xl", -3); }, go: "@accept" };
STORY.c3_pl = { lines: ["阿Ken红着眼眶说真的没有了。", "最后还是七千。"], enter: function (s) { s.price = 7000; }, go: "@accept" };

STORY.c3_go = {
  lines: [
    "你收拾法器的时候，小玲已经背好了背包，站在门口。",
    ["小玲", "「这次我也去。」", "xl"],
    ["小玲", "「我不想每次都只在店里等电话。」", "xl"]
  ],
  choices: [
    { t: "「好。跟紧我，我说跑就跑。」", eff: function (s, G) { s.flags.xl_with = 1; return G.aff(s, "xl", 5); }, go: "c3_school" },
    { t: "「太危险了，你留在店里。」", eff: function (s, G) { return G.aff(s, "xl", 1); }, go: "c3_school_alone" }
  ]
};
STORY.c3_school_alone = { lines: ["小玲咬着嘴唇，最后还是点了点头。", ["小玲", "「那你……一定要回来。」", "xl"]], go: "c3_school" };
STORY.c3_school = {
  lines: [
    {big: "🌙 西贡 · 晨光学校"},
    "铁门上的锁早就锈断了。",
    "操场的篮球架歪在一边。",
    "钟楼上，一口铜钟静静挂着。"
  ],
  choices: [
    { t: "先去课室，找阿文留下的东西", show: function (s) { return !s.flags.c3_class; }, go: "c3_class" },
    { t: "🔔 摇响铜铃，寻找阿文的魂", show: function (s) { return !s.flags.c3_rang; },
      req: function (s, G) { return G.carry(s, "铜铃"); }, reqText: "没带铜铃",
      eff: function (s) { s.flags.c3_rang = 1; }, check: { stat: "lingli", dc: 12 }, win: "c3_bellw", lose: "c3_belll" },
    { t: "直接上钟楼", go: "c3_tower" }
  ]
};
STORY.c3_class = {
  lines: [
    "课室的黑板上，还留着一行粉笔字：「明日停课」。",
    "阿文的手机掉在讲台下面，还在录影。",
    "你按下播放。",
    "画面里，阿文跟着一个穿长衫的背影，一步一步走上钟楼。",
    "那个背影回过头，对着镜头笑了一下。",
    {good: "🔎 线索：阿文的魂在钟楼，带走他的是一位「老师」。"}
  ],
  enter: function (s, G) { s.flags.c3_class = 1; s.flags.c3_bell = 1; return G.san(s, -6); },
  go: "c3_school"
};
STORY.c3_bellw = { lines: ["铜铃一响，钟楼上的铜钟也「嗡」地回应了一声。", "你感觉到，阿文的魂就在上面。", {good: "🔎 招魂的路已经打通了一半。"}],
  enter: function (s) { s.flags.c3_bell = 1; }, go: "c3_school" };
STORY.c3_belll = { lines: ["铜铃的声音被黑暗吞掉了。", "操场另一头，有人在拍皮球。", "一下，一下，越来越近。"],
  enter: function (s, G) { return G.san(s, -8); }, go: "c3_school" };

STORY.c3_tower = {
  crisis: true,
  lines: [
    "钟楼的楼梯很窄。",
    "每上一级，都能听见楼上有人用粉笔写字。",
    "顶层，一个穿长衫的老先生背对着你，在黑板上写字。",
    "阿文坐在旁边的小木凳上，眼神空洞，像个听课的学生。",
    ["老先生", "「迟到了。」", "ghost"],
    ["老先生", "「坐下。」", "ghost"]
  ],
  enter: function (s, G) {
    var out = G.san(s, -6);
    if (s.flags.xl_with) {
      out = out.concat(G.lines([
        "老先生的目光越过你，落在小玲身上。",
        ["老先生", "「……这孩子身上，怎么有两个人的命？」", "ghost"],
        "小玲的脸一下子白了。"
      ]));
      s.flags.seed_xl = 1;
    }
    return out;
  },
  go: "c3_face"
};
STORY.c3_face = {
  crisis: true, lines: [],
  choices: [
    { t: "恭敬地行礼：「先生，学生来接同学回家。」", check: { stat: "bianlun", dc: 11, talk: true }, win: "c3_talk", lose: "c3_scold" },
    { t: "🔔 摇响铜铃，把阿文的魂叫回来", req: function (s, G) { return G.carry(s, "铜铃"); }, reqText: "没带铜铃",
      check: { stat: "lingli", dc: 12, mod: function (s) { return s.flags.c3_bell ? 3 : 0; } }, win: "c3_ring", lose: "c3_fight" },
    { t: "📿 贴上镇煞符", req: function (s, G) { return G.carry(s, "镇煞符"); }, reqText: "没带镇煞符",
      eff: function (s, G) { G.use(s, "镇煞符"); }, check: { stat: "lingli", dc: 13 }, win: "c3_seal", lose: "c3_fight" },
    { t: "🤸 冲过去把阿文拉走", check: { stat: "shanbi", dc: 12 }, win: "c3_grab", lose: "c3_fight" }
  ]
};
STORY.c3_talk = {
  lines: [
    "老先生停下了粉笔。",
    ["老先生", "「接他回家？」", "ghost"],
    ["老先生", "「这间学校关门那天，一个学生都没有回来跟我说再见。」", "ghost"],
    ["老先生", "「我还有最后一课，没有上完。」", "ghost"]
  ],
  choices: [
    { t: "「那就让我们陪您上完这一课。」", go: "c3_lesson" },
    { t: "「先生，时代变了，学校不会再开了。」", check: { stat: "bianlun", dc: 13, talk: true }, win: "c3_lesson", lose: "c3_scold" }
  ]
};
STORY.c3_lesson = {
  lines: [
    "你在阿文旁边坐下。",
    "老先生转过身，在黑板上写了两个大字：「毕业」。",
    ["老先生", "「读书，是为了将来有一天，可以好好地离开一个地方。」", "ghost"],
    ["老先生", "「下课。」", "ghost"],
    "铜钟「当」地响了一声。",
    "阿文的魂像被风吹着一样，飘下了钟楼。",
    "老先生朝你们鞠了一躬，慢慢消失在粉笔灰里。"
  ],
  enter: function (s, G) {
    if (s.flags.xl_with) {
      return G.lines([
        "消失前，他看着小玲，轻声说了一句话。",
        ["老先生", "「孩子，替你还命的人已经走了。你要好好活。」", "ghost"],
        "小玲愣在原地，眼泪一下子就掉了下来。"
      ]);
    }
  },
  go: "c3_goodend"
};
STORY.c3_goodend = {
  lines: [{good: "✨ 委托完成：阿文醒了。"}, "天亮的时候，阿Ken打来电话，哭得说不出话。"],
  enter: function (s, G) { return G.finishCase(s, "c3", "good"); },
  choices: [{ t: "回店里", endSlot: true }]
};
STORY.c3_ring = {
  lines: ["铜铃和铜钟一起响了起来。", "阿文的眼睛眨了一下，他的魂顺着铃声飘下了楼梯。", "老先生没有阻止，只是看着你们，叹了口气。", {good: "✨ 委托完成：阿文醒了。"}],
  enter: function (s, G) { return [].concat(G.san(s, 4), G.finishCase(s, "c3", "good")); },
  choices: [{ t: "回店里", endSlot: true }]
};
STORY.c3_seal = {
  lines: ["镇煞符亮起金光，老先生被钉在黑板前。", "阿文的魂终于松脱，被你一把拉了回来。", "离开前，你听见身后有人低声说：「……下课。」", {sys: "💼 委托完成（封印）。"}],
  enter: function (s, G) { return [].concat(G.san(s, -6), G.finishCase(s, "c3", "seal")); },
  choices: [{ t: "回店里", endSlot: true }]
};
STORY.c3_grab = {
  lines: ["你冲过去，抓住阿文冰冷的手。", "老先生没有追来。", "阿文的魂回来了，可你知道，他以后每晚都会梦见那一堂课。", {sys: "💼 委托完成（勉强）。"}],
  enter: function (s, G) { return [].concat(G.san(s, -8), G.finishCase(s, "c3", "seal")); },
  choices: [{ t: "回店里", endSlot: true }]
};
STORY.c3_scold = {
  crisis: true,
  lines: [["老先生", "「上课不许说话！」", "ghost"], "满屋的粉笔灰像刀子一样刮过来。"],
  enter: function (s, G) { return [].concat(G.dmg(s, 15), G.san(s, -10)); },
  go: "c3_face2"
};
STORY.c3_fight = {
  crisis: true,
  lines: ["黑板上的粉笔字一行一行渗出黑水。", "整座钟楼都在摇晃。"],
  enter: function (s, G) { return [].concat(G.dmg(s, 25), G.san(s, -12)); },
  go: "c3_face2"
};
STORY.c3_face2 = {
  crisis: true, lines: [],
  choices: [
    { t: "（小玲突然挡在你前面）", show: function (s) { return s.flags.xl_with && s.aff.xl >= 51; }, go: "c3_xlsave" },
    { t: "🔥 以灵气灌注桃木剑，拼一把", req: function (s, G) { return G.carry(s, "桃木剑"); }, reqText: "没带桃木剑",
      eff: function (s, G) { return G.lingqi(s, -30); }, check: { stat: "lingli", dc: 13 }, win: "c3_seal", lose: "c3_fight2" },
    { t: "🔔 摇响铜铃", req: function (s, G) { return G.carry(s, "铜铃"); }, reqText: "没带铜铃",
      check: { stat: "lingli", dc: 13, mod: function (s) { return s.flags.c3_bell ? 3 : 0; } }, win: "c3_ring", lose: "c3_fight2" },
    { t: "🏃 放弃，先逃出去", check: { stat: "shanbi", dc: 10 }, win: "c3_flee", lose: "c3_fight2" }
  ]
};
STORY.c3_xlsave = {
  lines: [
    "小玲张开双手，挡在你面前。",
    ["小玲", "「不准伤害他！」", "xl"],
    "老先生的手停在半空。",
    "他盯着小玲看了很久，身上的黑气慢慢退了下去。",
    ["老先生", "「……罢了。有人为你拼过命，你也肯为别人拼命。」", "ghost"],
    ["老先生", "「带那个学生走吧。」", "ghost"],
    {sys: "💞 你们一起经历了生死。"}
  ],
  enter: function (s, G) { s.flags.xl_lifedeath = 1; return G.aff(s, "xl", 10); },
  go: "c3_goodend"
};
STORY.c3_fight2 = {
  deathText: ["钟楼塌下来的时候，你听见了下课钟声。", "你永远留在了那间课室里。"],
  lines: ["一股巨力把你甩到墙上。"],
  enter: function (s, G) {
    var out = G.dmg(s, 30);
    if (s.flags.xl_with && s.hp > 0) { s.flags.xl_hurt = 1; out = out.concat(G.lines(["小玲扑过来扶住你，自己的手臂也被划开一道口子。"])); }
    return out;
  },
  choices: [{ t: "🏃 抓住最后的机会逃出去", check: { stat: "shanbi", dc: 8 }, win: "c3_flee", lose: "c3_dead" }]
};
STORY.c3_dead = {
  deathText: ["钟楼的门在你面前关上。", "黑板上多了一行字：「迟到者，留堂。」"],
  lines: [], enter: function (s, G) { return G.dmg(s, 999); }, go: "c3_flee"
};
STORY.c3_flee = {
  lines: ["你跌跌撞撞地逃出了学校。", "身后，钟声响了十二下。", {bad: "❌ 委托失败。阿文没有醒来。"}],
  enter: function (s, G) { return [].concat(G.san(s, -15), G.finishCase(s, "c3", "fail")); },
  choices: [{ t: "回店里", endSlot: true }]
};

/* ===================== 终章：七月十四 ===================== */
STORY.fin_start = {
  lines: [
    {big: "🏮 七月十四 · 盂兰节"},
    "街口烧衣的火盆一个接着一个。",
    "纸灰被风卷起来，像一群黑色的蝴蝶。",
    "天黑以后，整条街安静得不像话。",
    "你拉下铁闸，让小玲留在店里。",
    ["小玲", "「……老板。」", "xl"],
    ["小玲", "「爷爷是不是早就知道，会有今天？」", "xl"]
  ],
  choices: [
    { t: "把锦囊三的内容告诉她", show: function (s) { return s.jin[2]; }, eff: function (s, G) { s.flags.xl_knows = 1; return G.aff(s, "xl", 5); }, go: "fin_truth" },
    { t: "「没事的，有我在。」", eff: function (s, G) { return G.aff(s, "xl", 2); }, go: "fin_lamps" }
  ]
};
STORY.fin_truth = {
  lines: [
    "你把信纸递给她。",
    "小玲看完，双手一直在抖。",
    ["小玲", "「原来……妈妈一直说对不起，是因为这个。」", "xl"],
    ["小玲", "「原来爷爷是因为我才……」", "xl"],
    "你按住她的肩膀。",
    ["小玲", "「……我知道了。今晚，不管听到什么，我都不会开门。」", "xl"]
  ],
  go: "fin_lamps"
};
STORY.fin_lamps = {
  lines: ["你在神台前摆开七盏油灯，按北斗的方位排好。", "爷爷的遗照在灯后看着你。"],
  choices: [
    { t: "🪔 注入灵气，点亮七星灯", req: function (s) { return s.lingqi >= 40; }, reqText: "灵气不足 40",
      eff: function (s, G) { return G.lingqi(s, -40); },
      check: { stat: "lingli", dc: 12, mod: function (s) { return Math.min(3, s.items["镇煞符"] || 0); } }, win: "fin_lampok", lose: "fin_lampweak" },
    { t: "直接用火柴点灯", go: "fin_lampweak" }
  ]
};
STORY.fin_lampok = { lines: ["七盏灯同时亮起，火苗笔直向上。", "店里一下子暖了起来。", {good: "✨ 七星灯稳稳地亮着。"}], enter: function (s) { s.flags.lamps = 1; }, go: "fin_knock1" };
STORY.fin_lampweak = { lines: ["灯是点着了，火苗却一直在摇。", "有两盏，颜色发青。"], go: "fin_knock1" };
STORY.fin_knock1 = {
  lines: [
    "十一点五十九分。",
    "铁闸外，传来「笃、笃、笃」三声。",
    ["门外", "「阿玲，开门，是妈妈。」", "evil"],
    "小玲浑身一震。"
  ],
  go: "@fin_xl"
};
STORY.fin_xlhold = {
  lines: ["小玲死死抓住你的衣袖，指节发白。", ["小玲", "「那不是我妈妈。」", "xl"], ["小玲", "「我妈妈……不会在这种时候来。」", "xl"]],
  go: "fin_knock2"
};
STORY.fin_xlgo = {
  lines: ["小玲像被什么牵着一样，站起来往门口走。", ["小玲", "「妈妈……？」", "xl"]],
  choices: [
    { t: "🤸 冲过去拉住她", check: { stat: "shanbi", dc: 11 }, win: "fin_xlstop", lose: "fin_open" },
    { t: "大声喊住她：「小玲！爷爷怎么说的！」", check: { stat: "bianlun", dc: 12, mod: function (s) { return s.aff.xl >= 21 ? 3 : 0; } }, win: "fin_xlstop", lose: "fin_open" }
  ]
};
STORY.fin_xlstop = { lines: ["小玲猛地停住，像是刚刚醒过来。", "她的手离铁闸的锁，只差一寸。"], go: "fin_knock2" };
STORY.fin_knock2 = {
  lines: [
    "敲门声停了。",
    "过了很久，门外换了一个声音。",
    ["门外", "「孩子，开门，是爷爷。」", "evil"],
    "那是爷爷的声音。",
    "一模一样。"
  ],
  choices: [
    { t: "🧘 咬破舌尖，稳住心神", check: { stat: "san", dc: 13, mod: function (s) { return s.jin[2] ? 3 : 0; } }, win: "fin_hold", lose: "@fin_youwalk" }
  ]
};
STORY.fin_xlpull = {
  lines: ["你不知不觉走到了门前，手已经放在锁上。", "一双手从背后紧紧抱住了你。", ["小玲", "「别去！爷爷已经走了！」", "xl"], "你猛地清醒过来。"],
  go: "fin_hold"
};
STORY.fin_hold = {
  lines: [
    "门外安静了。",
    "凌晨一点，七盏灯同时一暗。",
    "天花板上的影子，慢慢长出了手。",
    ["邪物", "「债，总要有人还。」", "evil"]
  ],
  enter: function (s, G) { return s.flags.lamps ? [] : G.san(s, -10); },
  go: "fin_face"
};
STORY.fin_face = {
  lines: [],
  choices: [
    { t: "「债主已经收过一次，按规矩，你不能再收。」",
      check: { stat: "bianlun", dc: 16, talk: true, mod: function (s) { return (s.flags.xl_knows ? 2 : 0) + (s.flags.xl_past ? 2 : 0); } },
      win: "fin_true", lose: "fin_hurt" },
    { t: "🔥 以灵气灌注法器，正面迎击",
      check: { stat: "lingli", dc: 16, mod: function (s, G) { var n = s.flags.finTalis != null ? s.flags.finTalis : Math.min(3, s.items["镇煞符"] || 0); return n + (s.flags.lamps ? 2 : 0) + (G.carry(s, "桃木剑") ? 0 : -2); } },
      eff: function (s, G) { var n = Math.min(3, s.items["镇煞符"] || 0); s.flags.finTalis = n; s.items["镇煞符"] -= n; return G.lingqi(s, -30); },
      win: "fin_win", lose: "fin_hurt" },
    { t: "「要命，拿我的。」", go: "fin_sacrifice" },
    { t: "把小玲推出去", go: "fin_betray" }
  ]
};
STORY.fin_hurt = {
  lines: ["影子一口咬在你的肩上。", "你感觉身体里有什么东西，正被一点一点抽走。"],
  enter: function (s, G) { return [].concat(G.dmg(s, 35), G.san(s, -15)); },
  choices: [
    { t: "🔥 再来一次！", check: { stat: "lingli", dc: 14, mod: function (s) { return s.flags.lamps ? 2 : 0; } }, win: "fin_win", lose: "fin_hurt2" },
    { t: "「要命，拿我的。」", go: "fin_sacrifice" }
  ]
};
STORY.fin_hurt2 = {
  deathText: ["影子吞没了七盏灯。", "天亮的时候，街坊发现玄清堂的铁闸开着。", "店里一个人也没有。"],
  lines: [], enter: function (s, G) { return G.dmg(s, 999); }, go: "fin_hurt"
};
STORY.fin_true = { lines: [], enter: function (s, G) { G.ending(s, "true"); } };
STORY.fin_win = { lines: [], enter: function (s, G) { G.ending(s, "win"); } };
STORY.fin_sacrifice = { lines: [], enter: function (s, G) { G.ending(s, "sacrifice"); } };
STORY.fin_betray = { lines: [], enter: function (s, G) { G.ending(s, "betray"); } };
STORY.fin_open = { lines: [], enter: function (s, G) { G.ending(s, "open"); } };

/* ===================== 小玲感情阶段事件 ===================== */
var XL_STAGE_EVENTS = {
  "留意关注": ["小玲开始会在你画符的时候，偷偷凑过来看。", ["小玲", "「这个……是怎么画出来的？可以教我吗？」", "xl"]],
  "在意关心": ["你晚上出门前，小玲往你的口袋里塞了一包暖包。", ["小玲", "「早点回来。我……等你关门。」", "xl"]],
  "好友羁绊": ["那天收铺以后，小玲第一次讲起她的家。", ["小玲", "「我妈妈在我很小的时候就走了。」", "xl"], ["小玲", "「她走之前，一直跟我说对不起。」", "xl"], ["小玲", "「我到现在都不知道，她为什么要道歉。」", "xl"]],
  "重要之人": [["小玲", "「不管以后发生什么，我都不会走的。」", "xl"], "她说这句话的时候，看着的是爷爷的遗照。"]
};

/* ===================== 小玲闲聊 ===================== */
var XL_CHATS = {
  "陌生人": [
    [["小玲", "「冻柠茶要走甜吗？我下次记住。」", "xl"]],
    [["小玲", "「这些符……我可以帮忙擦擦灰吗？我保证不乱碰。」", "xl"]],
    [["小玲", "「爷爷以前说，你画符比他年轻时还好。」", "xl"], "她说完就低下头，假装很忙。"]
  ],
  "留意关注": [
    [["小玲", "「你今天是不是没吃早餐？楼下还有菠萝油。」", "xl"]],
    [["小玲", "「我昨晚查了很多资料，原来罗盘是这样看的！」", "xl"], "她拿着罗盘比划了半天，方向全是反的。"],
    [["小玲", "「你笑什么？不准笑！」", "xl"]]
  ],
  "在意关心": [
    [["小玲", "「你昨晚几点睡的？黑眼圈好重。」", "xl"]],
    [["小玲", "「下次接委托之前，先跟我说一声，好不好？」", "xl"]],
    [["小玲", "「我学会画最简单的那种符了……虽然没什么用。」", "xl"], "她把一张歪歪扭扭的符塞进你的钱包。"]
  ],
  "好友羁绊": [
    [["小玲", "「有时候我觉得，这间店就是我的家。」", "xl"]],
    [["小玲", "「你知道吗，爷爷面试我的时候，只问了一个问题。」", "xl"], ["小玲", "「他问我：怕不怕黑。」", "xl"]],
    [["小玲", "「你累的话，就靠一下。」", "xl"], "她拍了拍自己的肩膀。"]
  ],
  "重要之人": [
    [["小玲", "「等这一切结束了，我们去长洲吃鱼蛋，好不好？」", "xl"]],
    [["小玲", "「你是这个世界上，我最相信的人。」", "xl"]]
  ]
};

var FLAVOR = [
  ["☀️ 楼下茶餐厅飘来菠萝包的香味。", "🌤️ 街市的叫卖声一阵一阵传上来。", "☀️ 小玲在门口扫地，扫帚刷刷地响。", "🌦️ 一阵过云雨，街上的人纷纷躲进骑楼。"],
  ["🌆 阳光斜斜地照进店里，香炉的烟慢慢往上飘。", "🌇 对面的凉茶铺开始收摊。", "🌆 小玲趴在柜台上打了个呵欠。", "🌇 巷口的叮叮车响了两声。"],
  ["🌙 霓虹灯一盏一盏亮了起来。", "🌃 楼上的麻将声一直没停。", "🌙 远处传来渡海小轮的汽笛。", "🌃 巷子里的野猫突然一起抬起头，盯着同一个方向。"]
];
var FLAVOR_JULY = ["🔥 七月了，街角多了好几个烧衣的火盆。", "🏮 街坊会在球场搭起了盂兰胜会的竹棚。", "🔥 路边摆着一碗碗白饭和香烛，没有人会去踩。"];
