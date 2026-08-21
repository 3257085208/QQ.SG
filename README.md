# QQ.SG / PERSONAL SYSTEM

一个面向个人品牌的编辑型主页：分章节的滚动叙事、真实公开项目材料、状态页截图与移动端独立布局。

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
- GSAP ScrollTrigger + Lenis：Intro 交接、章节进入与惯性滚动
- 真实公开数据快照：GitHub、status.qq.sg、NIE.NET 的可读 HTML 内容
- 公共项目截图素材：Status System 以 NodeGet 的真实 README 预览作为主视觉
- CSS Grid / `prefers-reduced-motion`：编辑型布局与可访问性
