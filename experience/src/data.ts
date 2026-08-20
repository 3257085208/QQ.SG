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
  visual: "signal" | "archive" | "notes";
};

export const timeline: TimelineEntry[] = [
  { year: "2019", label: "ORIGIN", title: "FIRST SERVER", detail: "一台机器、一个公网 IP。先弄清楚请求从哪里来，再决定要把什么交给别人。", stat: "1 MACHINE / 1 PUBLIC IP", location: "HOME / UTC+8" },
  { year: "2021", label: "INFRASTRUCTURE", title: "NETWORKS / VIRTUALIZATION", detail: "容器、网络、监控和备份开始成为日常，而不是一次性的实验。", stat: "RUN / OBSERVE / REPEAT", location: "EDGE / PRIVATE" },
  { year: "2024", label: "PUBLIC SERVICES", title: "SERVICES IN THE WILD", detail: "一些工具离开本地，开始被不认识的人使用；稳定性第一次变成真正的设计约束。", stat: "PUBLIC / SELF-HOSTED", location: "MULTI-REGION" },
  { year: "2026", label: "CURRENTLY", title: "BUILD / RUN / RECORD", detail: "继续把基础设施、软件和写作放在同一个系统里，留下可以回看的痕迹。", stat: "OPEN / IN PROGRESS", location: "SHANGHAI / UTC+8" }
];

export const selectedWorks: Work[] = [
  {
    index: "01",
    year: "2026",
    title: "STATUS\nSYSTEM",
    detail: "节点、可用性与基础设施状态的实时索引。把复杂的运行状态压缩成一张可以快速读懂的地图。",
    meta: "WEB / INFRASTRUCTURE / LIVE",
    href: "https://status.qq.sg",
    visual: "signal"
  },
  {
    index: "02",
    year: "2025",
    title: "OPEN\nSYSTEMS",
    detail: "Cloudflare 工具、服务端实验与日常代码。公开、可复用，也允许它们继续被改造。",
    meta: "CODE / SYSTEMS / OPEN SOURCE",
    href: "https://github.com/3257085208",
    visual: "archive"
  },
  {
    index: "03",
    year: "ONGOING",
    title: "NOTES\nFROM EDGE",
    detail: "系统、路线、服务器笔记，以及那些只有真正运行过才会知道的细节。",
    meta: "WRITING / FIELD NOTES / NIE HIGAN",
    href: "https://www.niekaixiang.com",
    visual: "notes"
  }
];

export const capabilities = [
  { title: "INFRASTRUCTURE", items: "Linux / Virtualization / Networking / Cloud" },
  { title: "SOFTWARE", items: "Go / JavaScript / TypeScript / Automation" },
  { title: "TOOLS", items: "Docker / Git / SQLite / Cloudflare" }
];
