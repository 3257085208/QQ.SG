# QQ.SG 信号导航

一个以“信号台 / 技术索引”为概念的创意导航页，聚合 QQ.SG Group 的公开服务、监控面板与开源项目。纯静态实现，无构建步骤，可直接部署到 Cloudflare Pages。

## 特性

- 深色信号台视觉，全屏网格纹理背景与扫描线动效
- 实时 GitHub 资料读取（失败时自动使用本地兜底数据）
- CST / UTC 双时钟与状态条
- 项目列表搜索、分类筛选与快捷入口
- 桌面 / 移动端自适应
- 支持 `prefers-reduced-motion` 减弱动画

## 本地运行

```bash
cd public
python3 -m http.server 8080
```

浏览器打开 `http://localhost:8080`。

## 部署到 Cloudflare Pages

1. 在 Cloudflare Dashboard 打开 **Workers & Pages**，点击 **Create**。
2. 选择 **Pages** 并连接 GitHub 仓库 `QQ.SG`。
3. 框架预设选择 **None**。
4. 构建命令留空。
5. 构建输出目录填写 `public`。
6. 点击 **Save and Deploy**。

## 自定义导航项

所有链接、分类和快捷入口都维护在 `public/links.js` 的 `NAV_DATA` 中，按同样的结构增删即可。

## 文件结构

```
public/
  index.html     页面入口
  styles.css     视觉与布局
  links.js       导航数据
  app.js         交互、搜索、GitHub 数据
  assets/        背景纹理与本地头像
  favicon.svg    站点图标
  _headers       Cloudflare Pages 响应头
```
