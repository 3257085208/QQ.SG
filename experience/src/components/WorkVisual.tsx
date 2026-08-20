import type { Work } from "../data";

function MetricStrip({ metrics }: Pick<Work, "metrics">) {
  return (
    <div className="work-metric-strip">
      {metrics.map((metric) => <div className="work-metric" key={metric.label}><span className="mono">{metric.label}</span><strong>{metric.value}</strong></div>)}
    </div>
  );
}

function StatusVisual({ item }: { item: Work }) {
  return (
    <div className="work-visual work-visual--status">
      <div className="work-visual__top mono"><span>LIVE / STATUS</span><span>01—03</span></div>
      <MetricStrip metrics={item.metrics} />
      <div className="work-status__map" aria-hidden="true">
        <svg viewBox="0 0 640 360" role="presentation">
          <path d="M70 236C160 180 208 170 288 182S424 230 500 122 568 92 604 138" />
          <path d="M88 278C178 244 222 232 304 228S420 202 502 122 566 160 604 138" />
          <path d="M304 228C330 274 402 306 470 286S548 210 604 138" />
          <circle cx="70" cy="236" r="5" /><circle cx="288" cy="182" r="5" /><circle cx="500" cy="122" r="5" /><circle className="is-home" cx="470" cy="286" r="8" /><circle cx="604" cy="138" r="5" />
        </svg>
        <span className="work-status__home mono">HOME / ONLINE</span>
      </div>
      <div className="work-status__nodes mono">{item.records.map((record) => <span key={record}>{record}</span>)}</div>
      <div className="work-visual__foot mono">{item.footnote}</div>
    </div>
  );
}

function SystemsVisual({ item }: { item: Work }) {
  return (
    <div className="work-visual work-visual--systems">
      <div className="work-visual__top mono"><span>PUBLIC INDEX / REPOSITORIES</span><span>02—03</span></div>
      <div className="work-systems__path mono">github.com / 3257085208</div>
      <div className="work-systems__tree">
        <span className="work-systems__root">repositories/</span>
        {item.records.map((record, index) => <span key={record}><i>{index === item.records.length - 1 ? "└" : "├"}</i>{record}</span>)}
      </div>
      <div className="work-systems__commit"><span className="mono">OPEN / MAINTAINED</span><strong>CODE THAT<br />STAYS USEFUL.</strong></div>
      <MetricStrip metrics={item.metrics} />
      <div className="work-visual__foot mono">{item.footnote}</div>
    </div>
  );
}

function NotesVisual({ item }: { item: Work }) {
  return (
    <div className="work-visual work-visual--fieldnotes">
      <div className="work-visual__top mono"><span>聶.NET / ARCHIVE</span><span>03—03</span></div>
      <div className="work-notes__mast"><span>RECENT NOTES</span><strong>2026</strong></div>
      <ol className="work-notes__list">
        {item.records.map((record, index) => <li key={record}><span className="mono">0{index + 1}</span><strong>{record}</strong></li>)}
      </ol>
      <MetricStrip metrics={item.metrics} />
      <div className="work-visual__foot mono">{item.footnote}</div>
    </div>
  );
}

export function WorkVisual({ item }: { item: Work }) {
  if (item.kind === "status") return <StatusVisual item={item} />;
  if (item.kind === "systems") return <SystemsVisual item={item} />;
  return <NotesVisual item={item} />;
}
