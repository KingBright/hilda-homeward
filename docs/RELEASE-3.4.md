# V3.4 彼此倾听

## 本轮落地

这轮聚焦四个人类角色的对话表现，不增加房间或重新改写主线。希尔达、大卫、芙丽达、妈妈的舞台形象和对白头像共用口型采样。说话时有三种张口轮廓和闭口停顿；不同角色的采样频率和点头相位独立。只有当前正在逐字显示台词的说话者张口，听者保持闭口。标点和空白、立即显示整句以及结束对话都会停止口型循环。关闭音频不影响视觉表演。

听者根据实际 SVG 变换确定说话者所在方向；镜像的角色使用镜像后的局部方向。说话者优先看向相邻台词里的对话者，在同场景中没有该角色时回到主角或可见的人类角色。视线幅度限定在一个局部坐标单位内，轻微点头绕颈部转动，不是移动整个角色。

暂停保留当前姿势；减少动态模式移除口型循环和点头，但保留静态视线信息。机关演出控制内层头部与四肢，新表演层不覆盖接触目标、手臂逆运动学、脚的位置、物品和剧情状态。

## 模块边界

- `src/art/cast-design.js`：共享人物画面，分出瞳孔、嘴形和外层头部枢轴。
- `src/art/cast-acting.js`：纯表演采样与 DOM 应用；不会写入游戏或存档状态。节点只在场景 / 头像重建时重新收集，属性有变化才写入。
- `src/art/performer.js`：继续负责主角身体、步态和机关接触；不再独立驱动对白嘴形。
- `src/engine/runtime.js`：提供当前说话者、打字进度和暂停状态，舞台和头像使用同一表演时间。

动物、巨魔与阿尔弗仍沿用 V3.3 绘制和已有次级动画；本轮没有为它们制作新的专用口型。原有音乐、环境、效果和对白提示音的四路混音保留，没有加入新的录制配音。

## 角色表演工作台

`tools/cast-studio.html` 可以直接在本机浏览器打开，或通过开发服务器打开 `/tools/cast-studio.html`。它只加载共享的模块注册器、角色绘制、表演采样和角色样式，不复制另一份人物实现，也不修改游戏存档。

工作台支持四位说话者、四类剧情情绪、整体镜像、暂停、句首重播和减少动态；舞台与大头像使用相同采样。用于快速迭代画面和表演，不取代主游戏内的动作与遮挡验收。`tests/cast-studio.py` 检查控制项、窄屏排版和源码开发版入口，结果保存在 `previews/cast-studio-report.json`，截图为 `previews/cast-studio-v3.4.png`。

## 本地开发

在项目根目录执行：

```sh
npm run check
npm run dev
```

浏览器打开 `http://127.0.0.1:8080/dev.html` 调试源模块，或打开 `/index.html` 检查单文件发布物。结束服务器用 Ctrl+C。也可直接打开 `index.html` 离线游玩。不要手工修改 `index.html`、`hilda-homeward-v2.html`、`dev.html` 或 `build-manifest.json`，这些文件由构建器生成。

浏览器测试环境首次准备：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r tests/requirements.txt
export CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
```

其他系统将 `CHROMIUM_PATH` 指向已安装的 Chromium，或使用 Playwright 的 Chromium。应用本身仍然没有运行时依赖；Python / Playwright 只用于开发验收。

```sh
npm run check
.venv/bin/python tests/playthrough.py
.venv/bin/python tests/acting.py
.venv/bin/python tests/cast-studio.py
.venv/bin/python tests/art-audio.py
.venv/bin/python tests/native-storage.py
```

先跑完整通关，生成 UI 驱动的有效章节样本 `tests/fixtures.json`；音频与原生持久化套件依赖该文件。表演专项可独立运行。输出包括 `test-report.json`、`acting-report.json`、`art-audio-report.json`、`native-storage-report.json` 和 `previews/` 中的截图与音乐样本。报告包含被测 HTML 的 SHA-256，必须与当前 `build-manifest.json` 对照；旧报告不能当成本轮验收结果。

## 修复回归脚本的截图竞态

旧攀梯检查先在中途截图，再点菜单暂停。在本次 Mac 本机运行中，截图期间动作正常完成、书已入包，脚本随后读取空的 `performance` 而失败。现在于浏览器观察到目标动作阶段的同一任务中触发实际菜单按钮，先暂停再采样和截图；集体登船的暂停检查也采用相同方式。不修改游戏时钟、动作时长或存档来迁就测试。

已有完整主线生成的 `tests/fixtures.json` 时，可运行 `.venv/bin/python tests/setpiece-check.py` 独立复测全部攀梯 / 屋顶回归。专项结果为 `previews/setpiece-report.json`，记录当前构建及测试源码指纹；它不覆盖 `test-report.json`，也不冒充又一次完整通关。首次完整测试失败与后续专项成功应分别报告。

## 验收边界

纯逻辑测试覆盖确定性、异常时间 / 视线的有限值、说话者选择、标点停顿、减少动态、角色节奏差异和共享图层。

`tests/acting.py` 包含真实首页对白 UI 检查，以及独立的四角色 SVG 测试场。后者用于验证镜像视线、暂停、节点替换和不覆盖接触头部，不冒充额外完整通关。

主通关和表演 / 音频套件使用明确的内存存档适配器。`native-storage.py` 另外使用真实 HTTP 和 file 来源的浏览器存储，不能把两者混为一谈。

这里的嘴形是文字节奏驱动的风格化表演，不是音素级口型同步。自动测试通过不等于真人审美、盲测、真机手机、Safari / Firefox、低端性能或发行级美术认证。没有商业 IP 授权声明。修改本地代码和本地提交均不会自动发布到 GitHub Pages 或 NAS。
