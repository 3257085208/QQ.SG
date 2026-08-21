import { statusSnapshot } from "../data";

export function InfrastructureField() {
  return (
    <div className="infrastructure-field">
      <div className="infrastructure-field__top mono">
        <span>QQ.SG / PUBLIC INDEX</span>
        <span>FIELD / 01</span>
      </div>

      <svg className="infrastructure-field__graphic" viewBox="0 0 800 480" role="presentation" aria-hidden="true">
        <path className="field-line field-line--quiet" d="M74 342C160 248 194 168 306 188S438 250 520 126 650 92 726 144" />
        <path className="field-line field-line--main" d="M74 342C164 304 236 284 330 246S438 214 520 126 630 196 726 144" />
        <path className="field-line field-line--accent" d="M330 246C364 324 444 352 530 328S646 248 726 144" />
        <circle className="field-point" cx="74" cy="342" r="5" />
        <circle className="field-point" cx="330" cy="246" r="5" />
        <circle className="field-point" cx="520" cy="126" r="5" />
        <circle className="field-point" cx="726" cy="144" r="5" />
        <circle className="field-point field-point--home" cx="530" cy="328" r="8" />
      </svg>

      <div className="infrastructure-field__core">
        <span className="mono">FIELD TRACE</span>
        <strong>QQ.SG</strong>
        <span className="mono">OPEN / PUBLIC / STATUS</span>
      </div>

      <div className="infrastructure-field__readout">
        <span className="mono">ONLINE / TOTAL</span>
        <strong>{statusSnapshot.online}</strong>
        <span className="mono">NODEGET / {statusSnapshot.snapshot}</span>
      </div>

      <div className="infrastructure-field__bottom mono">
        <span>CHINA / UTC+8</span>
        <span>ENTER / ARCHIVE ↓</span>
      </div>
    </div>
  );
}
