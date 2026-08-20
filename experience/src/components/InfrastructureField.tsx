import { statusSnapshot } from "../data";

export function InfrastructureField() {
  return (
    <div className="infrastructure-field">
      <div className="infrastructure-field__top mono">
        <span>STATUS.QQ.SG / FIELD 01</span>
        <span>SNAPSHOT / {statusSnapshot.snapshot}</span>
      </div>

      <svg className="infrastructure-field__routes" viewBox="0 0 800 480" role="presentation" aria-hidden="true">
        <path className="field-route field-route--quiet" d="M90 318C160 236 190 192 284 180S430 206 506 118 634 88 718 152" />
        <path className="field-route field-route--main" d="M90 318C176 298 236 270 318 246S428 210 506 118 616 188 718 152" />
        <path className="field-route field-route--branch" d="M318 246C352 324 432 350 524 328S638 248 718 152" />
        <circle className="field-node" cx="90" cy="318" r="5" />
        <circle className="field-node" cx="318" cy="246" r="5" />
        <circle className="field-node" cx="506" cy="118" r="5" />
        <circle className="field-node" cx="718" cy="152" r="5" />
        <circle className="field-node field-node--home" cx="524" cy="328" r="8" />
      </svg>

      <div className="infrastructure-field__metrics">
        {statusSnapshot.regions.map((region) => (
          <div className="field-reading" key={region.label}>
            <span className="mono">{region.label}</span>
            <strong>{region.value}</strong>
          </div>
        ))}
      </div>

      <div className="infrastructure-field__core">
        <span className="mono">ONLINE / TOTAL</span>
        <strong>{statusSnapshot.online}</strong>
      </div>

      <div className="infrastructure-field__bottom mono">
        <span>{statusSnapshot.total} NODES / 06 FILTERS</span>
        <span>NODEGET / CARD VIEW</span>
      </div>
    </div>
  );
}
