import { publicData } from "../generated/publicData";
import { statusSnapshot, type Work } from "../data";

function StatusVisual() {
  return (
    <div className="work-visual work-visual--status">
      <figure className="work-status__figure">
        <img src="/assets/status-nodeget-light.png" alt="NIE Theme NodeGet status page card view" />
        <figcaption className="mono">STATUS.QQ.SG / NODEGET / CARD VIEW</figcaption>
      </figure>
      <div className="work-status__readout">
        <div>
          <span className="mono">ONLINE / TOTAL</span>
          <strong>{statusSnapshot.online}</strong>
        </div>
        <div>
          <span className="mono">SNAPSHOT</span>
          <strong>{statusSnapshot.snapshot}</strong>
        </div>
        <div className="work-status__regions">
          {statusSnapshot.regions.map((region) => <span className="mono" key={region.label}>{region.label} {region.value}</span>)}
        </div>
      </div>
    </div>
  );
}

function SystemsVisual({ item }: { item: Work }) {
  const repo = publicData.github.repositories[0];
  const readme = "readme" in repo ? repo.readme : undefined;
  const tree = "tree" in repo ? repo.tree : [];

  return (
    <div className="work-visual work-visual--systems">
      <div className="work-systems__readme">
        <div className="work-artifact-head mono"><span>README.md / NIE-SLA</span><span>MAIN</span></div>
        <h4>{readme?.title ?? repo.name}</h4>
        <p>{readme?.excerpt ?? repo.description}</p>
        <span className="mono">{readme?.stack ?? "PUBLIC REPOSITORY / CLOUDFLARE"}</span>
      </div>
      <div className="work-systems__tree">
        <div className="work-artifact-head mono"><span>SOURCE TREE</span><span>VERIFIED PATHS</span></div>
        <pre>{tree.join("\n")}</pre>
      </div>
      <div className="work-systems__commit">
        <span className="mono">LATEST COMMIT / {repo.latestCommit.short}</span>
        <strong>{repo.latestCommit.message}</strong>
      </div>
      <div className="work-systems__meta mono">
        <span>PUBLIC REPOS / {publicData.github.profile.publicRepos}</span>
        <span>FOLLOWERS / {publicData.github.profile.followers}</span>
        <span>{item.footnote}</span>
      </div>
    </div>
  );
}

function NotesVisual() {
  return (
    <div className="work-visual work-visual--fieldnotes">
      <div className="work-notes__head">
        <div className="work-artifact-head mono"><span>NIE.NET / PUBLIC ARCHIVE</span><span>03 ENTRIES</span></div>
        <strong>NOTES / EDGE</strong>
      </div>
      <ol className="work-notes__list">
        {publicData.notes.entries.map((entry) => (
          <li key={entry.date}>
            <span className="mono">{entry.date}</span>
            <strong>{entry.title}</strong>
            <p>{entry.excerpt}</p>
            <small className="mono">{entry.meta}</small>
          </li>
        ))}
      </ol>
      <div className="work-notes__meta mono"><span>PUBLISHED / {publicData.notes.published}</span><span>LATEST / {publicData.notes.latest}</span></div>
    </div>
  );
}

export function WorkVisual({ item }: { item: Work }) {
  if (item.kind === "status") return <StatusVisual />;
  if (item.kind === "systems") return <SystemsVisual item={item} />;
  return <NotesVisual />;
}
