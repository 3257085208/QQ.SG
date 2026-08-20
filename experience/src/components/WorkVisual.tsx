import { statusSnapshot, type Work } from "../data";

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
      <div className="work-visual__top mono"><span>STATUS.QQ.SG / SNAPSHOT</span><span>{statusSnapshot.snapshot}</span></div>
      <div className="work-status__overview"><span className="mono">{statusSnapshot.name} / NODEGET</span><strong>{statusSnapshot.online}</strong><span className="mono">ONLINE / TOTAL · CARD VIEW</span></div>
      <div className="work-status__filters mono">{statusSnapshot.regions.map((region) => <span key={region.label}>{region.label} {region.value}</span>)}</div>
      <MetricStrip metrics={item.metrics} />
      <div className="work-status__nodes">{item.records.map((record) => <div className="work-status__node" key={record.label}><strong>{record.label}</strong><span>{record.detail}</span><em className="mono">{record.meta}</em></div>)}</div>
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
        <span className="work-systems__root">public repositories/</span>
        {item.records.map((record, index) => <span key={record.label}><i>{index === item.records.length - 1 ? "└" : "├"}</i><strong>{record.label}</strong><small>{record.meta}</small></span>)}
      </div>
      <div className="work-systems__commit"><span className="mono">LATEST PUSH / {item.records[0].commit?.short}</span><strong>{item.records[0].commit?.message}</strong></div>
      <MetricStrip metrics={item.metrics} />
      <div className="work-visual__foot mono">{item.footnote}</div>
    </div>
  );
}

function NotesVisual({ item }: { item: Work }) {
  return (
      <div className="work-visual work-visual--fieldnotes">
      <div className="work-visual__top mono"><span>聶.NET / ARCHIVE</span><span>03—03</span></div>
      <div className="work-notes__mast"><span>FIELD NOTES / PUBLIC ARCHIVE</span><strong>{item.metrics[1].value}</strong></div>
      <ol className="work-notes__list">
        {item.records.map((record) => <li key={record.label}><span className="mono">{record.label}</span><strong>{record.detail}</strong><small className="mono">{record.meta}</small><p>{record.excerpt}</p></li>)}
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
