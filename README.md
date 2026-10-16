# V3.9 连贯的归途 · scene continuity

十二幕沿用原来的剧情和谜题顺序，补齐升降站配重、钟楼门、旁路阀、山脊路灯和团聚过程的连续表现。配重的可点击位置与吊盘中的实物一致；屋顶救援完成后，大卫放下支撑动作并退开；团聚时希尔达沿连续地面陪行，小巨魔与妈妈的姿态不会在完成瞬间跳变。

场景观察物改成各地点对应的插画，调整人物遮挡、窗光、门洞裁剪和背侧手臂层级，标题页隐藏游戏 HUD 与玩家角色。旧存档键与进度协议保持兼容。变更与验收边界见 [V3.9 说明](docs/RELEASE-3.9.md)。

# V3.7 让世界说话 · grounded faces and quiet scenes

修复眨眼时 CSS 原点与 SVG 枢轴重复应用导致的眼睛离开脸部。人类默认双臂自然下垂、仅轻微屈肘，左右肘部与手掌镜像；待机动作收敛。阿尔弗、小巨魔、巨魔妈妈与沃夫接入各自的眨眼、视线、轻微呼吸和对白表现，枝枝继续使用四足动作。

场景不再默认显示地点说明、章节覆盖层、任务指令和文字指引牌。数字与实际谜题图案保留，主动调查时通过角色对白或「希尔达 · 心想」反馈，手记和菜单中的自愿帮助仍可打开。森林大卫站位避开绳圈；可拿取物品和关键控制件放入独立可见层，重叠点击优先命中道具而不是 NPC。

本轮说明与边界见 [V3.7 发布说明](docs/RELEASE-3.7.md)。`tests/presentation.py` 直接测量九个命名角色眨眼的渲染坐标，检查十二幕文字、手臂镜像以及真实鼠标 / 触控取绳。报告包含被测构建 SHA-256；只有全部受检报告匹配当前构建才允许 `bash deploy.sh` 发布 NAS。

## V3.6 同行的呼吸 · living companions

枝枝不再平移固定四肢：四条腿独立求解并保持支撑蹄的世界接触位置，跟随有加速、刹停与短暂收步转向；慢走和小跑使用不同落脚顺序，坡道身体与地面倾斜匹配。停步后有嗅闻、听声、眨眼、耳朵和尾巴的独立表现，剧情登船时暂停普通步态。

大卫、芙丽达和妈妈的待机动作加入轻微重心转移、扶挎包带、整理围巾和摊掌。动作之间留有停顿，各人的节奏不同；支撑机关时不播放分心的手势。人物的上身呼吸不再带着脚一起上下漂浮。希尔达仍由既有接触骨架控制四肢，共享视线和眨眼节奏；本轮没有重做阿尔弗、巨魔和沃夫的骨架。

`tools/cast-studio.html` 新增枝枝慢走 / 小跑 / 停步预览和「对白演示」开关，关闭对白后可单独看 NPC 待机。见 [V3.6 发布说明](docs/RELEASE-3.6.md)。新增 `tests/life.test.cjs` 和 `tests/life.py`，NAS 发布会检查这些表现的浏览器报告是否对应当前构建。

## V3.5 伸手可及 · scale and physical interaction

家中主角与同伴的舞台比例重新校准，窗台、挂灯和热点同步调整；对白头像不受场景放大影响。拿取提灯、来信、围巾、绳圈、齿轮和羊毛毡使用接触、拿起、收好的动作过程，未完成前不提交物品。手臂改为固定骨长的关节空间插值，加入手腕转向、握持手形、屈膝与重心配合。钟楼检修坡道与钟舌踏台让高处操作有实际支撑，不再靠伸长手臂。

本轮变更、测试方法与边界见 [V3.5 发布说明](docs/RELEASE-3.5.md)。NAS 发布使用 `bash deploy.sh`，先核对当前构建的浏览器报告，再备份、校验上传、原子替换单个文件，最后校验公开网页响应。不会修改其他游戏的权限。

## V3.4 彼此倾听 · dialogue and attention

希尔达、大卫、芙丽达和妈妈现在共用舞台 / 头像口型表演；听者会看向说话者，说话者有独立节奏的轻微点头。标点、整句显示、暂停和减少动态模式有明确的停顿规则。机关接触动作仍由原来的骨架控制，存档协议和谜题前置条件没有改变。口型由文字节奏驱动，不是录音音素同步，也不代表已经完成发行级美术。

本地开发与验收说明见 [V3.4 说明](docs/RELEASE-3.4.md)。源码已支持直接在 Mac 上构建、启动和运行浏览器测试：

```sh
npm run check
npm run dev  # 仅监听本机 127.0.0.1:8080；打开 /dev.html 调试源码
```

直接打开 `tools/cast-studio.html` 可进入角色表演工作台，切换说话者、剧情情绪、镜像、暂停和减少动态；也可在开发服务器访问 `/tools/cast-studio.html`。它直接加载 `src/art` 的同一份模块，修改人物画面后刷新即可比较舞台和头像。

测试用 Python 虚拟环境与报告不进入 Git。已创建 `.venv` 的机器可直接运行：

```sh
export CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
.venv/bin/python tests/playthrough.py
.venv/bin/python tests/acting.py
.venv/bin/python tests/cast-studio.py
.venv/bin/python tests/art-audio.py
.venv/bin/python tests/native-storage.py
```

完整通关生成后两项所需的 `tests/fixtures.json`。已有这份检查点时，可用 `.venv/bin/python tests/setpiece-check.py` 单独复跑攀梯和屋顶演出回归，结果写入 `previews/setpiece-report.json`，不会覆盖首次完整测试报告。实际报告、截图和声音采样在本机生成，不将预期结果写成已经通过的测试。运行开发服务器不会自动部署 GitHub Pages 或 NAS。

## V3.3 光与回声 · character and score refinement

The stage cast and dialogue portraits now share the same refined drawings. Music uses five authored, synthesized cue families and four independent mixer controls. Same-scene unmute and background transport handling are fixed. This update preserves the full adventure and existing saves.

See [release notes](docs/RELEASE-3.3.md) for implemented changes and explicit quality boundaries. The earlier painterly concept sheets are not presented as integrated animation assets.

```sh
npm run check
python tests/playthrough.py
python tests/art-audio.py
python tests/native-storage.py  # real HTTP/file-origin storage, unrestricted runner
```

# 希尔达 · 黄昏的回声：归途

### V3.2 扶稳归途 · Hilda: Homeward

一个十二幕、全屏、可离线游玩的非官方同人点触冒险。沿着一封黄昏的来信走进雨城、地下水道和钟楼，直到每一位同伴平安归来。

[GitHub Pages 试玩](https://kingbright.github.io/hilda-homeward/) · [个人 NAS 镜像](https://games.hackerlife.fun:8443/hilda/)

NAS 镜像需要仓库维护者单独部署。本仓库的更新不代表 NAS 已同步。

## 这一版实际改变了什么

V3.2 集中精修「档案室搬梯取书」和「风暴屋顶协作救援」，让动作过程、空间关系与前后呼应参与解谜。

- 档案梯有轨道停靠位、水滴索引和独立轮刹。移动、锁轮、攀爬、取书和下梯可见；书在完成并返回地面后才进入背包。
- 屋顶先系好锚点，送出绳端救回大卫，再请他稳住横梁支点。希尔达用长挑杆抬梁，芙丽达抽出背包、退到安全绳旁；最后带上枝枝，逐个登上沃夫。
- 信标由低处可触及的检修轮带动，高处光轴与低处轮盘同步。拖动与点按使用同一角度定义，所有新增步骤支持键盘和触屏。
- 风暴退回检查点保留已完成的救援与锚点，不把刚救回的同伴重新放进险境。舒缓模式关闭计时；减少动态模式不播放攀爬和救援位移。
- 拖动预览独立于存档状态。取消手势、进入菜单、失焦或页面隐藏时放弃预览；未完成演出重载后，物品和可重试条件仍在。
- 新增 `content/setpieces.js`、`engine/setpiece-motion.js`、`art/setpiece-life.js`，分开规则、纯演出采样和画面反馈。存档仍为 V3 协议，已完成的旧章节不需要重做。

此前精修继续保留：

V3.1 集中打磨「雨中北门 → 森林 → 水泵」，保留十二幕完整主线，不以增加重复房间代替精修。

- 角色行动有准备、接触、收势三个阶段。屈身拾取、拉绳、转轮、投出绳钩和使用长杆会对应实际机关位置；手臂使用两段式逆运动学，脚下高度与水泵检修台共用几何。
- 点按、拖动、键盘与背包投放共用「走近 → 验证 → 操作 → 提交结果」路径。拖雨棚不再隔空生效；菜单暂停演出，未完成动作重载后不丢物品，重复输入不会重复发放道具。
- 北门逐格抬升，雨棚逐步卷起；森林绳钩有投掷轨迹，绞盘带动桥板升起。需要大卫稳住制动，再由希尔达转动绞盘。
- 水泵先关闭进水闸，才能安全清理滤网；连好管路后要重新开闸、试压。进水隔离、实际漏点、阀门位置与压力表互相对应，运行后不能带压拆接头。
- 雨地涟漪、桥桩与制动标牌、湿木纹、金属管接头、检修台与维护示意图细化。回访森林时，水中叶片流向与水泵状态一致。
- 新的动作时间轴、角色骨架、动作编排、地形轮廓和章节景物独立为模块。继续采用 V3 存档协议，已完成章节不强迫补做新步骤。

此前 V3 已有的功能继续保留：

保留原有十二幕、角色比例、绳套取钩、桥面行走高度、检修挑杆、合成音景和逐字对白。在此基础上增加：

- 场景内放大观察与平移，放大后仍能操作机关；物品可打开独立观察页，查看放大的插画、材质、磨损与用途线索。
- 水泵改为连通图判定：水从进水口逐段传播，在真正的断点漏出。正确接管后要试压，运行中接头锁紧，画面和判定共用一套连接规则。
- 钟楼齿轮的轴距、齿数、热点共用定义；装配后还要转动中轮，使轮缘金线与机架缺口对齐。相邻轮子的转角按齿数比例反向联动。
- 明确的物品用途规则。选错工具不会莫名触发对话、打开机关或丢失道具；屋顶横梁使用此前获得的长挑杆，而不是短曲柄。
- 十二处可选环境叙事，发现后进入手记，不强迫收集，也不阻塞主线。
- 场景材质刻痕、螺栓、铭牌、藤叶、前景层、光束、浮尘及放大物品的针脚、金属高光和磨损细节。
- SVG 增量更新、同帧状态刷新合并、独立存档服务；V2 存档迁移到 V3 独立存储位置，原 V2 数据不覆盖，损坏的主存档不会污染已验证的备份。

这是一次框架和体验升级，不是商业发行认证。完整配音、其余章节的专用动作、原创或获授权的 IP、美术统一制作和真实设备验收仍是后续工作。

## 直接玩

下载 `index.html`，在现代浏览器中打开。发布文件包含所有代码和矢量画面，没有 CDN、外部图片或音频依赖。`hilda-homeward-v2.html` 保留旧链接兼容，但由构建器生成同一份 V3 内容。

手机建议横屏。聊天附件预览不一定执行脚本。设备或浏览器禁止本地存储时，游戏会提示通过菜单导出 JSON 进度。

| 操作 | 方式 |
| --- | --- |
| 移动 / 调查 | 点击地面或目标；A / D、左右方向键移动 |
| 操作机关 | 点击或拖动；已有拖动机关保留点按替代 |
| 物品使用 | 背包中选择或拖动物品，再点场景目标 |
| 物品组合 | 选中第一件，再打开背包选第二件 |
| 仔细观察 | 选中物品后点「观察」；未选物品时点放大镜或 E 放大场景 |
| 离开近景 | 「返回全景」、E 或 Esc；拖动空白处可平移近景 |
| 对话 | 点击对白、空格或回车；先显示整句，再推进下一句 |
| 手记 / 背包 / 热点 / 全屏 | J / I / H / F |
| 暂停 | Esc；手记、菜单、背包、对白、机关工作及后台暂停风暴计时 |

声音默认关闭。所有主线谜题可完全依靠画面解开。新增动作不要求快速连点或精确操作。舒缓模式关闭风暴计时，减少动态模式关闭新增叶片、浮尘等动画。

## 开发与构建

运行时使用 **SVG 2D + 原生 JavaScript + Web Audio**，不是 Canvas。没有引擎、运行时包管理器或运行时联网服务。

需要 Node.js 22+：

```sh
npm run build
npm test
python3 -m http.server 8080
```

`dev.html` 逐个加载源码文件，适合编辑与断点调试；`index.html` 是自动构建的单文件发布物。不要手工修改两个发布 HTML，下一次构建会覆盖它们。

```text
src/
  engine/            运行时、存档、音景、镜头、水路图、动作时间轴、逆运动学
  content/           物品用途、配方、环境叙事、机关几何、动作编排、行走台面
  art/               绘图基元、角色骨架、物品、材质、章节演出
  scenes/00-home/     art.js 画面；logic.js 热点、对白、动作、提示
  scenes/.../        其余十一幕，采用相同边界
  story/             叙事装配与共用行为
  ui/                样式
  template.html      HTML 外壳
  bootstrap.js       唯一启动入口
```

本轮变更与限制见 [V3.2 发布说明](docs/RELEASE-3.2.md)。真人试玩可用 [盲测提纲](docs/PLAYTEST.md)，该文档不是已经完成的玩家研究。

场景作者指南见 [架构与扩展](docs/ARCHITECTURE.md)，后续品质门槛见 [品质计划](docs/QUALITY.md)。依赖注册器在开发和单文件发布中使用同样的语义，缺失、重复或循环依赖会明确报错。

## 测试

```sh
npm run check
# 浏览器测试工具是开发依赖，不会打包进游戏。
python3 -m pip install -r tests/requirements.txt
python3 -m playwright install chromium
# 设为所安装 Chromium 的可执行文件；Linux 已装 Chromium 时可以省略。
CHROMIUM_PATH=/path/to/chromium python3 tests/playthrough.py
```

单元测试覆盖全部 64 种水路组合、用途与配方、迁移、损坏备份、存储拒绝、场景结构和齿轮几何；新增动作时间轴、暂停取消、手臂几何、地形连续性、同伴制动和进水隔离测试。浏览器测试使用真实点击、键盘和拖拽完成整段剧情，再测试输入、导入导出、检查点和触屏模拟。`tests/chapter-regressions.py` 与 `tests/setpiece-regressions.py` 自动纳入完整通关测试，验证新动作的中断、重载、重复输入、点拖一致性和维护顺序。

本地完整通关测试使用 HTML 注入和明确的内存 Storage 适配器；这不等于真实设备或浏览器原生存储持久性验收。另有 `tests/native-storage.py` 在允许本地 HTTP / file 导航的 CI 环境检验原生存储，结果单独记录在 `native-storage-report.json`。完整通关报告在 `test-report.json`，带被测 HTML 的 SHA-256；截图在 `previews/`。测试报告和截图由 CI 工件保存，不加入源码提交。

## 部署与存档

GitHub Pages 继续使用根目录 `index.html`。原有 `deploy.sh` 保留，没有在本次升级中执行远程 NAS 操作。用该脚本部署前先 `npm run build && npm test`。

V3 使用 `hilda-echoes-homeward-v3` 和独立备份键。读取优先级为 V3 主存档、V3 备份、V2 主存档、V2 备份。已完成的 V2 水泵、钟楼不会因增加新步骤而要求重玩。各个浏览器和站点的存储彼此独立，需要 JSON 导入导出迁移。

## 创作与权利说明

这是非官方同人游戏。Hilda 的人物、名称和世界观来源于 Luke Pearson 原作及其改编作品；这里的事件、对白和程序化画面为这个原型制作。没有使用动画截图、原声录音或字体分发包。

本仓库先前声明的 MIT 软件许可不等于获得角色、名称、故事世界或商标的商业使用权。准备商业发行前，应完成权利审查，取得所需授权或改为自有原创世界。请不要把可运行原型当成已经获授权的商业产品。
