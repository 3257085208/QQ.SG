# QQ.SG / PERSONAL SYSTEM

一个面向个人品牌的编辑型主页：大字号排版、滚动叙事、轻量 WebGL 网络系统与移动端独立布局。

## 本地运行

```bash
cd experience
pnpm install
pnpm dev
```

打开 `http://127.0.0.1:5173/`。

## Cloudflare Pages 生产配置

生产分支是 `main`。在 Cloudflare Pages 的 Git 构建设置中填写：

| 配置项 | 值 |
| --- | --- |
| Production branch | `main` |
| Root directory | `experience` |
| Build command | `pnpm build` |
| Build output directory | `dist` |

保存后，Pages 会在每次推送 `main` 时自动安装依赖、构建 `experience/dist` 并发布；后续不需要提交 `dist` 目录。

如果旧的 Pages 项目仍然使用仓库根目录和 `public` 输出目录，需要在项目的 **Settings → Builds & deployments** 中改成上面的配置，否则它会继续部署旧的静态导航页。

## 技术结构

- React + TypeScript + Vite：页面结构与构建
- GSAP ScrollTrigger + Lenis：滚动叙事和惯性滚动
- Three.js：System 区域唯一的基础设施网络 WebGL 场景
- CSS Grid / `prefers-reduced-motion`：编辑型布局与可访问性
- WebGL 场景按进入视口延迟加载，避免拖慢首屏
