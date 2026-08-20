export type TimelineEntry = {
  year: string;
  title: string;
  detail: string;
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
  { year: "2019", title: "FIRST SERVER", detail: "A small machine, a public IP, and the beginning of a habit." },
  { year: "2021", title: "BUILDING INFRASTRUCTURE", detail: "Networks, containers, monitoring, and systems that stay quiet." },
  { year: "2024", title: "SERVICES IN THE WILD", detail: "Tools used by people outside the room where they were made." },
  { year: "2026", title: "WHAT'S NEXT?", detail: "More useful things, with less noise around them." }
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
