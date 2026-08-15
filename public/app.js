(() => {
  const data = window.NAV_DATA;
  const state = { query: "", filter: "all" };

  const filtersEl = document.getElementById("filters");
  const gridEl = document.getElementById("cardGrid");
  const searchEl = document.getElementById("searchInput");
  const clearEl = document.getElementById("clearButton");
  const visibleCountEl = document.getElementById("visibleCount");
  const totalCountEl = document.getElementById("totalCount");
  const emptyEl = document.getElementById("emptyState");
  const quickEl = document.getElementById("quickGrid");

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
    }
    document.querySelectorAll("i[data-lucide][data-glyph]").forEach((el) => {
      if (!el.querySelector("svg")) {
        el.textContent = el.dataset.glyph;
      }
    });
  }

  function renderQuick() {
    quickEl.innerHTML = data.quick
      .map((item) => {
        const glyph = String(item.title || "Q").charAt(0).toUpperCase();
        return `<a class="quick-btn" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer" style="--accent:${escapeHtml(item.color)};--accent-soft:${hexToRgba(item.color, 0.1)}">
          <i data-lucide="${escapeHtml(item.icon)}" data-glyph="${escapeHtml(glyph)}"></i>
          <span>${escapeHtml(item.title)}</span>
        </a>`;
      })
      .join("");
    refreshIcons();
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
    emptyEl.hidden = links.length > 0;

    if (!links.length) {
      gridEl.innerHTML = "";
      return;
    }

    gridEl.innerHTML = links
      .map((link) => {
        const tags = link.tags
          .map((tag) => `<span>${escapeHtml(tag)}</span>`)
          .join("");
        return `<a class="card" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer" style="--accent:${escapeHtml(link.color)};--accent-soft:${hexToRgba(link.color, 0.1)}">
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
    const timeFormatter = new Intl.DateTimeFormat("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Shanghai"
    });
    document.getElementById("clock").textContent = timeFormatter.format(now);
    document.getElementById("utcClock").textContent = now.toISOString().slice(11, 19);
  }

  async function loadProfile() {
    try {
      const response = await fetch(`https://api.github.com/users/${data.handle}`);
      if (!response.ok) return;
      const profile = await response.json();
      if (profile.public_repos !== undefined) {
        document.getElementById("repoCount").textContent = profile.public_repos;
        document.getElementById("profileRepos").textContent = profile.public_repos;
      }
      if (profile.followers !== undefined) {
        const padded = String(profile.followers).padStart(2, "0");
        document.getElementById("followersCount").textContent = padded;
        document.getElementById("profileFollowers").textContent = padded;
      }
      if (profile.avatar_url) {
        const avatar = document.querySelector(".avatar");
        if (avatar) avatar.src = profile.avatar_url;
      }
    } catch (error) {
      // 静态兜底数据已经渲染，API 失败时无需处理
    }
  }

  renderQuick();
  renderFilters();
  renderCards();
  updateClock();
  window.setInterval(updateClock, 1000);
  loadProfile();
})();
