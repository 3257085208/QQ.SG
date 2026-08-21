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
        <div className="archive-deck">
          {timeline.map((entry, index) => <article className={`archive-card archive-card--${index + 1}`} key={`${entry.year}-${entry.label}`}>
            <div className="archive-card__top mono"><span>{entry.year}</span><span>{entry.label}</span></div>
            {index === 2 && <div className="archive-card__image"><img src="/assets/status-nodeget-dark.png" width="2560" height="1440" loading="lazy" decoding="async" alt="Dark NodeGet status page preview" /></div>}
            <h3>{entry.title}</h3>
            <p>{entry.detail}</p>
            <div className="archive-card__foot mono"><span>{entry.stat}</span><span>{entry.location}</span></div>
          </article>)}
        </div>
        <div className="archive-foot mono"><span>STATIC EVIDENCE / PUBLIC SOURCES</span><span>REFRESHED {networkSummary.snapshot}</span></div>
      </section>

      <section className="work section-paper" id="work" aria-labelledby="work-title">
        <div className="chapter-head mono"><span>02 / SELECTED WORK</span><span>THREE PUBLIC ENTRIES</span></div>
        <div className="work-intro grid-12"><span className="mono">THE SYSTEM BECOMES VISIBLE HERE</span><h2 id="work-title">Work is where the system becomes visible.</h2></div>
        <div className="work-list">
          {selectedWorks.map((item) => <a className={`work-scene work-scene--${item.kind}`} data-work-label={`${item.index} / ${item.title.replace("\n", " ")}`} href={item.href} target="_blank" rel="noreferrer" key={item.index}>
            <div className="work-scene__head mono"><span>{item.index} / {item.meta}</span><span>{item.year} ↗</span></div>
            <div className="work-scene__body">
              <div className="work-copy"><h3>{splitTitle(item.title)}</h3><p>{item.detail}</p><span className="mono">{item.footnote}</span></div>
              <WorkVisual item={item} />
            </div>
            <div className="work-scene__foot mono"><span>OPEN SOURCE / PUBLIC TRACE</span><span>VIEW ENTRY ↗</span></div>
          </a>)}
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
  const mobileNodes = [statusSnapshot.nodes[0], statusSnapshot.nodes[3]];

  return (
    <main className="mobile-experience">
      <section className="mobile-intro" id="home" aria-labelledby="mobile-intro-title">
        <div className="mobile-intro__top"><span className="mono">QQ.SG</span><span className="mono">2026</span></div>
        <h1 className="mobile-intro__name" id="mobile-intro-title"><span>NIE</span><span>KAI</span><span>XIANG</span></h1>
        <div className="mobile-intro__bottom"><span className="mono">PUBLIC INDEX</span><span className="mono">↓</span></div>
      </section>

      <section className="mobile-archive" id="archive" aria-labelledby="mobile-archive-title">
        <div className="mobile-chapter"><span>01 / ARCHIVE</span><span>PUBLIC TRACE</span></div>
        <div className="mobile-archive__intro"><h2 id="mobile-archive-title">Built, run, kept public.</h2><p>代码、状态页和文章，组成一份持续更新的个人档案。</p></div>
        <div className="mobile-archive__stream">
          {timeline.map((entry, index) => <article className={`mobile-archive__entry mobile-archive__entry--${index + 1}`} key={`${entry.year}-${entry.label}`}>
            <div className="mobile-archive__meta"><span>{entry.year}</span><span>{entry.label}</span></div>
            {index === 2 && <figure className="mobile-archive__media"><img src="/assets/status-nodeget-dark-mobile.png" width="840" height="1440" loading="lazy" decoding="async" alt="Dark NodeGet status page detail" /></figure>}
            <h3>{entry.title}</h3>
            <p>{entry.detail}</p>
            <span className="mobile-archive__source">{entry.stat}</span>
          </article>)}
        </div>
      </section>

      <section className="mobile-work" id="work" aria-labelledby="mobile-work-title">
        <div className="mobile-chapter"><span>02 / WORK</span><span>PUBLIC PROJECTS</span></div>
        <h2 className="mobile-work__title" id="mobile-work-title">Selected work.</h2>

        <article className="mobile-project mobile-project--status">
          <div className="mobile-project__meta"><span>01</span><span>2026</span></div>
          <h3>STATUS<br />SYSTEM</h3>
          <div className="mobile-status__metric"><strong>{statusSnapshot.online}</strong><span>ONLINE / TOTAL</span></div>
          <figure className="mobile-status__media">
            <img src="/assets/status-nodeget-mobile.png" width="840" height="1440" loading="lazy" decoding="async" alt="NodeGet status page card view detail" />
            <figcaption className="mono">NODEGET / CARD VIEW</figcaption>
          </figure>
          <a className="mobile-project__link" href={statusSnapshot.source} target="_blank" rel="noreferrer">STATUS.QQ.SG <span>↗</span></a>
        </article>

        <article className="mobile-project mobile-project--systems">
          <div className="mobile-project__meta"><span>02</span><span>OPEN SYSTEMS</span></div>
          <h3>OPEN<br />SYSTEMS</h3>
          <div className="mobile-system__intro"><strong>NIE-SLA</strong><p>Cloudflare-native status page and VPS telemetry platform.</p><span>WORKER STATIC ASSETS + D1 + R2 + DURABLE OBJECTS + RUST AGENT</span></div>
          <div className="mobile-system__tree"><span className="mobile-system__label">README.md / SOURCE TREE</span><pre>{"agent/\nagent/src/\nagent/Cargo.toml\ndocs/\npackage.json\nREADME.md"}</pre></div>
          <div className="mobile-system__commit"><span>e846a7a</span><p>release: publish v1.1.16 source [skip ci]</p></div>
          <a className="mobile-project__link" href="https://github.com/3257085208/NIE-SLA" target="_blank" rel="noreferrer">GITHUB / NIE-SLA <span>↗</span></a>
        </article>

        <article className="mobile-project mobile-project--notes">
          <div className="mobile-project__meta"><span>03</span><span>ARTICLE INDEX</span></div>
          <h3>NOTES<br />FROM EDGE</h3>
          <p className="mobile-notes__intro">博客公开归档里的系统、域名与 NodeGet 笔记。</p>
          <ol className="mobile-notes__list">
            {publicData.notes.entries.map((entry) => <li key={entry.date}><span>{entry.date}</span><strong>{entry.title}</strong><p>{entry.excerpt}</p><small>{entry.meta}</small></li>)}
          </ol>
          <a className="mobile-project__link" href="https://www.niekaixiang.com" target="_blank" rel="noreferrer">NIEKAIXIANG.COM <span>↗</span></a>
        </article>
      </section>

      <section className="mobile-current" id="system" aria-labelledby="mobile-current-title">
        <div className="mobile-chapter"><span>03 / CURRENT</span><span>LIVE INDEX</span></div>
        <div className="mobile-current__headline"><h2 id="mobile-current-title">Current system.</h2><strong>{networkSummary.online}</strong><span>ONLINE / TOTAL</span></div>
        <div className="mobile-current__regions">{networkNodes.map((node) => <div key={node.label}><span>{node.label}</span><strong>{node.value}</strong></div>)}</div>
        <div className="mobile-current__observed"><span className="mobile-system__label">TWO OBSERVED NODES</span>{mobileNodes.map((node) => <div key={node.label}><strong>{node.label}</strong><span>{node.meta.replace("上海电信 ", "")}</span></div>)}</div>
        <a className="mobile-project__link" href={networkSummary.source} target="_blank" rel="noreferrer">VIEW ALL LIVE NODES <span>↗</span></a>
      </section>

      <section className="mobile-contact" id="contact" aria-labelledby="mobile-contact-title">
        <div className="mobile-chapter"><span>04 / CONTACT</span><span>OPEN CHANNEL</span></div>
        <h2 id="mobile-contact-title">NIE KAIXIANG</h2>
        <nav className="mobile-contact__links" aria-label="Contact links"><a href="https://github.com/3257085208" target="_blank" rel="noreferrer"><span>GITHUB</span><strong>3257085208</strong><b>↗</b></a><a href="https://www.niekaixiang.com" target="_blank" rel="noreferrer"><span>WEB</span><strong>NIEKAIXIANG.COM</strong><b>↗</b></a><a href="https://status.qq.sg" target="_blank" rel="noreferrer"><span>STATUS</span><strong>STATUS.QQ.SG</strong><b>↗</b></a></nav>
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
        <span className="mono">INDEX / NAVIGATION</span>
        <nav>
          <a ref={menuFirstLinkRef} href="#home" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Intro</a>
          <a href="#archive" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Archive</a>
          <a href="#work" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Work</a>
          <a href="#system" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>System</a>
          <a href="#contact" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Contact</a>
        </nav>
      </aside>

      {isMobile ? <MobileExperience /> : <DesktopExperience />}

      <footer className="site-footer mono"><span>NIE KAIXIANG / QQ.SG</span><span>PUBLIC TRACE / 2026</span></footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
