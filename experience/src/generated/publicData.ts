export const publicData = {
  verifiedAt: "2026-08-21",
  github: {
    profile: {
      name: "DaFuHao",
      login: "3257085208",
      bio: "Chairman of QQ.SG Group",
      publicRepos: "38",
      followers: "4",
      href: "https://github.com/3257085208"
    },
    repositories: [
      {
        name: "NIE-SLA",
        description: "Cloudflare-native status page and VPS telemetry platform with a Rust Agent, D1, R2, Pages and Telegram alerts.",
        language: "JavaScript",
        stars: "0",
        pushed: "2026.08.20",
        href: "https://github.com/3257085208/NIE-SLA",
        readme: {
          title: "NIE-SLA",
          subtitle: "运行在 Cloudflare 上的状态页与 VPS 探针",
          stack: "Worker Static Assets + D1 + R2 + Durable Objects + Rust Agent",
          excerpt: "NIE-SLA 把 Cloudflare 的公网探测、公开状态页和 VPS 系统数据放在一起。"
        },
        tree: ["agent/", "agent/src/", "agent/Cargo.toml", "docs/", "package.json", "README.md"],
        latestCommit: {
          short: "e846a7a",
          message: "release: publish v1.1.16 source [skip ci]",
          href: "https://github.com/3257085208/NIE-SLA/commit/e846a7a85da3622c8d9af89b53f587648bdca667"
        }
      },
      {
        name: "NIE-Theme-NodeGet",
        description: "React + Tailwind CSS 前端主题，包含卡片、表格、3D 节点分布地图与资源监控。",
        language: "TypeScript",
        stars: "13",
        pushed: "2026.06.06",
        href: "https://github.com/3257085208/NIE-Theme-NodeGet",
        latestCommit: {
          short: "384f39a",
          message: "fetch full latency history for grids",
          href: "https://github.com/3257085208/NIE-Theme-NodeGet/commit/384f39a4619df1d5bd9a1c972f6dc4a87e8d7eb5"
        }
      },
      {
        name: "NodeWarden",
        description: "运行在 Cloudflare Workers 上的 Bitwarden 第三方服务端。",
        language: "TypeScript",
        stars: "0",
        pushed: "2026.07.01",
        href: "https://github.com/3257085208/NodeWarden",
        latestCommit: {
          short: "73bbe8b",
          message: "perf: throttle jsQR camera fallback to a few decodes per second",
          href: "https://github.com/3257085208/NodeWarden/commit/73bbe8b26873e598aa829d6bbbff5015470dd6fb"
        }
      },
      {
        name: "NIE-Higan-Blog",
        description: "一套可以直接部署的轻量静态博客引擎。",
        language: "Python",
        stars: "18",
        pushed: "2026.07.23",
        href: "https://github.com/3257085208/NIE-Higan-Blog",
        latestCommit: {
          short: "da5444b",
          message: "restore pre-hardening palette and float button layout",
          href: "https://github.com/3257085208/NIE-Higan-Blog/commit/da5444b493845f2d1a3ba51d35b25e58de36ad19"
        }
      }
    ]
  },
  status: {
    name: "NKX的针针",
    source: "https://status.qq.sg",
    snapshot: "2026.08.21",
    online: "15 / 26",
    total: "26",
    regions: [
      { label: "HK", value: "11" },
      { label: "US", value: "9" },
      { label: "DE", value: "2" },
      { label: "JP", value: "2" },
      { label: "CN", value: "1" },
      { label: "SG", value: "1" }
    ],
    nodes: [
      { label: "阿里云200G CDT", detail: "Linux (Alpine Linux 3.23.4) · QEMU+KVM", meta: "上海电信 27ms / 1 秒前" },
      { label: "华为云", detail: "Linux (Debian GNU/Linux 12) · QEMU+KVM", meta: "上海电信 339ms / 2 秒前" },
      { label: "BandwagonHost MegaBox", detail: "Linux (Debian GNU/Linux 12) · QEMU+KVM", meta: "TCPING — / 100%" },
      { label: "CloudCone LAX 7.77", detail: "Linux (Debian GNU/Linux 12) · QEMU+KVM", meta: "上海电信 154ms / 1 秒前" }
    ]
  },
  notes: {
    source: "https://www.niekaixiang.com",
    published: "36",
    latest: "2026.06.24",
    entries: [
      {
        date: "2026.02.07",
        title: "我最后还是自己写了这个博客系统",
        meta: "BLOG / STATIC SITE / HEXO / WORDPRESS / HALO",
        excerpt: "从成熟工具出发，最后回到一个更贴合自己写作习惯的小系统。",
        href: "https://www.niekaixiang.com/p/20260207-02/"
      },
      {
        date: "2026.02.08",
        title: "niekaixiang.com：现在它和聶.NET一样，都是我的博客域名",
        meta: "DOMAIN / BLOG / FIELD NOTE",
        excerpt: "一个新域名开始承担博客入口，而不只是账户里的一串字符。",
        href: "https://www.niekaixiang.com/p/20260208-02/"
      },
      {
        date: "2026.05.11",
        title: "NodeGet NIE Theme：基于 NodeGet StatusShow 的前端主题修改版",
        meta: "NODEGET / STATUS / THEME",
        excerpt: "基于 StatusShow 调整前端，保留后端与核心数据逻辑。",
        href: "https://www.niekaixiang.com/p/20260511-01/"
      }
    ]
  }
} as const;
