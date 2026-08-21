import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { networkNodes, networkSummary, selectedWorks, statusSnapshot, timeline } from "./data";
import { mountScrollExperience } from "./engine/scroll";
import { InfrastructureField } from "./components/InfrastructureField";
import { WorkVisual } from "./components/WorkVisual";
import "./styles.css";

function splitTitle(value: string) {
  return value.split("\n").map((line, index) => <span key={`${line}-${index}`}>{line}</span>);
}

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!rootRef.current) return;
    return mountScrollExperience(rootRef.current);
  }, []);

  return (
    <div className="site-shell" ref={rootRef}>
      <header className="site-header">
        <a className="site-mark" href="#home" onClick={closeMenu}>NKX<sup>®</sup></a>
        <span className="site-status">PERSONAL INDEX / 2026</span>
        <div className="site-actions">
          <a href="#work" className="header-link">WORK / INDEX <span>↘</span></a>
          <button className={`menu-button ${menuOpen ? "is-open" : ""}`} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><i /><i /></button>
        </div>
      </header>

      <aside className={`site-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <span className="mono">INDEX / NAVIGATION</span>
        <nav>
          <a href="#home" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Intro</a>
          <a href="#archive" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Archive</a>
          <a href="#work" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Work</a>
          <a href="#system" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>System</a>
          <a href="#contact" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Contact</a>
        </nav>
      </aside>

      <main>
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
              {index === 2 && <div className="archive-card__image"><img src="/assets/status-nodeget-dark.png" alt="Dark NodeGet status page preview" /></div>}
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

      <footer className="site-footer mono"><span>NIE KAIXIANG / QQ.SG</span><span>PUBLIC TRACE / 2026</span></footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
