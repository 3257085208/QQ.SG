import { publicData } from "./generated/publicData";

export type TimelineEntry = {
  year: string;
  label: string;
  title: string;
  detail: string;
  stat: string;
  location: string;
};

export type Work = {
  index: string;
  year: string;
  title: string;
  detail: string;
  meta: string;
  href: string;
  kind: "status" | "systems" | "notes";
  metrics: Array<{ label: string; value: string }>;
  records: WorkRecord[];
  footnote: string;
};

export type WorkRecord = {
  label: string;
  detail: string;
  meta: string;
  href?: string;
  excerpt?: string;
  commit?: { short: string; message: string; href: string };
};

export const timeline: TimelineEntry[] = [
  { year: "2025+", label: "PUBLIC CODE", title: "OPEN REPOSITORIES", detail: "公开仓库里留下了 Cloudflare 工具、状态页、脚本与小型服务的持续维护记录。", stat: "GITHUB / 38 PUBLIC REPOSITORIES", location: "3257085208 / PUBLIC" },
  { year: "2026.02", label: "BLOG SYSTEM", title: "WRITE THE ENGINE", detail: "一篇公开文章记录了从成熟博客工具回到自写系统的过程：更小、更贴合，也更容易继续改。", stat: "NIE.NET / 2026.02.07", location: "ARTICLE / PUBLIC" },
  { year: "2026.05", label: "NODEGET", title: "THEME / STATUSSHOW", detail: "NodeGet NIE Theme 把卡片、地图、圆环与深色模式放进同一个状态页前端，后端和核心数据逻辑保持不变。", stat: "NIE.NET / 2026.05.11", location: "PROJECT / PUBLIC" },
  { year: "NOW", label: "CURRENT INDEX", title: "BUILD / RUN / RECORD", detail: "这一页把公开代码、状态页与文章放在同一个入口；内容会继续变化，索引也会继续更新。", stat: "QQ.SG / PUBLIC INDEX", location: "UTC+8 / IN PROGRESS" }
];

export const selectedWorks: Work[] = [
  {
    index: "01",
    year: "2026",
    title: "STATUS\nSYSTEM",
    detail: "status.qq.sg 的公开快照：NodeGet 卡片视图、节点筛选与系统状态，现场数据随页面变化。",
    meta: "STATUS PAGE / NODEGET / PUBLIC",
    href: publicData.status.source,
    kind: "status",
    metrics: [{ label: "ONLINE / TOTAL", value: publicData.status.online }, { label: "NODES", value: publicData.status.total }, { label: "FILTERS", value: "06" }],
    records: publicData.status.nodes.map((node) => ({ label: node.label, detail: node.detail, meta: node.meta })),
    footnote: `STATUS.QQ.SG / SNAPSHOT ${publicData.status.snapshot}`
  },
  {
    index: "02",
    year: "2026",
    title: "OPEN\nSYSTEMS",
    detail: "公开仓库、真实描述与最新提交。这里的索引来自 GitHub 公开 API，而不是模拟终端。",
    meta: "CODE / REPOSITORIES / PUBLIC",
    href: publicData.github.profile.href,
    kind: "systems",
    metrics: [{ label: "PUBLIC REPOS", value: publicData.github.profile.publicRepos }, { label: "FOLLOWERS", value: publicData.github.profile.followers }, { label: "PROFILE", value: publicData.github.profile.login }],
    records: publicData.github.repositories.map((repo) => ({ label: repo.name, detail: repo.description, meta: `${repo.language} / ${repo.stars}★ / PUSHED ${repo.pushed}`, href: repo.href, commit: repo.latestCommit })),
    footnote: "GITHUB.COM / 3257085208 / PUBLIC API"
  },
  {
    index: "03",
    year: "ONGOING",
    title: "NOTES\nFROM EDGE",
    detail: "博客公开归档里的系统、域名与 NodeGet 笔记。文章标题、日期与摘要均来自公开页面。",
    meta: "WRITING / FIELD NOTES / NIE.NET",
    href: publicData.notes.source,
    kind: "notes",
    metrics: [{ label: "PUBLISHED", value: publicData.notes.published }, { label: "LATEST", value: publicData.notes.latest }, { label: "SOURCE", value: "NIE.NET" }],
    records: publicData.notes.entries.map((entry) => ({ label: entry.date, detail: entry.title, meta: entry.meta, excerpt: entry.excerpt, href: entry.href })),
    footnote: "NIEKAIXIANG.COM / PUBLIC ARCHIVE"
  }
];

export const capabilities = [
  { title: "INFRASTRUCTURE", items: "Linux / Virtualization / Networking / Cloud" },
  { title: "SOFTWARE", items: "Go / JavaScript / TypeScript / Automation" },
  { title: "OPERATIONS", items: "Docker / Git / SQLite / Cloudflare" }
];

export const statusSnapshot = publicData.status;

export const networkNodes = publicData.status.regions.map((region) => ({ label: region.label, value: region.value, role: "REGION" }));

export const networkSummary = {
  online: publicData.status.online,
  total: publicData.status.total,
  snapshot: publicData.status.snapshot,
  source: publicData.status.source
};
