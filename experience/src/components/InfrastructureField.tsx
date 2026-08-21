import { useEffect, useState } from "react";
import { statusSnapshot } from "../data";

type FieldCity = {
  id: string;
  name: string;
  short: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
};

const fieldCities: FieldCity[] = [
  { id: "hk", name: "Hong Kong", short: "HK", x: 640, y: 211, labelX: 648, labelY: 224 },
  { id: "tw", name: "Taiwan", short: "TW", x: 654, y: 207, labelX: 663, labelY: 203 },
  { id: "sh", name: "Shanghai", short: "SH", x: 651, y: 184, labelX: 660, labelY: 179 },
  { id: "ly", name: "Longyan", short: "LY", x: 643, y: 199, labelX: 624, labelY: 211 },
  { id: "fra", name: "Frankfurt", short: "FRA", x: 418, y: 145, labelX: 427, labelY: 139 },
  { id: "lax", name: "Los Angeles", short: "LAX", x: 153, y: 176, labelX: 162, labelY: 190 },
  { id: "nyc", name: "New York", short: "NYC", x: 246, y: 155, labelX: 255, labelY: 149 },
  { id: "tyo", name: "Tokyo", short: "TYO", x: 694, y: 181, labelX: 704, labelY: 175 }
];

type FieldRoute = {
  source: FieldCity;
  destination: FieldCity;
  path: string;
  sequence: number;
};

function makeFieldRoute(source: FieldCity, destination: FieldCity, sequence: number): FieldRoute {
  const direction = source.x < destination.x ? 1 : -1;
  const controlX = (source.x + destination.x) / 2 + direction * 18;
  const controlY = Math.max(48, Math.min(source.y, destination.y) - Math.max(38, Math.min(88, Math.abs(destination.x - source.x) * .12)));
  return {
    source,
    destination,
    path: `M${source.x} ${source.y} Q${controlX.toFixed(1)} ${controlY.toFixed(1)} ${destination.x} ${destination.y}`,
    sequence
  };
}

function chooseFieldRoute(current: FieldRoute): FieldRoute {
  let source = fieldCities[Math.floor(Math.random() * fieldCities.length)];
  let destination = fieldCities[Math.floor(Math.random() * fieldCities.length)];
  let attempts = 0;

  while (source.id === destination.id || (source.id === current.source.id && destination.id === current.destination.id)) {
    source = fieldCities[Math.floor(Math.random() * fieldCities.length)];
    destination = fieldCities[Math.floor(Math.random() * fieldCities.length)];
    attempts += 1;
    if (attempts > 12) break;
  }

  return makeFieldRoute(source, destination, current.sequence + 1);
}

export function InfrastructureField() {
  const [route, setRoute] = useState<FieldRoute>(() => makeFieldRoute(fieldCities[0], fieldCities[4], 0));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setRoute(chooseFieldRoute), 4800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="infrastructure-field">
      <div className="infrastructure-field__top mono">
        <span>QQ.SG / PUBLIC INDEX</span>
        <span>FIELD / 01</span>
      </div>

      <svg className="infrastructure-field__graphic" viewBox="0 0 800 480" role="presentation" aria-hidden="true">
        <g className="field-map" aria-hidden="true">
          <path className="field-map__land" d="M46 126C58 106 82 90 111 84L141 88 164 101 181 121 173 136 153 142 145 160 129 169 119 185 101 178 96 161 79 151 61 148Z" />
          <path className="field-map__land" d="M222 61L246 48 275 55 291 73 279 91 251 96 230 86 215 74Z" />
          <path className="field-map__land" d="M230 218C247 226 260 247 260 270 258 296 246 323 231 350 218 374 203 392 190 401 179 390 177 369 184 344 190 320 183 297 188 274 198 249 214 233 230 218Z" />
          <path className="field-map__land" d="M371 133C385 113 404 103 427 105L448 115 444 128 427 134 414 146 397 143 385 153 368 147Z" />
          <path className="field-map__land" d="M423 128C451 107 487 96 531 94 571 91 614 99 657 109 701 118 739 130 764 151L777 169 764 182 742 184 721 200 698 196 674 211 652 205 634 217 611 202 590 188 563 176 533 168 505 157 476 158 451 147Z" />
          <path className="field-map__land" d="M394 177C414 169 438 174 453 190 466 208 460 237 451 263 440 294 423 317 403 331 385 318 379 294 383 268 375 243 380 215 388 195Z" />
          <path className="field-map__land" d="M626 314C650 302 684 305 709 318 727 329 729 348 708 362 684 373 651 365 630 350 617 337 615 325 626 314Z" />
          <path className="field-map__edge" d="M303 150C339 122 362 105 390 99M535 231C564 223 588 228 615 244" />
        </g>

        <path className="field-transmission__backbone" d="M121 272C286 230 389 212 518 181S670 159 744 186" />
        <path className="field-transmission__route" d={route.path} key={`route-${route.sequence}`} />

        <g className="field-cities">
          {fieldCities.map((city) => {
            const isSource = city.id === route.source.id;
            const isDestination = city.id === route.destination.id;
            return (
              <g className={`field-city${isSource ? " is-source" : ""}${isDestination ? " is-destination" : ""}`} key={city.id}>
                <circle className="field-city__halo" cx={city.x} cy={city.y} r="7" />
                <circle className="field-city__dot" cx={city.x} cy={city.y} r="2.6" />
                <text className="field-city__label" x={city.labelX} y={city.labelY}>{city.short}</text>
              </g>
            );
          })}
        </g>

        <circle className="field-transmission__particle" key={`particle-${route.sequence}`} r="3.2">
          <animateMotion dur="3.8s" path={route.path} rotate="auto" />
          <animate attributeName="opacity" values="0;1;1;0" dur="3.8s" repeatCount="1" />
        </circle>
        <circle className="field-transmission__pulse" key={`source-pulse-${route.sequence}`} cx={route.source.x} cy={route.source.y} r="5">
          <animate attributeName="r" values="5;14;5" dur="3.8s" repeatCount="1" />
          <animate attributeName="opacity" values=".7;0;0" dur="3.8s" repeatCount="1" />
        </circle>
        <circle className="field-transmission__pulse" key={`destination-pulse-${route.sequence}`} cx={route.destination.x} cy={route.destination.y} r="5">
          <animate attributeName="r" values="5;14;5" begin="2.8s" dur="3.8s" repeatCount="1" />
          <animate attributeName="opacity" values=".7;0;0" begin="2.8s" dur="3.8s" repeatCount="1" />
        </circle>
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
