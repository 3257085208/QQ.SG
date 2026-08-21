# QQ.SG Motion Gap Analysis

> 审计状态：仅完成机制审计，未实施任何代码改动。
>
> 审计日期：2026-08-22
>
> 参考文件：`/Users/marknkx/Documents/ChatGPT/CREATIVE_INTERACTION_STUDY.md`
>
> 当前仓库基准：`99ba735 refine authored desktop motion`

## 0. 结论先行

QQ.SG 当前已经不是“简单 HTML 单页”。它有 React + TypeScript + Vite、GSAP / ScrollTrigger、Lenis、独立的移动端渲染分支、原创 SVG world field、实时状态内容、Archive 横向 deck，以及 Work 的 sticky visual column。

所以当前和研究报告之间的主要差距，不是“少用了几个技术栈”，也不是应该把 Lando 的 Rive、WebGL、图片或品牌资产搬过来。真正的差距是：

1. **同一场景里的不同运动层还没有完全分工。** 很多层仍由一个总 timeline 或一个 `onUpdate` 同时写入。
2. **滚动空间已经有 runway，但部分 runway 仍是设计参数，而不是由内容几何直接推导。** Archive 已经接近正确方向，Hero / Work 仍有固定区间的痕迹。
3. **Marquee 只有“自主 CSS 循环 + 一次滚动位移”，还没有形成“自主时间运动 + direction/timeScale + 独立 scrub offset”的三层系统。**
4. **原创 Field 已经有真实节点、路径、packet tail 和 source → destination 因果，但它主要靠定时器独立播放，尚未和 Hero 的 scroll phase 建立明确的运行时契约。**
5. **文字 reveal 仍是局部 CSS 状态，尚未成为可复用的、按场景进入时触发的 text layer。**
6. **生命周期基础是合格的，但重型模块尚未按可见性 lazy init；Archive 的每帧状态更新也仍然偏“全量写入”。**

这解释了为什么页面已经有“作品集”的结构，却偶尔仍显得像几个漂亮模块被一条 timeline 串起来：视觉方向并不差，缺的是 motion ownership、几何映射和 layer timing 的一致性。

## 1. 审计边界与证据等级

本次只做以下事情：

- 完整阅读 `CREATIVE_INTERACTION_STUDY.md`。
- 对照当前 `experience/src` 的桌面 Hero、Archive、Work、Current System、移动端分支和滚动引擎。
- 只抽取报告中已通过生产源代码、匿名 CDP 运行时或两者交叉验证的通用机制。
- 保留 QQ.SG 当前已有的内容、原创地图、状态页、GitHub / Notes 内容和移动端交互。

本次明确不做：

- 不复制 Lando Norris 的人物、赛车、头盔、签名、Logo、颜色组合、文案或 `.riv` 资源。
- 不复制目标站 Webflow DOM、bundle、精确字体处理或页面结构。
- 不修改 `experience/` 代码。
- 不把“目标站用了 Three / Rive”误判为 QQ.SG 必须添加 Three / Rive。

报告中确定性较高的参考机制包括：真实 overflow runway、CSS sticky + master scrub、`containerAnimation` 内部 parallax、文字和媒体分离结束时间、marquee 三层运动、IntersectionObserver lazy init、显式 cleanup，以及移动端替换为 normal flow。目标站长期 FPS、内存和 GPU frame-time 并未被研究报告验证，因此本审计不会把这些指标写成 QQ.SG 的性能保证。

## 2. 优先级总览

| 优先级 | 差距 | 影响 | 建议 |
|---|---|---|---|
| P0 | Hero / Field 的运动所有权没有完全统一 | 首屏有时像“身份层淡出 + Field 独立播放”，不是一个完整镜头 | 先建立 Hero scene contract；保留现有 runway 和 dwell |
| P0 | Marquee 缺少 direction/timeScale 与尺寸驱动的无缝循环 | 字带会动，但滚动输入没有改变它的动能，质感接近 CSS 装饰 | 重做为独立的自主时间层 + scroll response 层 |
| P0 | Archive 已有真实几何，但全量 `onUpdate` 状态写入仍是主导机制 | 卡片有空间关系，却容易像“当前卡片切换器” | 保留 deck 几何，拆 master movement、media parallax、active threshold |
| P1 | Work 已有 text-first / media-second 和 normal-flow takeover，但视觉内部运动不足 | 场景切换成立，内部画面仍偏静态卡片 | 只为原创媒体增加第二层空间运动，不重做 Work 结构 |
| P1 | Field 的原创 authored visual 没有明确的输入 / 生命周期契约 | 复杂度藏在组件和定时器里，快速滚动、反向、重挂载时难以统一控制 | 用自己的 phase / visibility / cleanup contract，不引入 Lando 资产 |
| P1 | Text reveal 不是全站可复用系统 | 大标题常靠整体 opacity / transform 出现，缺少细小但明确的 editorial timing | 建立少量方向性 reveal helper，只用于重要文字 |
| P2 | lazy init、resize、cleanup 还没有按系统拆开 | 当前页面能工作，但重型视觉全部随页面初始化 | 为 marquee / Field / media 提供可见性和销毁边界 |
| P2 | desktop / mobile 边界是 820px，缺少基于 composition 的验证矩阵 | 宽平板可能进入桌面场景，但空间未必足够；不能机械照搬参考站 992px | 通过实际构图和 viewport QA 决定边界 |

## 3. P0 — Hero / Field：从“并行效果”变成一个完整镜头

### P0-1. Hero scene contract 与 Field phase

#### 1. 当前实现

- 桌面 Hero 在 `experience/src/styles.css:261-276` 使用 `310svh` runway，`intro-stage` 通过 sticky 固定视口。
- `experience/src/engine/scroll.ts:40-106` 使用 `identity → signatureEnter → tracksEnter → fieldEnter → fieldDwell → handoff → exit` 的 named phases。
- Identity、signature、两条 track、Field 和 handoff 仍由同一个 Hero timeline 统一驱动；这一点是当前最重要的骨架资产。
- Field 自身在 `experience/src/components/InfrastructureField.tsx:291-332` 通过定时器循环 `source → route-draw → travel → receive → decay → idle`，周期约 6 秒以上；packet 的路径动画在 `:225-287` 用 WAAPI keyframes 播放。
- Hero scroll timeline 只改变 `.intro-field` 的 clip-path、opacity、scale，并不向 Field 写入一个明确的 scroll phase 或 progress input。

#### 2. 参考机制

报告验证的通用机制不是“把签名换成 Rive”，而是让每个 authored visual 明确拥有：资产、运行时输入、resize 行为和 cleanup 行为。目标站的 Rive signature 用数值 scroll input；Hero 场景本身则使用 sticky runway，让 scroll progress 有稳定的空间预算。

更重要的是，静态构图负责场景关系，运动层只负责进入、揭示、位移和状态切换。大层之间需要明确的先后关系，而不是多个效果在同一时刻争夺主导权。

#### 3. 当前为什么显得廉价 / 粗糙

当前 Hero 有两个独立时间源：外层 scroll timeline 和 Field 内部 timer。用户看到 Field 时，Field 的 packet 可能正处在任意周期；用户反向滚动时，Hero 的可见性会反向，但 Field 的内部时间不会反向。这会让 Field 更像“放在背景里的动画”，而不是当前镜头的一部分。

此外，Hero 的 phase 数值本身是固定设计比例。它已经比单一 fade 好很多，但还没有把“Field 完整出现后需要观看多久”表达成 Field controller 可以理解的状态；因此 dwell 是外层 timeline 的停留，不是整个 Field 系统共享的观看区间。

#### 4. 应该保留什么

- `310svh` Hero runway、sticky stage 和 named labels。
- Identity → Field → Archive 的叙事顺序。
- 当前原创 `InfrastructureField`，包括真实 Natural Earth geometry、screen-space continuous arcs、节点、source / destination timing、packet ring 和短 tail。
- 当前 Field 的 quiet map hierarchy；不要因为研究了 WebGL 就把它改成雷达、粒子云或 3D globe。
- 当前 reduced-motion fallback 和移动端独立 normal-flow 路径。

#### 5. 应该删除什么

- 删除“外层 timeline 和 Field timer 各自决定 Field 当前状态”的双重 ownership。
- 删除未来可能重新加入的 pointer trail、scroll hijack、scroll lock、snap 或大幅 camera effect。
- 不要删除 Field 的自主 packet 语言本身；要删除的是它与场景可见性之间的无契约关系。

#### 6. 应该重做什么

下一轮应先定义一个 QQ.SG 自己的 Field runtime contract，例如：

```text
scene visibility / scroll phase
  -> field phase: idle | enter | dwell | handoff
  -> source / packet / destination behavior
  -> pause / resume / cleanup
```

Field 可以继续使用原创 SVG + WAAPI，不需要 Rive。关键是让 Hero 在 `fieldEnter`、`fieldDwell`、`handoff` 时能够控制 Field 的生命周期或读取一个统一的 phase；定时 packet 只在可见 dwell 内负责丰富内容，而不是决定场景是否已经进入。

### P0-2. Marquee：从 CSS 装饰循环变成连续动能系统

#### 1. 当前实现

- `experience/src/main.tsx:29-40` 每条 HeroTrack 固定渲染 3 个 collection。
- `experience/src/styles.css:265-276` 由 CSS `@keyframes` 做 31 秒 / 37 秒 linear drift；上、下两条方向相反。
- `experience/src/engine/scroll.ts:85-102` 只对外层 `.intro-track` 做一次 `x` 位移：上轨 `-56vw`，下轨 `+56vw`。
- 当前没有读取 track 实际宽度来决定复制数量或循环 duration，也没有 ScrollTrigger direction → `timeScale` 的运行时层。
- 当前也没有 marquee 的 IntersectionObserver lazy init；Hero 初始化时相关 DOM 和 CSS animation 已经存在。

#### 2. 参考机制

报告验证的 marquee 是三层叠加：

```text
autonomous linear loop, repeat:-1
+ ScrollTrigger direction / timeScale response
+ second scrub-linked x offset
```

复制集数量由 collection 结构提供，但 loop 通过 `repeat:-1` 保持视觉连续；duration 还会按 collection width、viewport 和 breakpoint coefficient 调整。滚动方向改变的是自主循环的动能，而不是简单替换一个 transform。

#### 3. 当前为什么显得廉价 / 粗糙

当前字带“会动”，但滚轮和字带没有真实的速度关系：正常滚动、反向滚动、停下时，CSS 时间循环仍按自己的节奏走。外层 x 位移和内部 CSS transform 各自存在，视觉上更像一条预设背景动画被推进，而不是一个对输入有反应的连续系统。

固定 3 份 collection 也没有把内容宽度、viewport 和断点纳入运动计算。窗口变化后，循环节奏仍主要依赖固定秒数，因此不同宽度下的重复感和速度感可能不一致。

#### 4. 应该保留什么

- 两条 opposing tracks。
- QQ.SG 自己的词汇：`PERSONAL INDEX`、`BUILD / RUN / RECORD`、`FIELD TRACE` 等。
- 大字号、跨视口、非对称位置，以及 Hero Field 之前的动能暗示。
- 自主运动与 scroll-linked motion 分离的总体原则；不要把 marquee 变成只在滚轮时才移动。

#### 5. 应该删除什么

- 删除固定 `@keyframes + 固定秒数 + 固定 3 份 collection` 作为唯一循环机制。
- 删除让同一层同时承担“循环、方向、滚动位移”而没有明确 ownership 的写法。
- 不要删除 marquee，也不要把所有字带改成一次性进入的普通标题。

#### 6. 应该重做什么

建立 QQ.SG 自己的 marquee controller：

1. 用实际 collection width 生成足够但不过量的循环内容。
2. 用一个 linear、可重复的 master loop 负责时间运动。
3. 用 ScrollTrigger direction / input response 改变 `timeScale` 或方向状态。
4. 用第二条 scrub offset 让滚动本身产生位移反馈。
5. 在 Hero 不可见或 Field 接管后暂停昂贵更新，并提供 kill / cleanup。

不需要照抄参考站的 data attributes、copy、颜色或 typography。

### P0-3. Archive：保留真实 deck 几何，拆掉全量每帧状态写入

#### 1. 当前实现

- `experience/src/engine/scroll.ts:121-207` 已通过 `deck.scrollWidth - viewportWidth` 计算实际 overflow，并用 `runway = actualOverflow / 0.9` 设置 stage 高度。
- 首卡和末卡的 center 对齐 padding 也由 viewport/card width 计算，不是固定 `translateX`。
- 同一个 sequence timeline 在每次 `onUpdate` 中调用 `updateFocus()`；该函数遍历全部 cards，在 `:163-175` 对每张卡执行 `gsap.set` 的 opacity、scale、zIndex，并对图片执行 `gsap.set` x parallax。
- `experience/src/styles.css:277-304` 保留 sticky viewport、card hierarchy、active / neighbor opacity 和 h3 clip reveal。

#### 2. 参考机制

目标站横向段使用真实 `trackWidth - viewportWidth` 作为竖向 runway，CSS sticky 提供视口，一个 master tween 负责整体 track x；每张媒体再通过 `containerAnimation` 获得自己的内部 parallax。文字 reveal 使用 item 自己的进入时机，而不是让整个 horizontal section 的所有元素同时完成。

#### 3. 当前为什么显得廉价 / 粗糙

Archive 的几何已经正确，但当前每帧都把所有卡片当成“当前焦点的函数”重新写一遍。结果是空间 deck 的运动和 active state 的切换耦合在一起，卡片更像一个会移动的 selector，而不是一组各自拥有相位的记录。

图片 x 方向现在由 card 相对 viewport 的位置直接计算，属于一层补偿；它还不是“deck 的刚体位移 + 图片在 card 内部的第二层相位”。因此有空间关系，但深度感仍不够稳定。

#### 4. 应该保留什么

- `scrollWidth - viewportWidth` 的实际几何测量。
- 首尾卡片 center alignment、sticky viewport、Archive hold 和反向滚动能力。
- active / previous / next hierarchy，以及 far cards 的低 opacity。
- 现在的 `archive-start / archive-travel / archive-exit` labels。
- 现有 content order 和卡片内容。

#### 5. 应该删除什么

- 删除把全部 card 的视觉状态都放在同一个 `onUpdate → gsap.set(all cards)` 里的做法。
- 删除以全量 opacity 变化代替进入阈值的无差别更新。
- 不要删除真实 overflow，也不要退回固定 `300vh` 或 scroll snap。

#### 6. 应该重做什么

拆成三层：

```text
master deck x / actual overflow
  + media internal parallax / containerAnimation-like mapping
  + active threshold / one-shot text reveal
```

active card 可以按最近中心或相位阈值切换；只有切换时更新 class / `aria-live`，而不是每一帧为全部 cards 重写同一批内联值。媒体保留短幅度 parallax，文字只在真正进入时 reveal。

## 4. P1 — Work、Field authored visual 与文字层

### P1-1. Work：保留现有 handoff，增加内部空间层

#### 1. 当前实现

- `experience/src/engine/scroll.ts:209-234` 已明确让 Work intro 的 text 在 `.6` settle、media 在 `.84` settle。
- `experience/src/engine/scroll.ts:236-302` 的 Work sequence 采用 `WORK_TIMING.hold = .66`、`transition = .34`，并让 visual stack 与 records 同步更新 active index。
- `experience/src/styles.css:341-414` 使用 sticky visual column、normal-flow record list 和 `132svh` record runway；Work sequence 之后没有强制 panel `translateY(100vh)` takeover。
- `experience/src/main.tsx:125-151` 的 Work 内容是真实 status screenshot、README / source tree 和 Notes，不是虚构 dashboard。

#### 2. 参考机制

报告验证的关键不是复制 ON/OFF TRACK 构图，而是：文字和媒体使用不同结束时间；媒体可以在其容器随场景移动时，继续有一个独立的内部 parallax；下一段 takeover 由 sticky previous + normal-flow next + media 内部 y/scale 共同形成。

#### 3. 当前为什么显得廉价 / 粗糙

Work 的“进入”和“交接”已经成立，但 visual stack 内部大体是静态内容层的 clipPath / opacity 切换。用户能看懂项目变化，却还不一定能感到同一个作品画面在空间里继续运动。

这不是因为颜色不够，也不是因为需要更大的 scale。缺的是一层低幅度、与 scene progress 同源但不和 card 刚体运动相同的 media motion。

#### 4. 应该保留什么

- `text-settled → media-settled → takeover-complete` 的分层时序。
- sticky visual column + normal-flow records。
- `STATUS / OPEN SYSTEMS / NOTES` 的 hold、顺序和真实内容。
- 当前 accepted 的 warm graphite systems material 和 paper/status/notes material。
- 没有 snap、没有 forced completion、没有 panel rise。

#### 5. 应该删除什么

- 删除任何未来把三个 Work 项目同时做成强烈全屏 overlay 的方案。
- 删除把 clipPath 当成每个层唯一运动的方案；clipPath 可以保留为 reveal，但不应承担所有深度。
- 不要删除当前的 normal-flow handoff，也不要重排项目顺序。

#### 6. 应该重做什么

只在原创 visual 内增加一层可测量的内部运动：例如 screenshot crop、README surface 或 Notes index 在自己的容器内做小幅 x / y / scale 相位。整体 visual stack 继续由一个 master sequence 控制；内部媒体再使用相对自身进入 / 离开区间的 progress。文字仍然先 settle，内部媒体稍后完成。

### P1-2. InfrastructureField：从复杂组件变成可控制的原创 authored visual

#### 1. 当前实现

- `InfrastructureField.tsx:41-63` 定义 16 个城市点，`WORLD_MAP_PATH` 作为真实地图底图。
- `:107-170` 用 screen-space cubic path 生成 source → destination routes，特意避免 Pacific antimeridian 断裂。
- `:182-196` 为路径采样 25 个 keyframes；`:225-287` 生成 packet、tail、ring 和 receive pulse。
- `:291-332` 用定时器推进 burst phase，并在 burst 结束后生成下一批目标；`:343-415` 将地图、路径、节点、readout 和 QQ.SG core 组织在同一个 SVG / DOM 组件中。
- 当前组件有 timer cleanup，packet WAAPI animation 也在 unmount 时 cancel；但没有统一的 visibility observer 或 scroll-driven input。

#### 2. 参考机制

研究报告把 authored visual 与 runtime controller 分开：资产自己保存视觉复杂度，运行时只负责向它提供数值 input、resize 和 lifecycle。通用原则是“不要用 pointer trail 冒充 authored stroke”，也不要把每帧 geometry 生成当作高级感的来源。

对 QQ.SG 来说，这个原则应转译为：保留自己的 SVG / map / packet art direction，但让 phase、visible、pause、resume、destroy 成为清晰的运行时接口。

#### 3. 当前为什么显得廉价 / 粗糙

Field 的静态设计已经有作者性，问题主要在运行节奏：burst timer 自己决定 scene 内发生什么，Hero timeline 只决定 Field 容器什么时候出现。两者没有共同的 phase clock，导致 packet 的意义不会随用户滚动方向改变。

另外，路径、城市、packet、readout 和 phase 逻辑都集中在一个 React component 内。短期写起来直接，长期修改时容易继续加局部 timer / 局部 CSS class，最后出现“效果很多但没有统一导演”的观感。

#### 4. 应该保留什么

- QQ.SG 自己的 world map、节点集合、screen-space arcs 和 Pacific continuity。
- source first、packet travel、destination receive 的因果顺序。
- 现在的 3–5 个短 tail dots，而不是长 dashed green tail。
- quiet map、弱 graticule、少量 active labels 和 `15 / 26` readout。
- SVG / WAAPI 技术路线本身；不需要为了“多技术栈”强行改成 WebGL。

#### 5. 应该删除什么

- 删除不断叠加的独立 timer、局部动画和临时 class，尤其是没有 visibility / cleanup 对应关系的新增逻辑。
- 删除任何把地图变成 radar、粒子背景、country-border dashboard 或 fake metrics panel 的扩展方向。
- 不要删除现有地图几何和 packet language。

#### 6. 应该重做什么

为 Field 设计一个自己的 controller，而不是套用目标站的 Rive：

```text
InfrastructureFieldController
  setScenePhase(progress / phase)
  setVisibility(visible)
  pause()
  resume()
  destroy()
```

定时 burst 只负责在 dwell 中改变 packet 内容；scene enter / handoff 由 Hero 传入。这样 Field 仍是 QQ.SG 的原创内容，但拥有报告所说的 authored asset / runtime input / cleanup 三段契约。

### P1-3. Text reveal：从“出现”变成有方向的文字层

#### 1. 当前实现

- Archive h3 在 `experience/src/styles.css:301-304` 通过 `clip-path`、`translateY`、opacity 和 lime line 进入；触发依赖 `is-entered` class。
- Work intro 的 copy 在 `scroll.ts:225-232` 主要使用 x / y / opacity convergence。
- Navigation 使用 hover transform / marker，link 使用 underline scale；移动端有独立 press interaction。
- 当前没有跨 desktop scenes 复用的 `data-anim-high` 类似 reveal helper，也没有按 horizontal container / item 进入触发的统一文本时序。

#### 2. 参考机制

目标站的通用 reveal 机制是：重要文字先用方向性 clip reveal 进入，再让一条高亮线以错开的时间扫过；并不是所有 metadata 都动。横向 item 的文字可由 `containerAnimation` 进入，intro-like text 则使用普通 viewport trigger。

#### 3. 当前为什么显得廉价 / 粗糙

当前文本大多以一个 block 的 opacity / position 变化出现，视觉上“内容被打开了”，但没有明确的 reading order。尤其在 Work / Archive 之间，标题、说明、状态标签常常共享同一个 scene progress，层次感依赖布局而不是文字本身的时间关系。

如果继续给每个小标签加 fade，结果只会更碎；问题不是动画数量少，而是没有一个只服务于关键标题和短 eyebrow 的 reveal grammar。

#### 4. 应该保留什么

- Archive 当前的单一主标题 reveal 和 lime marker。
- Work 的 text-first / media-second timing。
- Navigation 的简短 hover feedback、link underline 和 mobile touch feedback。
- Mono metadata 的纪律感；不要把 system text 变成 display animation。

#### 5. 应该删除什么

- 删除对所有小 metadata、数字和装饰线都逐个加 reveal 的倾向。
- 删除任何 custom cursor、pointer trail 或把鼠标移动本身当作内容的效果。
- 不要删除现有标题，只减少它们之间的同时运动。

#### 6. 应该重做什么

做一个只面向 desktop 重要标题的轻量 reveal helper：支持 left / right、一次性触发、可选 lime strip、可选 `containerAnimation`。每个 section 只挑一个主标题或一句 eyebrow 使用；其他文本保持静止，让“文字先读到、媒体后抵达”成为页面的统一语法。

## 5. P2 — 生命周期、响应式与性能结构

### P2-1. Lazy init / cleanup：从“全页挂载”变成按系统管理

#### 1. 当前实现

- `experience/src/engine/scroll.ts:318-356` 已有 reduced-motion early return、Lenis ticker、Lenis scroll listener、GSAP context、resize refresh 和 `lenis.destroy()`。
- `experience/src/main.tsx:316-344` 通过 `isMobile` 切换 DesktopExperience / MobileExperience；移动端交互在 `mobileMotion.ts:383-397` 中独立挂载并 cleanup。
- InfrastructureField 自己清 timer，packet animations 自己 cancel；这是好的局部基础。
- Archive / Work / Current System 的 DOM 和相关 ScrollTriggers 会在 desktop mount 时一并初始化；没有像报告中的 marquee 那样使用 `IntersectionObserver(rootMargin)` 做远处 lazy init。
- Archive `onUpdate` 仍会对所有卡片和媒体执行内联样式更新。

#### 2. 参考机制

报告验证的 lifecycle 不是“所有东西都要 lazy”，而是每类视觉都要有可解释的 init / update / kill / off / destroy。Marquee 用 IO 延迟初始化；Rive 有 resizeDrawingSurface 和 cleanup；horizontal resize 会重新测量 geometry；Lenis 在 breakpoint crossing 时 destroy / recreate 并恢复 scroll。

#### 3. 当前为什么显得廉价 / 粗糙

这部分不一定直接造成截图上的廉价感，但会影响滚动稳定性：所有场景在页面进入时就准备好，局部系统的运动成本和主场景无关；当用户快速穿过页面或反向浏览时，很多 state 仍然依赖全局 timeline 每帧写入。

这种结构在短页面上不明显，在当前已经有 Hero、Archive、Work、Field、状态图和移动分支的页面上，会让运动显得“硬接在一起”，也更难做精确的暂停和恢复。

#### 4. 应该保留什么

- GSAP context、Lenis destroy、resize debounce 和 reduced-motion fallback。
- Desktop Lenis / Mobile native scroll 的分离。
- Field / mobile interaction 的现有 cleanup 基础。
- transform / opacity / clipPath 优先，不回到频繁修改布局属性。

#### 5. 应该删除什么

- 删除未绑定 cleanup 的新 timer、observer、event listener 和 ScrollTrigger。
- 删除可用 threshold / class 解决却每帧写入的 DOM 状态。
- 删除任何为了“顺滑”而加入的 scroll interception、timeout lock 或 forced animation completion。

#### 6. 应该重做什么

按系统拆出生命周期边界：

```text
Hero marquee: init when near viewport / kill on unmount
Field: visible pause/resume + scene phase + destroy
Archive: measure on refresh / master x / threshold updates
Work media: scene-local progress / cleanup
Lenis: one desktop owner / mobile excluded
```

目标不是堆更多 observer，而是让每个 observer、timeline 和 timer 都能回答“谁创建、谁更新、谁销毁”。

### P2-2. Responsive boundary：不要复制 992px，要验证自己的 composition

#### 1. 当前实现

- 当前桌面 / 移动分支边界是 `MOBILE_QUERY = max-width: 820px`，见 `experience/src/main.tsx:10` 和 `experience/src/engine/scroll.ts:318-325`。
- MobileExperience 是独立内容顺序和独立触摸逻辑，不是把 desktop horizontal layout 缩窄；这点与报告中的 normal-flow replacement 一致。
- Desktop styles 从 `min-width:821px` 开始；移动端有自己的 typography、spacing、status inspect 和 system row interaction。

#### 2. 参考机制

研究站的 horizontal / Lenis desktop path 在 `>=992px`，移动端直接停用横向 master tween，使用 normal flow。这个数字本身不是可复制的设计答案；可迁移的是“横向 spectacle 需要足够的 composition width，移动端应换成阅读顺序优先的结构”。

#### 3. 当前为什么显得廉价 / 粗糙

如果 821–991px 的平板宽度进入 desktop scene，Hero marquee、Archive card width、Work visual column 仍可能共享桌面比例；画面不会一定坏，但可能变成“桌面构图被挤窄”。反过来，过早切换移动端也会损失本来可以成立的横向关系。

当前问题不是边界数字一定错误，而是缺少“composition 是否成立”的实测门槛。

#### 4. 应该保留什么

- Mobile 作为独立 route / normal flow 的事实。
- Mobile 原生滚动，不引入 Lenis、pin、snap 或 preventDefault。
- 当前 375×812、390×844、430×932 的移动端 QA 方向。
- Desktop 关键场景继续以宽屏为目标，不因移动端需求压扁。

#### 5. 应该删除什么

- 删除“看到参考站是 992px，所以直接把 QQ.SG 改成 992px”的机械复制。
- 删除让同一套 desktop horizontal DOM 在手机上继续承担主要阅读任务的方案。
- 不要删除当前 mobile content、touch inspection 和 system-row interaction。

#### 6. 应该重做什么

建立 viewport acceptance matrix，而不是先改数字：

```text
desktop: 1440×900 / 1280×720
tablet: 1024×768 / 900×700
mobile: 430×932 / 390×844 / 375×812
```

对每个宽度检查 Hero marquee 是否有足够 loop width、Archive card 是否仍能 center、Work visual 与 copy 是否有空间、移动端是否没有横向 overflow。最终边界应由构图成立的最小宽度决定。

## 6. 建议的实施顺序（等待确认后再做）

本文件不是实施计划的授权。若确认后，建议按以下顺序逐步改，每一步都保持可回滚：

1. **先做 P0-1：Hero / Field contract。** 不换视觉资产，只统一 Field 的 scene phase、pause / resume 和 handoff ownership。
2. **再做 P0-2：Marquee 三层运动。** 先只改 Hero tracks，保持 copy、颜色和整体位置。
3. **再做 P0-3：Archive update ownership。** 保留已验证的真实 overflow，不改卡片顺序和 runway 目标。
4. **再做 P1：Work 内部 media phase + 少量 text reveal。** 不改 Work colors、material、content 或 normal-flow takeover。
5. **最后做 P2 lifecycle / breakpoint QA。** 只在真实 viewport 和 reduced-motion 下观察，避免用“感觉更顺”覆盖掉已验证的几何。

## 7. 明确不建议的方向

- 不要把 Lando 的 signature、Rive state machine、helmet、driver image 或品牌色搬进 QQ.SG。
- 不要为了证明“多技术栈”加入 WebGL globe、radar、粒子云、fake metrics 或全站 shader。
- 不要用更长的 `duration`、更强的 blur、更多 opacity 或更大的 scale 掩盖没有空间映射的问题。
- 不要重新加入 scroll snap、wheel interception、preventDefault、scroll lock 或强制等待动画完成。
- 不要把移动端再次改回桌面结构的缩小版。
- 不要把每一个小字、每一条线、每一张卡都做成同时运动的主角。

## 8. 最终判断

QQ.SG 当前最值得保留的是：原创内容、真实状态数据、Field 的作者性、Archive 的实际 deck geometry、Work 的 normal-flow handoff、移动端独立架构，以及 reduced-motion / cleanup 基础。

最应该重做的不是视觉资产，而是三条运动关系：

```text
scroll progress  -> scene phase
scene phase      -> layer timing
layer timing     -> authored visual / media / text ownership
```

如果这三条关系建立起来，页面会从“有很多动效的个人主页”更接近“一个被导演过的个人系统”；如果没有，继续增加技术栈只会增加复杂度，不会自动增加质感。

**审计完成。等待确认后再实施。**
