(() => {
  const data = window.NAV_DATA;
  const state = { query: "", filter: "all" };

  const filtersEl = document.getElementById("filters");
  const gridEl = document.getElementById("cardGrid");
  const searchEl = document.getElementById("searchInput");
  const clearEl = document.getElementById("clearButton");
  const visibleCountEl = document.getElementById("visibleCount");
  const totalCountEl = document.getElementById("totalCount");

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const hexToRgba = (hex, alpha) => {
    const value = hex.replace("#", "");
    const bigint = parseInt(value, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
      return;
    }
    document.querySelectorAll("i[data-lucide][data-glyph]").forEach((el) => {
      el.textContent = el.dataset.glyph;
    });
  }

  function renderFilters() {
    filtersEl.innerHTML = data.categories
      .map((category) => {
        const active = state.filter === category.id;
        return `<button class="filter-btn${active ? " active" : ""}" data-filter="${escapeHtml(category.id)}" role="tab" aria-selected="${active}">${escapeHtml(category.label)}</button>`;
      })
      .join("");

    filtersEl.querySelectorAll(".filter-btn").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter;
        renderFilters();
        renderCards();
      });
    });
  }

  function filteredLinks() {
    const query = state.query.trim().toLowerCase();
    return data.links.filter((link) => {
      const inCategory = state.filter === "all" || link.groups.includes(state.filter);
      if (!inCategory) return false;
      if (!query) return true;
      const haystack = `${link.title} ${link.desc} ${link.tags.join(" ")} ${link.url}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  function renderCards() {
    const links = filteredLinks();
    totalCountEl.textContent = data.links.length;
    visibleCountEl.textContent = links.length;

    if (!links.length) {
      gridEl.innerHTML = `<div class="empty-state">NO SIGNAL // 没有找到匹配项</div>`;
      refreshIcons();
      return;
    }

    gridEl.innerHTML = links
      .map((link) => {
        const tags = link.tags
          .map((tag) => `<span>${escapeHtml(tag)}</span>`)
          .join("");
        return `<a class="card" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer" style="--accent:${escapeHtml(link.color)};--accent-soft:${hexToRgba(link.color, 0.12)}">
          <span class="card-icon"><i data-lucide="${escapeHtml(link.icon)}" data-glyph="${escapeHtml(link.glyph)}"></i></span>
          <span class="card-copy">
            <strong>${escapeHtml(link.title)}</strong>
            <p>${escapeHtml(link.desc)}</p>
            <span class="card-tags">${tags}</span>
          </span>
          <span class="card-arrow"><i data-lucide="arrow-up-right" data-glyph="->"></i></span>
        </a>`;
      })
      .join("");

    refreshIcons();
  }

  searchEl.addEventListener("input", () => {
    state.query = searchEl.value;
    clearEl.hidden = !searchEl.value;
    renderCards();
  });

  clearEl.addEventListener("click", () => {
    searchEl.value = "";
    state.query = "";
    clearEl.hidden = true;
    renderCards();
    searchEl.focus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== searchEl) {
      event.preventDefault();
      searchEl.focus();
    }
    if (event.key === "Escape" && document.activeElement === searchEl) {
      searchEl.blur();
    }
  });

  function updateClock() {
    const now = new Date();
    const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Shanghai"
    });
    document.getElementById("clock").textContent = `CST ${timeFormatter.format(now)}`;
    document.getElementById("utcClock").textContent = now.toISOString().slice(11, 19);
  }

  async function loadProfile() {
    try {
      const response = await fetch(`https://api.github.com/users/${data.handle}`);
      if (!response.ok) return;
      const profile = await response.json();
      if (profile.public_repos) {
        document.getElementById("repoCount").textContent = profile.public_repos;
      }
      if (profile.followers !== undefined) {
        document.getElementById("followersCount").textContent = String(profile.followers).padStart(2, "0");
      }
      if (profile.avatar_url) {
        const avatar = document.querySelector(".avatar");
        if (avatar) avatar.src = profile.avatar_url;
      }
    } catch (error) {
      // 静态兜底数据已经渲染，API 失败时无需处理
    }
  }

  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [];
  let constellation = [];

  function buildField() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const count = Math.min(170, Math.floor((width * height) / 11000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.35 + 0.35,
      speed: Math.random() * 1.6 + 0.3,
      phase: Math.random() * Math.PI * 2,
      tint: ["#201b16", "#0e7c86", "#c62f3e", "#d88a24", "#5f4b8b"][Math.floor(Math.random() * 5)]
    }));
    constellation = [
      { x: width * 0.1, y: height * 0.16 },
      { x: width * 0.24, y: height * 0.12 },
      { x: width * 0.18, y: height * 0.34 },
      { x: width * 0.82, y: height * 0.18 },
      { x: width * 0.9, y: height * 0.42 },
      { x: width * 0.72, y: height * 0.5 }
    ];
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildField();
  }

  function drawField(time) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.strokeStyle = "rgba(32, 27, 22, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < constellation.length - 1; i += 1) {
      ctx.moveTo(constellation[i].x, constellation[i].y);
      ctx.lineTo(constellation[i + 1].x, constellation[i + 1].y);
    }
    ctx.stroke();
    ctx.restore();

    for (const star of stars) {
      const pulse = reducedMotion ? 0.8 : Math.sin(time * 0.001 * star.speed + star.phase) * 0.45 + 0.55;
      ctx.globalAlpha = 0.35 + pulse * 0.45;
      ctx.fillStyle = star.tint;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!reducedMotion) {
      requestAnimationFrame(drawField);
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  drawField(reducedMotion ? 0 : performance.now());

  renderFilters();
  renderCards();
  updateClock();
  window.setInterval(updateClock, 1000);
  loadProfile();
})();
