import { useEffect, useState } from "react";
import { statusSnapshot } from "../data";
import { WORLD_MAP_PATH } from "../data/worldMap";

type GeoPoint = {
  lat: number;
  lon: number;
};

type FieldCity = GeoPoint & {
  id: string;
  name: string;
  short: string;
  labelDx: number;
  labelDy: number;
  x: number;
  y: number;
};

type FieldCitySeed = Omit<FieldCity, "x" | "y">;

const FIELD_MAP = {
  left: 28,
  right: 772,
  top: 54,
  bottom: 414
} as const;

function projectFieldPoint(lat: number, lon: number) {
  return {
    x: FIELD_MAP.left + ((lon + 180) / 360) * (FIELD_MAP.right - FIELD_MAP.left),
    y: FIELD_MAP.top + ((90 - lat) / 180) * (FIELD_MAP.bottom - FIELD_MAP.top)
  };
}

const fieldCitySeeds: FieldCitySeed[] = [
  { id: "hk", name: "Hong Kong", short: "HK", lat: 22.3193, lon: 114.1694, labelDx: 10, labelDy: 14 },
  { id: "tw", name: "Taipei", short: "TW", lat: 25.033, lon: 121.565, labelDx: 13, labelDy: -10 },
  { id: "sh", name: "Shanghai", short: "SH", lat: 31.2304, lon: 121.4737, labelDx: 12, labelDy: -9 },
  { id: "ly", name: "Longyan", short: "LY", lat: 25.0751, lon: 117.0172, labelDx: -26, labelDy: 15 },
  { id: "fra", name: "Frankfurt", short: "FRA", lat: 50.1109, lon: 8.6821, labelDx: 10, labelDy: -8 },
  { id: "lax", name: "Los Angeles", short: "LAX", lat: 34.0522, lon: -118.2437, labelDx: 10, labelDy: 14 },
  { id: "nyc", name: "New York", short: "NYC", lat: 40.7128, lon: -74.006, labelDx: 10, labelDy: -8 },
  { id: "tyo", name: "Tokyo", short: "TYO", lat: 35.6762, lon: 139.6503, labelDx: 12, labelDy: -10 }
];

const fieldCities: FieldCity[] = fieldCitySeeds.map((city) => ({
  ...city,
  ...projectFieldPoint(city.lat, city.lon)
}));

type FieldRoute = {
  source: FieldCity;
  destination: FieldCity;
  path: string;
  sequence: number;
};

type FieldPhase = "idle" | "source" | "route-draw" | "travel" | "receive" | "decay";

function buildTransmissionPath(source: FieldCity, destination: FieldCity) {
  const dx = destination.x - source.x;
  const dy = destination.y - source.y;
  const horizontalSpan = Math.abs(dx);
  const verticalSpan = Math.abs(dy);
  const lift = Math.min(92, Math.max(18, horizontalSpan * .12 + verticalSpan * .28));
  const peakY = Math.max(FIELD_MAP.top + 16, Math.min(source.y, destination.y) - lift);
  const controlOne = {
    x: source.x + dx * .3,
    y: source.y + (peakY - source.y) * .82
  };
  const controlTwo = {
    x: destination.x - dx * .3,
    y: destination.y + (peakY - destination.y) * .82
  };

  return `M${source.x.toFixed(1)} ${source.y.toFixed(1)} C${controlOne.x.toFixed(1)} ${controlOne.y.toFixed(1)} ${controlTwo.x.toFixed(1)} ${controlTwo.y.toFixed(1)} ${destination.x.toFixed(1)} ${destination.y.toFixed(1)}`;
}

function makeFieldRoute(source: FieldCity, destination: FieldCity, sequence: number): FieldRoute {
  return {
    source,
    destination,
    path: buildTransmissionPath(source, destination),
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

function FieldTransmissionPacket({ route, phase }: { route: FieldRoute; phase: FieldPhase }) {
  if (phase !== "travel") return null;

  const travelDuration = 2.35;
  const tailDots = [
    { delay: .08, radius: 1.1, opacity: .14 },
    { delay: .06, radius: 1.35, opacity: .2 },
    { delay: .04, radius: 1.7, opacity: .27 },
    { delay: .02, radius: 2, opacity: .34 }
  ];

  return (
    <g className="field-transmission__packet" key={`packet-${route.sequence}`}>
      {tailDots.map((dot, index) => (
        <circle className="field-transmission__packet-tail" r={dot.radius} key={`packet-tail-${route.sequence}-${index}`}>
          <animateMotion dur={`${travelDuration}s`} begin={`${dot.delay}s`} path={route.path} rotate="auto" fill="remove" />
          <animate attributeName="opacity" values={`0;${dot.opacity};${dot.opacity * .35};0`} dur={`${travelDuration}s`} begin={`${dot.delay}s`} fill="remove" />
        </circle>
      ))}
      <circle className="field-transmission__packet-ring" r="6">
        <animateMotion dur={`${travelDuration}s`} path={route.path} rotate="auto" fill="remove" />
        <animate attributeName="opacity" values="0;.65;.28;0" dur={`${travelDuration}s`} fill="remove" />
      </circle>
      <circle className="field-transmission__particle" r="3.3">
        <animateMotion dur={`${travelDuration}s`} path={route.path} rotate="auto" fill="remove" />
        <animate attributeName="opacity" values="0;1;1;0" dur={`${travelDuration}s`} fill="remove" />
      </circle>
    </g>
  );
}

export function InfrastructureField() {
  const [route, setRoute] = useState<FieldRoute>(() => makeFieldRoute(fieldCities[0], fieldCities[4], 0));
  const [phase, setPhase] = useState<FieldPhase>("idle");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const timers = new Set<number>();
    const later = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (!cancelled) callback();
      }, delay);
      timers.add(timer);
    };

    const startCycle = () => {
      if (cancelled) return;
      setPhase("source");
      later(() => setPhase("route-draw"), 220);
      later(() => setPhase("travel"), 620);
      later(() => setPhase("receive"), 3_040);
      later(() => setPhase("decay"), 3_500);
      later(() => setPhase("idle"), 3_980);
      later(() => {
        setRoute((current) => chooseFieldRoute(current));
        startCycle();
      }, 4_560 + Math.random() * 680);
    };

    startCycle();
    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const sourceActive = phase === "source" || phase === "route-draw" || phase === "travel";
  const destinationActive = phase === "receive" || phase === "decay";

  return (
    <div className="infrastructure-field">
      <div className="infrastructure-field__top mono">
        <span>QQ.SG / PUBLIC INDEX</span>
        <span>FIELD / 01</span>
      </div>

      <svg
        className="infrastructure-field__graphic"
        viewBox="28 24 744 396"
        role="presentation"
        aria-hidden="true"
        data-route={`${route.source.id}-${route.destination.id}`}
        data-phase={phase}
      >
        <g className="field-map" aria-hidden="true">
          <path className="field-map__land" d={WORLD_MAP_PATH} />
          <path className="field-map__graticule" d="M28 144H772 M28 234H772 M28 324H772 M214 54V414 M400 54V414 M586 54V414" />
        </g>

        <path className={`field-transmission__underlay is-${phase}`} d={route.path} pathLength="1" />
        <path className={`field-transmission__route is-${phase}`} d={route.path} pathLength="1" key={`route-${route.sequence}`} />

        <g className="field-cities">
          {fieldCities.map((city) => {
            const isSource = sourceActive && city.id === route.source.id;
            const isDestination = destinationActive && city.id === route.destination.id;
            const isActive = isSource || isDestination;
            const labelX = city.x + city.labelDx;
            const labelY = city.y + city.labelDy;
            const leaderX = city.x + city.labelDx * .58;
            const leaderY = city.y + city.labelDy * .58;

            return (
              <g className={`field-city${isSource ? " is-source" : ""}${isDestination ? " is-destination" : ""}`} key={city.id}>
                {isActive && <path className="field-city__leader" d={`M${city.x.toFixed(1)} ${city.y.toFixed(1)} L${leaderX.toFixed(1)} ${leaderY.toFixed(1)} L${labelX.toFixed(1)} ${(labelY - 3).toFixed(1)}`} />}
                <circle className="field-city__halo" cx={city.x} cy={city.y} r={isActive ? 8 : 4.5} />
                <circle className="field-city__dot" cx={city.x} cy={city.y} r={isActive ? 2.8 : 1.8} />
                {isActive && <text className="field-city__label" x={labelX} y={labelY}>{city.short}</text>}
              </g>
            );
          })}
        </g>

        <FieldTransmissionPacket route={route} phase={phase} />
        {phase === "source" && (
          <circle className="field-transmission__pulse" key={`source-pulse-${route.sequence}`} cx={route.source.x} cy={route.source.y} r="5">
            <animate attributeName="r" values="5;15" dur=".72s" repeatCount="1" />
            <animate attributeName="opacity" values=".7;0" dur=".72s" repeatCount="1" />
          </circle>
        )}
        {phase === "receive" && (
          <circle className="field-transmission__pulse" key={`destination-pulse-${route.sequence}`} cx={route.destination.x} cy={route.destination.y} r="5">
            <animate attributeName="r" values="5;15" dur=".72s" repeatCount="1" />
            <animate attributeName="opacity" values=".7;0" dur=".72s" repeatCount="1" />
          </circle>
        )}
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
