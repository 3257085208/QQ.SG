import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { networkNodes, networkSummary, selectedWorks, statusSnapshot, timeline } from "./data";
import { publicData } from "./generated/publicData";
import { mountScrollExperience } from "./engine/scroll";
import { InfrastructureField } from "./components/InfrastructureField";
import { WorkVisual } from "./components/WorkVisual";
import "./styles.css";

const MOBILE_QUERY = "(max-width: 820px), (max-height: 500px) and (orientation: landscape)";

function splitTitle(value: string) {
  return value.split("\n").map((line, index) => <span key={`${line}-${index}`}>{line}</span>);
}

const systemTree = ["agent/", "agent/src/", "agent/Cargo.toml", "docs/", "package.json", "README.md"];

const menuItems = [
  { id: "home", index: "00", label: "Intro", descriptor: "identity / field" },
  { id: "archive", index: "01", label: "Archive", descriptor: "public record" },
  { id: "work", index: "02", label: "Work", descriptor: "status / systems / notes" },
  { id: "system", index: "03", label: "System", descriptor: "live index" },
  { id: "contact", index: "04", label: "Contact", descriptor: "open channel" }
] as const;

function DesktopExperience() {
  return (
    <main className="desktop-experience">
      <section className="intro" id="home" aria-labelledby="intro-title">
        <div className="intro-stage">
          <div className="intro-identity">
            <div className="intro-topline mono"><span>00 / INTRO</span><span>PERSONAL INDEX / 2026</span></div>
            <h1 className="intro-name" id="intro-title"><span>NIE</span><span>KAIXIANG</span></h1>
            <div className="intro-bottomline mono"><span>QQ.SG / CHINA / UTC+8</span><span>SCROLL TO ENTER ↓</span></div>
          </div>
          <div className="intro-field" aria-hidden="true"><InfrastructureField /></div>
          <div className="intro-handoff mono"><span>PUBLIC TRACE / FIELD OPEN</span><span>01 / ARCHIVE ↓</span></div>
        </div>
      </section>

      <section className="archive section-dark" id="archive" aria-labelledby="archive-title">
        <div className="chapter-head mono"><span>01 / ARCHIVE</span><span>ORIGIN + HISTORY / PUBLIC TRACE</span></div>
        <div className="archive-intro grid-12">
          <div className="archive-index"><span className="mono">NKX / 01</span><strong>QQ.SG</strong><span className="mono">CHINA / UTC+8</span></div>
          <div className="archive-copy"><h2 id="archive-title">A record of what is built, run, and kept public.</h2><p>我关心一件事情：页面如何被送到屏幕，服务如何在没人盯着时继续工作。代码、状态页和文章，都是这套系统留下的记录。</p></div>
        </div>
        <div className="archive-stage" data-active="01">
          <div className="archive-stage__viewport">
            <div className="archive-stage__head mono"><span>ARCHIVE / LIVING RECORD</span><span className="archive-stage__current" aria-live="polite">01 / {timeline[0].label}</span></div>
            <div className="archive-stage__axis" aria-hidden="true"><i /></div>
            <div className="archive-deck">
              {timeline.map((entry, index) => <article className={`archive-card archive-card--${index + 1}`} data-archive-index={index} data-archive-label={`${entry.year} / ${entry.label}`} key={`${entry.year}-${entry.label}`}>
                <div className="archive-card__top mono"><span>{entry.year}</span><span>{entry.label}</span></div>
                {index === 2 && <div className="archive-card__image"><picture><source type="image/avif" srcSet="/assets/status-nodeget-dark-1600.avif" /><img src="/assets/status-nodeget-dark.png" width="1600" height="900" loading="lazy" decoding="async" alt="Dark NodeGet status page preview" /></picture></div>}
                <h3>{entry.title}</h3>
                <p>{entry.detail}</p>
                <div className="archive-card__foot mono"><span>{entry.stat}</span><span>{entry.location}</span></div>
              </article>)}
            </div>
            <div className="archive-stage__hint mono"><span>SCROLL / SELECT RECORD</span><span>TRACE PERSISTS → NEXT</span></div>
          </div>
        </div>
        <div className="archive-foot mono"><span>STATIC EVIDENCE / PUBLIC SOURCES</span><span>REFRESHED {networkSummary.snapshot}</span></div>
      </section>

      <section className="work section-paper" id="work" aria-labelledby="work-title">
        <div className="chapter-head mono"><span>02 / SELECTED WORK</span><span>THREE PUBLIC ENTRIES</span></div>
        <div className="work-intro grid-12"><span className="mono">THE SYSTEM BECOMES VISIBLE HERE</span><h2 id="work-title">Work is where the system becomes visible.</h2></div>
        <div className="work-sequence" data-active="01">
          <div className="work-sequence__layout">
            <div className="work-sequence__visual-column">
              <div className="work-sequence__index mono"><span>WORK / SEQUENCE</span><strong className="work-sequence__current" aria-live="polite">01 / STATUS SYSTEM</strong><span>03 PROJECTS</span></div>
              <div className="work-sequence__visual-stack">
                {selectedWorks.map((item) => <div className={`work-sequence__visual-item work-sequence__visual-item--${item.kind}`} data-work-visual={item.index} aria-hidden="true" key={item.index}><WorkVisual item={item} /></div>)}
              </div>
              <div className="work-sequence__handoff mono"><span>CONTENT HANDOFF</span><strong className="work-sequence__handoff-current">ROWS → README TREE</strong></div>
            </div>
            <div className="work-sequence__records">
              {selectedWorks.map((item) => <a className={`work-scene work-sequence__record work-sequence__record--${item.kind}`} data-work-index={item.index} data-work-label={`${item.index} / ${item.title.replace("\n", " ")}`} href={item.href} target="_blank" rel="noreferrer" key={item.index}>
                <div className="work-scene__head mono"><span>{item.index} / {item.meta}</span><span>{item.year} ↗</span></div>
                <div className="work-scene__body"><div className="work-copy"><h3>{splitTitle(item.title)}</h3><p>{item.detail}</p><span className="mono">{item.footnote}</span></div></div>
                <div className="work-scene__foot mono"><span>OPEN SOURCE / PUBLIC TRACE</span><span>VIEW ENTRY ↗</span></div>
              </a>)}
            </div>
          </div>
        </div>
      </section>

      <section className="current-system section-dark" id="system" aria-labelledby="system-title">
        <div className="chapter-head mono"><span>03 / CURRENT SYSTEM</span><span>STATUS SNAPSHOT / HTML SOURCE</span></div>
        <div className="current-system__intro grid-12"><span className="mono">LIVE INDEX / STATIC REFERENCE</span><h2 id="system-title">Keep the live system legible.</h2><p>这一章只留下当前状态的清晰读数：真实公开页面是来源，HTML 文本负责让它可读，图形只做辅助。</p></div>
        <div className="current-system__grid">
          <div className="current-system__online">
            <span className="mono">ONLINE / TOTAL</span>
            <strong>{networkSummary.online}</strong>
            <span className="mono">{networkSummary.total} NODES / SNAPSHOT {networkSummary.snapshot}</span>
            <a className="system-source mono" href={networkSummary.source} target="_blank" rel="noreferrer">OPEN STATUS.QQ.SG <span>↗</span></a>
          </div>
          <div className="current-system__regions">
            <div className="current-system__subhead mono"><span>REGION DISTRIBUTION</span><span>OBSERVED / {networkNodes.length}</span></div>
            {networkNodes.map((node) => <div className="region-row" key={node.label}><span className="mono">{node.label}</span><div className="region-bar"><i style={{ width: `${Math.min(100, Number(node.value) * 7)}%` }} /></div><strong>{node.value}</strong></div>)}
          </div>
        </div>
        <div className="observed-nodes">
          <div className="current-system__subhead mono"><span>OBSERVED NODES</span><span>PUBLIC PAGE TEXT</span></div>
          <div className="observed-nodes__list">{statusSnapshot.nodes.map((node) => <div className="observed-node" key={node.label}><strong>{node.label}</strong><span>{node.detail}</span><em className="mono">{node.meta}</em></div>)}</div>
        </div>
      </section>

      <section className="contact-release section-paper" id="contact" aria-labelledby="contact-title">
        <div className="chapter-head mono"><span>04 / CONTACT</span><span>OPEN CHANNEL / QUIET RELEASE</span></div>
        <div className="contact-release__grid grid-12">
          <div className="contact-release__identity"><span className="mono">THE INDEX IS OPEN</span><h2 id="contact-title">NIE<br />KAIXIANG</h2></div>
          <div className="contact-release__links"><a href="https://github.com/3257085208" target="_blank" rel="noreferrer"><span className="mono">GITHUB</span><strong>3257085208</strong><span>↗</span></a><a href="https://www.niekaixiang.com" target="_blank" rel="noreferrer"><span className="mono">WEB</span><strong>NIEKAIXIANG.COM</strong><span>↗</span></a><a href="https://status.qq.sg" target="_blank" rel="noreferrer"><span className="mono">STATUS</span><strong>STATUS.QQ.SG</strong><span>↗</span></a></div>
        </div>
        <div className="contact-release__foot mono"><span>QQ.SG / PERSONAL INDEX</span><span>2026 / UTC+8</span></div>
      </section>
    </main>
  );
}

function MobileExperience() {
  const mobileRootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = mobileRootRef.current;
    if (!root) return;

    const intro = root.querySelector<HTMLElement>(".mobile-intro");
    const featureTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-mobile-reveal="archive-feature"]'));
    const reveal = () => featureTargets.forEach((target) => target.classList.add("is-visible"));
    const introFrame = window.requestAnimationFrame(() => intro?.classList.add("is-ready"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") {
      reveal();
      return () => window.cancelAnimationFrame(introFrame);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -8%" });

    featureTargets.forEach((target) => observer.observe(target));
    return () => {
      window.cancelAnimationFrame(introFrame);
      observer.disconnect();
    };
  }, []);

  return (
    <main className="mobile-experience" ref={mobileRootRef}>
      <section className="mobile-intro" id="home" aria-labelledby="mobile-intro-title">
        <div className="mobile-intro__top">
          <span className="mono" data-mobile-hero-meta>QQ.SG / 00</span>
          <span className="mono" data-mobile-hero-meta>IDENTITY / 2026</span>
        </div>
        <h1 className="mobile-intro__name" id="mobile-intro-title">
          <span className="mobile-intro__name-art">NIE</span>
          <span className="mobile-intro__name-sans">KAIXIANG</span>
        </h1>
        <div className="mobile-intro__bottom">
          <span className="mono" data-mobile-hero-meta>CHINA / UTC+8</span>
          <span className="mobile-intro__handoff mono">01 / ARCHIVE <b aria-hidden="true">↓</b></span>
        </div>
      </section>

      <section className="mobile-archive" id="archive" aria-labelledby="mobile-archive-title">
        <div className="mobile-chapter"><span>01 / ARCHIVE</span></div>
        <div className="mobile-archive__intro"><h2 id="mobile-archive-title">Built, run, kept public.</h2><p>代码、状态页和文章，组成一份持续更新的个人档案。</p></div>
        <div className="mobile-archive__stream">
          {timeline.map((entry, index) => <article className={`mobile-archive__entry mobile-archive__entry--${index + 1}`} data-mobile-reveal={index === 2 ? "archive-feature" : undefined} key={`${entry.year}-${entry.label}`}>
            <div className="mobile-archive__meta"><span>{entry.year}</span><span>{entry.label}</span></div>
            {index === 2 && <figure className="mobile-archive__media"><button className="mobile-archive__trigger" data-touch-visual="archive" data-inspect-target="archive" type="button" aria-pressed="false" aria-label="Inspect NodeGet archive image"><img src="/assets/status-nodeget-dark-mobile.png" width="840" height="1440" loading="lazy" decoding="async" alt="Dark NodeGet status page detail" /></button><figcaption><span>NODEGET / ARCHIVE TRACE</span><em>2026.05 / STATUS UI</em></figcaption></figure>}
            <h3>{entry.title}</h3>
            <p>{entry.detail}</p>
            <span className="mobile-archive__source">{entry.stat}</span>
          </article>)}
        </div>
      </section>

      <section className="mobile-work" id="work" aria-label="Selected work">
        <div className="mobile-chapter"><span>02 / WORK</span></div>

        <article className="mobile-project mobile-project--status">
          <div className="mobile-project__meta"><span>01 / 2026</span><span>LIVE SYSTEM</span></div>
          <h3>STATUS<br />SYSTEM</h3>
          <div className="mobile-status__metric"><strong>{statusSnapshot.online} / {statusSnapshot.total}</strong><span>ONLINE</span></div>
          <figure className="mobile-status__media">
            <button className="mobile-status__trigger" data-touch-visual="status" data-inspect-target="status" type="button" aria-pressed="false" aria-label="Inspect status screenshot">
              <div className="mobile-status__image"><img src="/assets/status-nodeget-mobile.png" width="840" height="1440" loading="lazy" decoding="async" alt="NodeGet status page card view detail" /></div>
            </button>
            <figcaption className="mono"><span>NODEGET / CARD VIEW</span><em>STATUS.QQ.SG / NODEGET / LIVE SYSTEM / {statusSnapshot.online} ONLINE</em><b className="mobile-status__state" aria-hidden="true"><span>INSPECT +</span><span>INSPECTING ×</span></b></figcaption>
          </figure>
          <a className="mobile-project__link" data-touch-row="link" href={statusSnapshot.source} target="_blank" rel="noreferrer">STATUS.QQ.SG <span>↗</span></a>
        </article>

        <article className="mobile-project mobile-project--systems">
          <div className="mobile-project__meta"><span>02 / OPEN SYSTEMS</span><span>STRUCTURE</span></div>
          <h3>OPEN<br />SYSTEMS</h3>
          <div className="mobile-system__intro"><strong>NIE-SLA</strong><span>WORKER / D1 / R2 / DURABLE OBJECTS / RUST AGENT</span></div>
          <div className="mobile-system__tree">
            <div className="mobile-system__tree-head"><span className="mobile-system__label">README.md / SOURCE TREE</span><span className="mobile-system__tree-status">PUBLIC</span></div>
            <div className="mobile-system__rows">
              {systemTree.map((path, index) => <button className="mobile-system__row" data-touch-row="system" type="button" aria-pressed="false" key={path}><span>{path}</span><small>{index === 0 ? "ROOT" : "SOURCE"}</small></button>)}
            </div>
          </div>
          <div className="mobile-system__commit"><span>e846a7a</span><p>release: publish v1.1.16 source [skip ci]</p></div>
          <a className="mobile-project__link" data-touch-row="link" href="https://github.com/3257085208/NIE-SLA" target="_blank" rel="noreferrer">GITHUB / NIE-SLA <span>↗</span></a>
        </article>

        <article className="mobile-project mobile-project--notes">
          <div className="mobile-project__meta"><span>03 / NOTES</span><span>READING INDEX</span></div>
          <h3>NOTES</h3>
          <p className="mobile-notes__intro">公开归档 / 03 entries</p>
          <ol className="mobile-notes__list">
            {publicData.notes.entries.map((entry, index) => <li key={entry.date}><a className="mobile-note__link" data-touch-row="note" href={entry.href} target="_blank" rel="noreferrer"><div className="mobile-note__head"><span>{String(index + 1).padStart(2, "0")}</span><time>{entry.date}</time><b aria-hidden="true">↗</b></div><strong>{entry.title}</strong><p>{entry.excerpt}</p><small>{entry.meta}</small></a></li>)}
          </ol>
          <a className="mobile-project__link" data-touch-row="link" href="https://www.niekaixiang.com" target="_blank" rel="noreferrer">NIEKAIXIANG.COM <span>↗</span></a>
        </article>
      </section>

      <section className="mobile-current" id="system" aria-label="Current system">
        <div className="mobile-chapter"><span>03 / CURRENT</span></div>
        <div className="mobile-current__body">
          <div className="mobile-current__head"><span className="mono">CURRENT / {networkSummary.snapshot}</span><a className="mobile-current__link" data-touch-row="link" href={networkSummary.source} target="_blank" rel="noreferrer">LIVE STATUS <span>↗</span></a></div>
          <div className="mobile-current__online"><strong>{networkSummary.online} / {networkSummary.total}</strong><span>ONLINE</span></div>
          <div className="mobile-current__regions">{networkNodes.map((node) => <span key={node.label}>{node.label} <strong>{node.value}</strong></span>)}</div>
        </div>
      </section>

      <section className="mobile-contact" id="contact" aria-labelledby="mobile-contact-title">
        <div className="mobile-chapter"><span>04 / CONTACT</span></div>
        <h2 id="mobile-contact-title">NIE KAIXIANG</h2>
        <nav className="mobile-contact__links" aria-label="Contact links"><a data-touch-row="link" href="https://github.com/3257085208" target="_blank" rel="noreferrer"><span>GITHUB</span><strong>3257085208</strong><b>↗</b></a><a data-touch-row="link" href="https://www.niekaixiang.com" target="_blank" rel="noreferrer"><span>WEB</span><strong>NIEKAIXIANG.COM</strong><b>↗</b></a><a data-touch-row="link" href="https://status.qq.sg" target="_blank" rel="noreferrer"><span>STATUS</span><strong>STATUS.QQ.SG</strong><b>↗</b></a></nav>
        <div className="mobile-contact__foot"><span className="mono">QQ.SG</span><span className="mono">2026 / UTC+8</span></div>
      </section>
    </main>
  );
}

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuFirstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasMenuOpen = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!rootRef.current || isMobile) return;
    return mountScrollExperience(rootRef.current);
  }, [isMobile]);

  useEffect(() => {
    if (!rootRef.current || !isMobile) return;
    const root = rootRef.current;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    import("./engine/mobileMotion").then(({ mountMobileExperience }) => {
      if (cancelled) return;
      cleanup = mountMobileExperience(root);
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".desktop-experience > section[id]"));
    if (!sections.length) return;

    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      const marker = window.innerHeight * .38;
      let current = sections[0].id;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) current = section.id;
      });
      setActiveSection((value) => value === current ? value : current);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!menuOpen) {
      if (wasMenuOpen.current) menuButtonRef.current?.focus();
      return;
    }

    wasMenuOpen.current = true;
    const previousOverflow = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => menuFirstLinkRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      if (isMobile) document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell" ref={rootRef}>
      <header className="site-header">
        <a className="site-mark" href="#home" onClick={closeMenu}>NKX<sup>®</sup></a>
        <span className="site-status">PERSONAL INDEX / 2026</span>
        <div className="site-actions">
          <a href="#work" className="header-link">WORK / INDEX <span>↘</span></a>
          <button ref={menuButtonRef} className={`menu-button ${menuOpen ? "is-open" : ""}`} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen((value) => !value)}><i /><i /></button>
        </div>
      </header>

      <aside className={`site-menu ${menuOpen ? "is-open" : ""}`} id="site-menu" aria-hidden={!menuOpen}>
        <div className="site-menu__head">
          <div>
            <span className="mono">INDEX / NAVIGATION</span>
            <span className="site-menu__current mono">CURRENT / {menuItems.find((item) => item.id === activeSection)?.index ?? "00"} / {menuItems.find((item) => item.id === activeSection)?.label.toUpperCase() ?? "INTRO"}</span>
          </div>
          <button className="site-menu__close" type="button" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>CLOSE <span aria-hidden="true">×</span></button>
        </div>
        <nav>
          {menuItems.map((item, index) => <a className={activeSection === item.id ? "is-active" : undefined} ref={index === 0 ? menuFirstLinkRef : undefined} data-section={item.id} href={`#${item.id}`} aria-current={activeSection === item.id ? "page" : undefined} tabIndex={menuOpen ? 0 : -1} onClick={closeMenu} key={item.id}>
            <span className="site-menu__index mono">{item.index} /</span>
            <span className="site-menu__label">{item.label}</span>
            <span className="site-menu__descriptor">{item.descriptor}</span>
            <span className="site-menu__marker" aria-hidden="true" />
          </a>)}
        </nav>
        <div className="site-menu__foot mono"><span>QQ.SG / PERSONAL INDEX</span><span>2026 / UTC+8</span></div>
      </aside>

      {isMobile ? <MobileExperience /> : <DesktopExperience />}

      <footer className="site-footer mono"><span>NIE KAIXIANG / QQ.SG</span><span>PUBLIC TRACE / 2026</span></footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
