/**
 * Machinarium-Style Tactile Mechanical Contraptions & Doodle Thought Bubbles.
 * Provides 12 bespoke interactive close-up contraption workbenches (one per chapter)
 * and pictographic ink-sketch thought bubbles above Hilda.
 */
Homeward.define("engine/contraptions", ["engine/hydraulics", "content/mechanisms", "content/setpieces", "content/items"], (Hydraulics, Mechanisms, Stage, Items) => {
  const CONTRAPTION_SPECS = Object.freeze([
    {
      scene: 0,
      id: "home-origami-lantern",
      code: "MK-00 · WINDOW & HEARTH",
      title: "窗栓折纸与黄铜提灯芯",
      subtitle: "拨开窗边铜栓展开千纸鹤折痕，向妈妈收下红围巾，并旋亮门边的黄铜提灯",
      hotspotIds: ["bird", "mom", "lamp"],
      steps(s) {
        return [
          { id: "letter", label: "拨开铜窗栓 · 展开纸鸟折痕", done: !!s.f.letter },
          { id: "promise", label: "收下妈妈缝好的羊毛围巾", done: !!s.f.promise },
          { id: "lamp", label: "摘下并旋亮门边黄铜提灯", done: !!s.f.lampTaken }
        ];
      }
    },
    {
      scene: 1,
      id: "gate-ratchet-hoist",
      code: "MK-01 · NORTH PORTCULLIS",
      title: "雨水配重棚与三棘爪蓄力绞盘",
      subtitle: "下拉排水滑轮泄去棚布积水取出方榫曲柄，嵌入城门转轮连续蓄力三格锁定棘爪",
      hotspotIds: ["awning", "crank", "wheel"],
      steps(s) {
        return [
          { id: "awning", label: "下拉排水绳 · 倾泻雨棚积水", done: !!s.f.awning },
          { id: "crank", label: "拾取摊位上的方榫黄铜曲柄", done: !!s.f.crankTaken || !!s.f.crankMounted || !!s.f.gateOpen },
          { id: "mount", label: "将方榫曲柄嵌入城门转轮轴孔", done: !!s.f.crankMounted || !!s.f.gateOpen },
          { id: "turns", label: `摇动棘轮蓄力升门 (${s.f.gateOpen ? 3 : (s.f.gateTurns || 0)} / 3 格)`, done: !!s.f.gateOpen }
        ];
      }
    },
    {
      scene: 2,
      id: "forest-grapple-winch",
      code: "MK-02 · CANYON SUSPENSION",
      title: "弹力藤枝、双八字绳结与双人绞盘",
      subtitle: "用麻绳拉低弹力树枝取下锻铁钩，打结组装飞钩抛挂对岸铁环，再与大卫协同收紧断桥绞盘",
      hotspotIds: ["rope", "hook", "anchor", "david", "winch"],
      steps(s) {
        const hasRope = !!s.f.ropeTaken;
        const hasHook = !!s.f.hookTaken;
        const hasGrapple = s.inventory?.includes("grapple") || !!s.f.grappleSet || !!s.f.bridge;
        return [
          { id: "rope", label: "拾取岸边编织麻绳圈", done: hasRope },
          { id: "hook", label: "套住高处野藤拉低树枝 · 取下锻铁钩", done: hasHook },
          { id: "knot", label: "穿孔打结 · 组装带钩绳索", done: hasGrapple },
          { id: "anchor", label: "抛物线投出飞钩 · 扣牢对岸铁环", done: !!s.f.grappleSet || !!s.f.bridge },
          { id: "winch", label: "大卫锁定制动棘爪 · 希尔达摇轮升桥", done: !!s.f.bridge }
        ];
      }
    },
    {
      scene: 3,
      id: "archive-vernier-rail",
      code: "MK-03 · ROOT ARCHIVE RAIL",
      title: "精灵游标卡尺轨道与偏心凸轮刹",
      subtitle: "松开偏心黄铜刹杆，沿轨道将滑轮梯对准『水滴』刻线 (1170)，锁死凸轮刹后登梯取卷",
      hotspotIds: ["ladder", "ladderBrake", "book"],
      steps(s) {
        const aligned = Stage.aligned(s) || !!s.f.planTaken;
        return [
          { id: "slide", label: `推移轨道滑轮梯对准水滴刻线 (${Stage.ladderX(s)} / 1170)`, done: aligned },
          { id: "brake", label: "踩下梯脚黄铜偏心凸轮锁杆", done: (aligned && !!s.f.ladderBrake) || !!s.f.planTaken },
          { id: "book", label: "攀登稳固木梯 · 取出水钟蓝图卷宗", done: !!s.f.planTaken }
        ];
      }
    },
    {
      scene: 4,
      id: "waterworks-manifold",
      code: "MK-04 · HYDRAULIC MANIFOLD",
      title: "全连通水力管网与稳压泄流台",
      subtitle: "先关进水闸泄压清网取出长柄挑杆，旋转三处弯管消除漏点 ([2,0,3])，再开闸缓慢拉下试压柄",
      hotspotIds: ["intake", "filter", "pipe0", "pipe1", "pipe2", "prime"],
      steps(s) {
        const trace = Hydraulics.trace(s.valves || [0, 1, 0], !s.f.intakeClosed);
        const shapeOk = Hydraulics.trace(s.valves || [0, 1, 0], true).connected;
        return [
          { id: "isolate", label: "关闭进水手轮泄压 · 清理滤网并取出长挑杆", done: !!s.f.filter },
          { id: "manifold", label: "拨动三轴水力弯管使管路全连通", done: shapeOk || !!s.f.pump },
          { id: "flow", label: "重开进水手轮 · 验证水流直达出口无漏点", done: (!!s.f.filter && trace.connected) || !!s.f.pump },
          { id: "prime", label: "拉下液压试压柄 · 建立工作水压并锁紧活节", done: !!s.f.pump }
        ];
      }
    },
    {
      scene: 5,
      id: "gondola-steelyard",
      code: "MK-05 · MIST STEELYARD",
      title: "雾谷游码天平与力矩棘爪",
      subtitle: "收好站台应急绳，在吊盘上配置 1 格与 3 格砝码配平左端 4 格力矩，释放安全棘爪停靠吊舱",
      hotspotIds: ["line", "weight1", "weight2", "weight3", "brake"],
      steps(s) {
        const sum = (s.weights || []).reduce((a, b) => a + b, 0);
        return [
          { id: "line", label: "收好站台边缘的编织救援绳", done: !!s.f.lineTaken },
          { id: "balance", label: `调平吊盘力矩横梁 (当前 ${sum} / 4 格)`, done: sum === 4 || !!s.f.lift },
          { id: "brake", label: "旋开安全棘爪制动轮 · 停靠雾谷吊舱", done: !!s.f.lift }
        ];
      }
    },
    {
      scene: 6,
      id: "shelter-lithophone",
      code: "MK-06 · ACOUSTIC LITHOPHONE",
      title: "羊毛柔光灯罩与四音共鸣石琴",
      subtitle: "将围巾与提灯组合成柔光灯安放石座，破译岩画四音序列（溪流·松针·溪流·月亮）敲响回声石",
      hotspotIds: ["holder", "song", "tone0", "tone1", "tone2"],
      steps(s) {
        const hasShade = s.inventory?.includes("shade") || !!s.f.shadePlaced || !!s.f.calm;
        return [
          { id: "craftShade", label: "将红围巾包覆提灯制成柔光灯罩", done: hasShade },
          { id: "placeShade", label: "将柔光提灯安放于石座安抚小巨魔", done: !!s.f.shadePlaced || !!s.f.calm },
          { id: "melody", label: "按岩画共鸣顺序敲击石琴 (溪流→松针→溪流→月亮)", done: !!s.f.calm }
        ];
      }
    },
    {
      scene: 7,
      id: "tower-gear-train",
      code: "MK-07 · EPICYCLIC DOOR LOCK",
      title: "三轴反比啮合齿轮组与金线校时",
      subtitle: "将小(8齿)、中(12齿)、大(16齿)黄铜齿轮装入对应轴承，转动中轮使轮缘金线对准上方缺口并拉门柄",
      hotspotIds: ["gearS", "gearM", "gearL", "socketS", "socketM", "socketL", "lever"],
      steps(s) {
        const allSet = !!(s.f.gearSSet && s.f.gearMSet && s.f.gearLSet) || !!s.f.towerGate;
        return [
          { id: "gears", label: "拾取并安装小、中、大三枚黄铜齿轮", done: allSet },
          { id: "align", label: "联动旋转中轮 · 使金色刻线对准顶端缺口", done: !!s.f.gearAligned || !!s.f.towerGate },
          { id: "lever", label: "拉下钟楼重锤门柄 · 开启齿轮门锁", done: !!s.f.towerGate }
        ];
      }
    },
    {
      scene: 8,
      id: "clock-heart-interlock",
      code: "MK-08 · FLOOD HEART INTERLOCK",
      title: "水钟机械心脏：四联锁排洪中枢",
      subtitle: "遵循『先旁通·后止鸣·双人稳压·音叉共鸣』工程顺序，唤醒山腹排洪飞轮",
      hotspotIds: ["bypass", "felt", "clapper", "frida", "david", "drive"],
      steps(s) {
        return [
          { id: "bypass", label: `装上曲柄旋开泄压旁路阀 (${s.f.bypass ? 2 : (s.f.bypassTurns || 0)} / 2 圈)`, done: !!s.f.bypass },
          { id: "clapper", label: "拾取羊毛毡 · 登台包覆钟舌缓冲撞击", done: !!s.f.damped },
          { id: "crew", label: "请芙丽达与大卫分别锁紧旁路杆与制动杆", done: !!(s.f.fridaHold && s.f.davidHold) || !!s.f.heart },
          { id: "drive", label: "将合金音叉嵌入飞轮共鸣锁 · 启动排洪", done: !!s.f.heart }
        ];
      }
    },
    {
      scene: 9,
      id: "roof-beacon-rescue",
      code: "MK-09 · STORM ROOF & BEACON",
      title: "暴风屋顶支点杠杆与齿轮光学信标",
      subtitle: "锚定救援绳拉回大卫，由大卫稳住支点配合长挑杆撬起横梁救出芙丽达，再调准光学信标角 (-151°)",
      hotspotIds: ["anchor", "david", "frida", "beacon", "twig", "board"],
      steps(s) {
        return [
          { id: "david", label: "系牢铁环救援绳 · 拉回受困的大卫", done: !!s.f.davidSafe },
          { id: "frida", label: "大卫稳住支点 · 用长挑杆撬梁救出芙丽达", done: !!s.f.fridaSafe },
          { id: "beacon", label: "旋转低处齿轮盘 · 将高处光束对准山脊星标", done: !!s.f.beacon },
          { id: "twig", label: "接住跃过瓦片的枝枝 · 全员登上沃夫", done: !!s.f.twigSafe }
        ];
      }
    },
    {
      scene: 10,
      id: "ridge-wind-lamps",
      code: "MK-10 · WIND-SHIELDED BEACONS",
      title: "山脊迎风旋转风罩与巨人之桥",
      subtitle: "依次将三盏山脊路灯的防风罩旋至背风侧 (-70°)，用提灯引燃灯芯，护送小巨魔回到妈妈身边",
      hotspotIds: ["trail0", "trail1", "trail2", "child", "hand"],
      steps(s) {
        const hoods = [0, 1, 2].filter(i => s.f["hood" + i]).length;
        const lit = [0, 1, 2].filter(i => s.f["trail" + i]).length;
        return [
          { id: "hoods", label: `拨转三盏路灯的金属防风罩 (${hoods} / 3)`, done: hoods === 3 },
          { id: "lamps", label: `用随身提灯引燃背风灯芯 (${lit} / 3)`, done: lit === 3 },
          { id: "reunite", label: "陪小巨魔穿过晨雾 · 唤出巨魔妈妈的手掌桥", done: !!s.f.reunited }
        ];
      }
    },
    {
      scene: 11,
      id: "home-tea-journal",
      code: "MK-11 · WARM CINNAMON TEA",
      title: "晨光倾茶与归途手记封缄",
      subtitle: "给守候一夜的妈妈一个拥抱，端起肉桂苹果茶壶为三位伙伴斟满热茶，合上平安手记",
      hotspotIds: ["mom", "tea0", "tea1", "tea2", "journal"],
      steps(s) {
        const cups = [0, 1, 2].filter(i => s.f["tea" + i]).length;
        return [
          { id: "hug", label: "给等了一夜的妈妈一个温暖拥抱", done: !!s.f.hug },
          { id: "tea", label: `倾倒茶壶 · 为三只茶杯斟满热茶 (${cups} / 3)`, done: cups === 3 },
          { id: "journal", label: "在手记最后一页写下全员平安", done: !!s.f.ended }
        ];
      }
    }
  ]);

  function specFor(sceneIndex = 0) {
    const idx = Math.max(0, Math.min(CONTRAPTION_SPECS.length - 1, Math.trunc(Number(sceneIndex) || 0)));
    return CONTRAPTION_SPECS[idx];
  }

  /**
   * Returns a Machinarium-style hand-drawn ink sketch SVG for Hilda's Thought Bubble.
   * Uses pure visual pictograms & mechanical arrows so it feels like an authentic sketchbook cloud.
   */
  function doodleMarkup(sceneIndex = 0, state = {}) {
    const f = state?.f || {};
    const spec = specFor(sceneIndex);
    let sketch = "";

    if (sceneIndex === 0) {
      sketch = `
        <path d="M28 52 L54 34 L76 48 L52 64 Z M54 34 L68 20 L84 36" fill="none" stroke="#263c48" stroke-width="2.2"/>
        <path d="M92 46 H118 M110 38 L120 46 L110 54" fill="none" stroke="#b75848" stroke-width="2.2"/>
        <path d="M134 32 Q154 28 164 42 Q150 56 132 52 Z" fill="#d97964" stroke="#263c48" stroke-width="2"/>
        <rect x="184" y="30" width="24" height="32" rx="4" fill="#efd28d" stroke="#263c48" stroke-width="2"/>
        <circle cx="196" cy="46" r="5" fill="#fff6cc"/>
      `;
    } else if (sceneIndex === 1) {
      sketch = `
        <path d="M26 30 H76 L68 54 H34 Z" fill="#7c9a92" stroke="#263c48" stroke-width="2"/>
        <path d="M52 54 V76 M44 68 L52 78 L60 68" fill="none" stroke="#b75848" stroke-width="2.2"/>
        <path d="M92 52 H118 L118 36" fill="none" stroke="#c89e56" stroke-width="4"/>
        <circle cx="168" cy="48" r="22" fill="none" stroke="#263c48" stroke-width="2.5" stroke-dasharray="6 3"/>
        <path d="M158 32 A20 20 0 1 1 148 54" fill="none" stroke="#b75848" stroke-width="2.2"/>
        <rect x="202" y="26" width="12" height="44" rx="2" fill="${f.gateOpen ? "#78b894" : "#d9b978"}" stroke="#263c48" stroke-width="1.8"/>
      `;
    } else if (sceneIndex === 2) {
      sketch = `
        <ellipse cx="42" cy="48" rx="16" ry="12" fill="none" stroke="#a68958" stroke-width="3"/>
        <text x="68" y="54" fill="#263c48" font-size="18">+</text>
        <path d="M88 36 Q106 32 104 52 Q102 64 90 60" fill="none" stroke="#263c48" stroke-width="3"/>
        <path d="M122 58 Q156 18 192 48" fill="none" stroke="#b75848" stroke-width="2.2" stroke-dasharray="4 3"/>
        <circle cx="196" cy="50" r="8" fill="none" stroke="#263c48" stroke-width="2.5"/>
      `;
    } else if (sceneIndex === 3) {
      sketch = `
        <path d="M24 70 H198" stroke="#263c48" stroke-width="2.5"/>
        <path d="M48 70 L58 24 M74 70 L64 24 M51 54 H71 M54 38 H68" fill="none" stroke="#8c6d46" stroke-width="2.2"/>
        <path d="M82 46 H134 M124 38 L136 46 L124 54" fill="none" stroke="#b75848" stroke-width="2.2"/>
        <path d="M162 26 Q174 42 162 52 Q150 42 162 26 Z" fill="#63b5c5" stroke="#263c48" stroke-width="1.8"/>
        <circle cx="162" cy="70" r="7" fill="#d9b468" stroke="#263c48" stroke-width="2"/>
      `;
    } else if (sceneIndex === 4) {
      sketch = `
        <circle cx="38" cy="48" r="14" fill="none" stroke="#263c48" stroke-width="2.4"/>
        <path d="M30 48 H46 M38 40 V56" stroke="#b75848" stroke-width="2"/>
        <path d="M68 34 V52 H92 M92 52 V66 H124 V38 H152" fill="none" stroke="#45949c" stroke-width="4"/>
        <circle cx="186" cy="48" r="16" fill="#f3e2b8" stroke="#263c48" stroke-width="2"/>
        <path d="M186 48 L196 38" stroke="#b75848" stroke-width="2.4"/>
      `;
    } else if (sceneIndex === 5) {
      sketch = `
        <path d="M36 46 H184 M110 26 V68" stroke="#263c48" stroke-width="2.5"/>
        <rect x="44" y="46" width="26" height="22" rx="3" fill="#6e8680" stroke="#263c48" stroke-width="2"/>
        <text x="57" y="62" fill="#f5e6c4" font-size="13" text-anchor="middle">4</text>
        <rect x="142" y="46" width="18" height="16" rx="2" fill="#b89862" stroke="#263c48" stroke-width="1.8"/>
        <text x="151" y="58" fill="#263c48" font-size="11" text-anchor="middle">1</text>
        <rect x="164" y="46" width="22" height="22" rx="2" fill="#b89862" stroke="#263c48" stroke-width="1.8"/>
        <text x="175" y="61" fill="#263c48" font-size="12" text-anchor="middle">3</text>
      `;
    } else if (sceneIndex === 6) {
      sketch = `
        <rect x="28" y="34" width="22" height="28" rx="4" fill="#f0c878" stroke="#263c48" stroke-width="2"/>
        <path d="M24 38 Q39 28 54 38 L50 58 Q39 64 28 58 Z" fill="#c64f4588" stroke="#263c48" stroke-width="1.6"/>
        <path d="M82 62 Q94 48 106 62 M118 64 L126 36 L134 64 M148 62 Q160 48 172 62 M186 44 A10 10 0 1 1 186 60" fill="none" stroke="#263c48" stroke-width="2.2"/>
      `;
    } else if (sceneIndex === 7) {
      sketch = `
        <circle cx="52" cy="58" r="14" fill="#b8965c" stroke="#263c48" stroke-width="2"/>
        <circle cx="96" cy="48" r="20" fill="#d4b272" stroke="#263c48" stroke-width="2.2"/>
        <path d="M96 48 V26" stroke="#b75848" stroke-width="3"/>
        <path d="M91 18 L96 25 L101 18" fill="none" stroke="#b75848" stroke-width="2"/>
        <circle cx="152" cy="40" r="26" fill="#9c8256" stroke="#263c48" stroke-width="2"/>
      `;
    } else if (sceneIndex === 8) {
      sketch = `
        <circle cx="40" cy="48" r="14" fill="none" stroke="#263c48" stroke-width="2.2"/>
        <path d="M62 48 H78" stroke="#b75848" stroke-width="2"/>
        <path d="M92 32 Q104 32 106 54 H78 Q80 32 92 32 Z" fill="#c8a86b" stroke="#263c48" stroke-width="2"/>
        <path d="M116 48 H132" stroke="#b75848" stroke-width="2"/>
        <path d="M148 28 V64 M162 28 V64" stroke="#263c48" stroke-width="2.5"/>
        <path d="M184 32 V52 M178 32 V44 H190 V32" fill="none" stroke="#45949c" stroke-width="2.4"/>
      `;
    } else if (sceneIndex === 9) {
      sketch = `
        <circle cx="38" cy="48" r="10" fill="none" stroke="#263c48" stroke-width="2.5"/>
        <path d="M48 48 Q72 34 94 52" fill="none" stroke="#c8ad78" stroke-width="2.5"/>
        <path d="M108 60 L152 38 M126 60 L132 50 L138 60 Z" fill="none" stroke="#263c48" stroke-width="2.4"/>
        <circle cx="188" cy="52" r="14" fill="#efd898" stroke="#263c48" stroke-width="2"/>
        <path d="M188 52 L162 26" stroke="#b75848" stroke-width="2.4" stroke-dasharray="3 2"/>
      `;
    } else if (sceneIndex === 10) {
      sketch = `
        <path d="M36 32 H62 L72 52 H26 Z" fill="#8b9c7c" stroke="#263c48" stroke-width="2"/>
        <circle cx="49" cy="56" r="8" fill="#ffe294"/>
        <path d="M90 50 H126 M116 42 L128 50 L116 58" fill="none" stroke="#b75848" stroke-width="2.2"/>
        <path d="M144 62 Q174 44 206 58" fill="none" stroke="#5d786e" stroke-width="8"/>
      `;
    } else {
      sketch = `
        <path d="M42 36 Q42 22 60 22 Q78 22 78 36 L74 58 H46 Z" fill="#739b97" stroke="#263c48" stroke-width="2"/>
        <path d="M78 34 L96 28 L88 46" fill="none" stroke="#263c48" stroke-width="2.2"/>
        <path d="M96 30 Q114 42 114 58" fill="none" stroke="#d9a65c" stroke-width="2" stroke-dasharray="3 2"/>
        <rect x="104" y="56" width="20" height="14" rx="3" fill="#f3dfb7" stroke="#263c48" stroke-width="1.8"/>
        <rect x="148" y="30" width="38" height="44" rx="4" fill="#d9c496" stroke="#263c48" stroke-width="2"/>
        <circle cx="167" cy="52" r="7" fill="#b75848"/>
      `;
    }

    return `<svg viewBox="0 0 232 108" class="doodle-svg" aria-hidden="true">
      <circle cx="34" cy="98" r="5" fill="#f6ead0" stroke="#263c48" stroke-width="2"/>
      <circle cx="48" cy="87" r="8" fill="#f6ead0" stroke="#263c48" stroke-width="2"/>
      <path d="M24 14 Q14 14 14 26 V68 Q14 80 28 80 H204 Q218 80 218 68 V26 Q218 14 204 14 Z" fill="#f6ead0" stroke="#263c48" stroke-width="2.6"/>
      <g>${sketch}</g>
    </svg>`;
  }

  /**
   * Executes a single logical step of the scene's contraption against the runtime game controller.
   */
  function executeContraptionStep(game, sceneIndex, stepId) {
    if (!game || !game.s) return false;
    const s = game.s;
    const Story = Homeward.use("story");
    const scene = Story.scenes[sceneIndex];
    if (!scene) return false;

    if (sceneIndex === 0) {
      if (stepId === "letter" && !s.f.letter) { scene.act(game, "bird", null); return true; }
      if (stepId === "promise" && s.f.letter && !s.f.promise) { scene.act(game, "mom", null); return true; }
      if (stepId === "lamp" && !s.f.lampTaken) { scene.act(game, "lamp", null); return true; }
    } else if (sceneIndex === 1) {
      if (stepId === "awning" && !s.f.awning) { scene.act(game, "awning", null); return true; }
      if (stepId === "crank" && s.f.awning && !s.f.crankTaken) { scene.act(game, "crank", null); return true; }
      if (stepId === "mount" && s.f.crankTaken && !s.f.crankMounted) { scene.act(game, "wheel", "crank"); return true; }
      if (stepId === "turns" && s.f.crankMounted && !s.f.gateOpen) { scene.act(game, "wheel", null); return true; }
    } else if (sceneIndex === 2) {
      if (stepId === "rope" && !s.f.ropeTaken) { scene.act(game, "rope", null); return true; }
      if (stepId === "hook" && s.f.ropeTaken && !s.f.hookTaken) {
        scene.act(game, "hook", s.f.branchBent ? null : "rope");
        return true;
      }
      if (stepId === "knot" && s.inventory.includes("rope") && s.inventory.includes("hook")) {
        s.inventory = s.inventory.filter(k => k !== "rope" && k !== "hook");
        game.take("grapple", false);
        game.sound("wood");
        game.toast("双八字绳结绑紧了 · 获得带钩绳索。");
        return true;
      }
      if (stepId === "anchor" && s.inventory.includes("grapple") && !s.f.grappleSet) {
        scene.act(game, "anchor", "grapple");
        return true;
      }
      if (stepId === "winch" && s.f.grappleSet && !s.f.bridge) {
        if (!s.f.bridgeBrace) scene.act(game, "david", null);
        else scene.act(game, "winch", null);
        return true;
      }
    } else if (sceneIndex === 3) {
      if (stepId === "slide" && !Stage.aligned(s)) {
        if (s.f.ladderBrake) scene.act(game, "ladderBrake", null);
        else scene.drag(game, "ladder", { x: 1170 });
        return true;
      }
      if (stepId === "brake" && Stage.aligned(s) && !s.f.ladderBrake) {
        scene.act(game, "ladderBrake", null);
        return true;
      }
      if (stepId === "book" && Stage.aligned(s) && s.f.ladderBrake && !s.f.planTaken) {
        scene.act(game, "book", null);
        return true;
      }
    } else if (sceneIndex === 4) {
      if (stepId === "isolate" && !s.f.filter) {
        if (!s.f.intakeClosed) scene.act(game, "intake", null);
        else scene.act(game, "filter", null);
        return true;
      }
      if (stepId === "manifold" && s.f.filter && !s.f.pump) {
        const target = [2, 0, 3];
        for (let i = 0; i < 3; i++) {
          if (s.valves[i] !== target[i]) {
            scene.act(game, "pipe" + i, i === 0 ? "pole" : null);
            return true;
          }
        }
      }
      if (stepId === "flow" && s.f.intakeClosed && s.f.filter) {
        scene.act(game, "intake", null);
        return true;
      }
      if (stepId === "prime" && !s.f.intakeClosed && Hydraulics.trace(s.valves, true).connected && !s.f.pump) {
        scene.act(game, "prime", null);
        return true;
      }
    } else if (sceneIndex === 5) {
      if (stepId === "line" && !s.f.lineTaken) { scene.act(game, "line", null); return true; }
      if (stepId === "balance" && !s.f.lift) {
        if (s.weights.includes(2)) { scene.act(game, "weight2", null); return true; }
        if (!s.weights.includes(1)) { scene.act(game, "weight1", null); return true; }
        if (!s.weights.includes(3)) { scene.act(game, "weight3", null); return true; }
      }
      if (stepId === "brake" && !s.f.lift && s.weights.reduce((a, b) => a + b, 0) === 4) {
        scene.act(game, "brake", null);
        return true;
      }
    } else if (sceneIndex === 6) {
      if (stepId === "craftShade" && s.inventory.includes("lamp") && s.inventory.includes("scarf")) {
        s.inventory = s.inventory.filter(k => k !== "lamp" && k !== "scarf");
        game.take("shade", false);
        game.sound("wood");
        game.toast("把围巾叠在提灯一侧做成遮光屏风，光线柔和了。");
        return true;
      }
      if (stepId === "placeShade" && s.inventory.includes("shade") && !s.f.shadePlaced) {
        scene.act(game, "holder", "shade");
        return true;
      }
      if (stepId === "melody" && s.f.shadePlaced && !s.f.calm) {
        const seq = [0, 1, 0, 2];
        const nextTone = seq[s.melody.length] ?? 0;
        scene.act(game, "tone" + nextTone, null);
        return true;
      }
    } else if (sceneIndex === 7) {
      if (stepId === "gears") {
        for (const k of ["gearS", "gearM", "gearL"]) {
          if (!s.f[k + "Taken"]) { scene.act(game, k, null); return true; }
        }
        for (const [k, sock] of [["gearS", "socketS"], ["gearM", "socketM"], ["gearL", "socketL"]]) {
          if (!s.f[k + "Set"]) { scene.act(game, sock, k); return true; }
        }
      }
      if (stepId === "align" && s.f.gearSSet && s.f.gearMSet && s.f.gearLSet && !s.f.gearAligned) {
        scene.act(game, "socketM", null);
        return true;
      }
      if (stepId === "lever" && s.f.gearAligned && !s.f.towerGate) {
        scene.act(game, "lever", null);
        return true;
      }
    } else if (sceneIndex === 8) {
      if (stepId === "bypass" && !s.f.bypass) {
        scene.act(game, "bypass", s.f.bypassMounted ? null : "crank");
        return true;
      }
      if (stepId === "clapper" && s.f.bypass && !s.f.damped) {
        if (!s.f.feltTaken) scene.act(game, "felt", null);
        else scene.act(game, "clapper", "felt");
        return true;
      }
      if (stepId === "crew" && s.f.bypass && s.f.damped) {
        if (!s.f.fridaHold) { scene.act(game, "frida", null); return true; }
        if (!s.f.davidHold) { scene.act(game, "david", null); return true; }
      }
      if (stepId === "drive" && s.f.fridaHold && s.f.davidHold && !s.f.heart) {
        scene.act(game, "drive", "fork");
        return true;
      }
    } else if (sceneIndex === 9) {
      if (stepId === "david" && !s.f.davidSafe) {
        if (!s.f.roofAnchor) scene.act(game, "anchor", "line");
        else scene.act(game, "david", null);
        return true;
      }
      if (stepId === "frida" && s.f.davidSafe && !s.f.fridaSafe) {
        if (!s.f.roofBrace) scene.act(game, "david", null);
        else scene.act(game, "frida", "pole");
        return true;
      }
      if (stepId === "beacon" && s.f.fridaSafe && !s.f.beacon) {
        scene.drag(game, "beacon", { x: 1096, y: 501 });
        return true;
      }
      if (stepId === "twig" && s.f.davidSafe && !s.f.twigSafe) {
        scene.act(game, "twig", null);
        return true;
      }
    } else if (sceneIndex === 10) {
      if (stepId === "hoods") {
        for (let i = 0; i < 3; i++) {
          if (!s.f["hood" + i]) { scene.act(game, "trail" + i, null); return true; }
        }
      }
      if (stepId === "lamps") {
        const lantern = s.inventory.includes("shade") ? "shade" : "lamp";
        for (let i = 0; i < 3; i++) {
          if (!s.f["trail" + i]) { scene.act(game, "trail" + i, lantern); return true; }
        }
      }
      if (stepId === "reunite" && [0, 1, 2].every(i => s.f["trail" + i]) && !s.f.reunited) {
        scene.act(game, "child", null);
        return true;
      }
    } else if (sceneIndex === 11) {
      if (stepId === "hug" && !s.f.hug) { scene.act(game, "mom", null); return true; }
      if (stepId === "tea") {
        for (let i = 0; i < 3; i++) {
          if (!s.f["tea" + i]) { scene.act(game, "tea" + i, null); return true; }
        }
      }
      if (stepId === "journal" && s.f.ended) { scene.act(game, "journal", null); return true; }
    }
    return false;
  }

  /**
   * Renders an interactive HiDPI Canvas schematic inside the Machinarium Contraption Workbench.
   */
  function drawWorkbenchSchematic(canvas, sceneIndex, state, animPhase = 0) {
    if (!canvas || !canvas.getContext) return [];
    const ctx = canvas.getContext("2d");
    const dpr = 2;
    const W = 720;
    const H = 320;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Blueprint parchment & brass background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#18333b");
    bg.addColorStop(0.5, "#1f4149");
    bg.addColorStop(1, "#142a31");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Drafting grid
    ctx.strokeStyle = "rgba(232, 214, 172, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 24; x < W; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 24; y < H; y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Corner brass rivets
    for (const [rx, ry] of [[16, 16], [W - 16, 16], [16, H - 16], [W - 16, H - 16]]) {
      ctx.fillStyle = "#c8a86b";
      ctx.beginPath(); ctx.arc(rx, ry, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#263c48"; ctx.lineWidth = 1.5; ctx.stroke();
    }

    const f = state?.f || {};
    const hitZones = [];

    // Draw interactive nodes corresponding to the current scene's contraption steps
    const spec = specFor(sceneIndex);
    const steps = spec.steps(state);
    const count = steps.length;
    const spacing = (W - 140) / Math.max(1, count);

    // Connecting mechanical linkage pipe/shaft
    ctx.strokeStyle = "rgba(218, 190, 130, 0.35)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(90, H * 0.48);
    ctx.lineTo(W - 90, H * 0.48);
    ctx.stroke();

    steps.forEach((st, idx) => {
      const cx = 70 + spacing * (idx + 0.5);
      const cy = H * 0.46 + (idx % 2 === 0 ? -14 : 14);
      const r = 42;
      const active = !st.done && (idx === 0 || steps[idx - 1].done);

      // Outer gear teeth
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(st.done ? 0.4 : active ? animPhase * 0.8 : 0);
      ctx.fillStyle = st.done ? "#5ca882" : active ? "#e2be78" : "#44656b";
      ctx.strokeStyle = "#162d34";
      ctx.lineWidth = 2.2;
      for (let t = 0; t < 10; t++) {
        const a = (t * Math.PI * 2) / 10;
        ctx.save();
        ctx.rotate(a);
        ctx.fillRect(-5, -r - 6, 10, 10);
        ctx.strokeRect(-5, -r - 6, 10, 10);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner dial hub
      ctx.fillStyle = st.done ? "#234a3c" : "#1c373f";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = st.done ? "#9ef0c0" : active ? "#ffe5a4" : "#789698";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Step Roman numeral / checkmark
      ctx.rotate(st.done ? -0.4 : active ? -animPhase * 0.8 : 0);
      ctx.fillStyle = st.done ? "#b6f7d2" : active ? "#fff2c6" : "#9cb2b0";
      ctx.font = "700 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(st.done ? "✓" : `0${idx + 1}`, 0, 0);
      ctx.restore();

      // Label plaque below node
      ctx.fillStyle = st.done ? "#a8e6c3" : active ? "#ffe3a0" : "#b0c2be";
      ctx.font = "600 12.5px 'Noto Sans CJK SC', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(st.label.slice(0, 18), cx, cy + r + 26);

      hitZones.push({ id: st.id, x: cx - r - 10, y: cy - r - 10, w: (r + 10) * 2, h: (r + 10) * 2, done: st.done });
    });

    ctx.restore();
    return hitZones;
  }

  return {
    CONTRAPTION_SPECS,
    specFor,
    doodleMarkup,
    executeContraptionStep,
    drawWorkbenchSchematic
  };
});
