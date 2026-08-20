import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { capabilities, networkNodes, networkSummary, selectedWorks, timeline } from "./data";
import { mountScrollExperience } from "./engine/scroll";
import { InfrastructureField } from "./components/InfrastructureField";
import { WorkVisual } from "./components/WorkVisual";
import "./styles.css";

type NetworkSceneComponent = typeof import("./components/NetworkScene").NetworkScene;

function DeferredNetworkScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [Scene, setScene] = useState<NetworkSceneComponent | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void import("./components/NetworkScene").then(({ NetworkScene }) => setScene(() => NetworkScene));
    }, { rootMargin: "280px 0px" });

    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="network-loader" ref={hostRef}>
      {Scene ? <Scene /> : <span className="network-fallback mono">LOAD / SYSTEM MAP</span>}
    </div>
  );
}

function lines(value: string) {
  return value.split("\n").map((line) => <span key={line}>{line}</span>);
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
        <span className="site-status">PERSONAL SYSTEM / 2026</span>
        <div className="site-actions">
          <a href="#work" className="header-link">SELECTED WORK <span>↘</span></a>
          <button className={`menu-button ${menuOpen ? "is-open" : ""}`} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><i /><i /></button>
        </div>
      </header>

      <aside className={`site-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <span className="mono">INDEX / NAVIGATION</span>
        <nav>
          <a href="#home" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Home</a>
          <a href="#origin" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Origin</a>
          <a href="#work" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Work</a>
          <a href="#capabilities" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Capabilities</a>
          <a href="#system" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>System</a>
          <a href="#contact" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Contact</a>
        </nav>
      </aside>

      <main>
        <section className="hero" id="home">
          <div className="hero__frame">
            <div className="hero-topline mono"><span>Digital builder / independent</span><span>CHINA / UTC+8</span></div>
            <div className="hero-title" aria-label="Nie Kaixiang">
              <span>NIE</span>
              <span>KAIXIANG</span>
            </div>
            <div className="hero-window" aria-hidden="true"><InfrastructureField /></div>
            <div className="hero-statement" aria-hidden="true">BUILD / RUN /<br /><em>RECORD.</em></div>
            <div className="hero-aside">
              <span className="mono">FIELD / 01—03</span>
              <p>Public services<br />open code / field notes.</p>
            </div>
            <div className="hero-bottomline mono"><span>QQ.SG / PERSONAL INDEX</span><span>Scroll to enter ↓</span></div>
            <div className="hero-rule" />
          </div>
        </section>

        <section className="origin section-dark" id="origin">
          <div className="archive-header mono"><span>01 / ORIGIN</span><span>PERSONAL ARCHIVE / PUBLIC TRACE</span></div>
          <div className="origin-archive grid-12">
            <div className="origin-mark"><span className="mono">NKX / 01</span><strong>QQ.SG</strong><span className="mono">CHINA / UTC+8</span></div>
            <div className="origin-copy"><p className="origin-lede">我关心一件事情：页面如何被送到屏幕，服务如何在没人盯着时继续工作。</p><p>现在公开做基础设施、软件和一些不太容易被归类的小工具。代码、状态页和文章，都是这套系统留下的记录。</p></div>
            <dl className="origin-facts">
              <div><dt className="mono">BASE</dt><dd>CHINA / UTC+8</dd></div>
              <div><dt className="mono">SOURCE</dt><dd>GITHUB / PUBLIC TRACE</dd></div>
              <div><dt className="mono">MODE</dt><dd>BUILD / OPERATE / WRITE</dd></div>
            </dl>
          </div>
        </section>

        <section className="timeline section-dark" id="timeline" aria-labelledby="timeline-title">
          <div className="archive-header mono" id="timeline-title"><span>01.1 / HISTORY</span><span>PUBLIC TRACE / FOUR RECORDS</span></div>
          <div className="timeline-stage">
            <div className="timeline-viewport">
              <div className="timeline-rail" aria-hidden="true" />
              <div className="timeline-years" aria-hidden="true">
                {timeline.map((entry) => <span key={entry.year}>{entry.year}</span>)}
              </div>
              <div className="timeline-entries">
                {timeline.map((entry, index) => <article className="timeline-entry" key={entry.year}>
                  <div className="timeline-entry__index mono">0{index + 1} / {entry.label}</div>
                  <span className="timeline-entry__year">{entry.year}</span>
                  <div className="timeline-entry__content">
                    <h3>{entry.title}</h3>
                    <p>{entry.detail}</p>
                    <div className="timeline-entry__facts mono"><span>{entry.stat}</span><span>{entry.location}</span></div>
                  </div>
                </article>)}
              </div>
            </div>
          </div>
        </section>

        <section className="work section-paper" id="work">
          <div className="section-kicker mono">02 / SELECTED WORK <span>PUBLIC PROJECTS</span></div>
          <h2 className="display-heading work-heading">SELECTED<br /><em>WORK.</em></h2>
          <div className="work-list">
            <div className="work-sequence-rail mono" aria-hidden="true"><span>WORK / SEQUENCE</span><span className="work-sequence-current">01 / STATUS SYSTEM</span><span>03 PROJECTS</span></div>
            {selectedWorks.map((item) => <a className={`work-row work-row--${item.kind}`} data-work-label={`${item.index} / ${item.title.replace("\n", " ")}`} href={item.href} target="_blank" rel="noreferrer" key={item.index}>
              <div className="work-meta mono"><span>{item.index}</span><span>{item.year}</span></div>
              <div className="work-copy"><h3>{lines(item.title)}</h3><p>{item.detail}</p><span className="mono">{item.meta}</span></div>
              <WorkVisual item={item} />
            </a>)}
          </div>
        </section>

        <section className="capabilities section-dark" id="capabilities">
          <div className="section-kicker mono">03 / CAPABILITIES <span>TOOLS / PRACTICE</span></div>
          <div className="capabilities-grid grid-12">
            <div className="capabilities-note"><span className="mono">PUBLIC PRACTICE</span><p>从基础设施到写作，工具只是让系统继续工作的材料。</p></div>
            <div className="capability-list">{capabilities.map((item) => <div className="capability-row" key={item.title}><h3>{item.title}</h3><p className="mono">{item.items}</p></div>)}</div>
          </div>
        </section>

        <section className="system section-paper" id="system" aria-labelledby="system-title">
          <div className="section-kicker mono" id="system-title">04 / SYSTEM <span>INFRASTRUCTURE MAP</span></div>
          <div className="system-grid grid-12"><div className="system-map"><DeferredNetworkScene /></div><div className="system-copy"><div className="system-summary"><span className="mono">ONLINE / TOTAL</span><strong>{networkSummary.online}</strong><span className="mono">{networkSummary.total} NODES / SNAPSHOT {networkSummary.snapshot}</span></div><p>公开状态页的一个现场快照。Canvas 只负责呈现关系，旁边的 HTML 数据才是可读的来源。</p><div className="system-data">{networkNodes.map((node) => <div className="system-data__row" key={node.label}><span className="mono">{node.label}</span><strong>{node.value}</strong><span className="mono">{node.role}</span></div>)}</div><a className="system-source mono" href={networkSummary.source} target="_blank" rel="noreferrer">OPEN STATUS.QQ.SG <span>↗</span></a></div></div>
        </section>

        <section className="contact section-dark" id="contact">
          <div className="section-kicker mono">05 / CONTACT <span>OPEN CHANNEL</span></div>
          <h2 className="contact-heading">OPEN<br /><em>CHANNEL.</em></h2>
          <div className="contact-links"><a href="https://github.com/3257085208" target="_blank" rel="noreferrer">GITHUB <span>↗</span></a><a href="https://www.niekaixiang.com" target="_blank" rel="noreferrer">WEB <span>↗</span></a><a href="https://status.qq.sg" target="_blank" rel="noreferrer">STATUS <span>↗</span></a></div>
        </section>
      </main>

      <footer className="site-footer mono"><span>NIE KAIXIANG / QQ.SG</span><span>2026 / UTC+8</span></footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
