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
  { id: "tyo", name: "Tokyo", short: "TYO", lat: 35.6762, lon: 139.6503, labelDx: 12, labelDy: -10 },
  { id: "sin", name: "Singapore", short: "SIN", lat: 1.3521, lon: 103.8198, labelDx: 10, labelDy: 14 },
  { id: "hy", name: "Heyuan", short: "HY", lat: 23.7463, lon: 114.7006, labelDx: -24, labelDy: 15 },
  { id: "pdx", name: "Portland, Oregon", short: "PDX", lat: 45.5152, lon: -122.6784, labelDx: 10, labelDy: -8 },
  { id: "phx", name: "Phoenix", short: "PHX", lat: 33.4484, lon: -112.074, labelDx: 10, labelDy: 14 },
  { id: "trn", name: "Turin", short: "TRN", lat: 45.0703, lon: 7.6869, labelDx: 10, labelDy: 14 },
  { id: "ams", name: "Amsterdam", short: "AMS", lat: 52.3676, lon: 4.9041, labelDx: 10, labelDy: -8 },
  { id: "kc", name: "Kansas City", short: "KC", lat: 39.0997, lon: -94.5786, labelDx: -24, labelDy: -8 },
  { id: "kiv", name: "Chisinau", short: "KIV", lat: 47.0105, lon: 28.8638, labelDx: 10, labelDy: 14 }
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
  emissionDelay: number;
};

type FieldPacket = {
  id: string;
  route: FieldRoute;
  delay: number;
  duration: number;
};

type FieldBurst = {
  sequence: number;
  destination: FieldCity;
  routes: FieldRoute[];
  packets: FieldPacket[];
};

type FieldPhase = "idle" | "source" | "route-draw" | "travel" | "receive" | "decay";

const destinationRotation = ["fra", "tyo", "lax", "hk", "ams", "nyc", "sin", "kiv", "phx", "sh"];

function fieldNoise(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function buildTransmissionPath(source: FieldCity, destination: FieldCity, variant: number) {
  const dx = destination.x - source.x;
  const dy = destination.y - source.y;
  const horizontalSpan = Math.abs(dx);
  const verticalSpan = Math.abs(dy);
  const lift = Math.min(112, Math.max(24, horizontalSpan * .11 + verticalSpan * .24 + (variant % 4) * 9));
  const sway = ((variant % 3) - 1) * Math.min(26, horizontalSpan * .06);
  const peakY = Math.max(FIELD_MAP.top + 14, Math.min(FIELD_MAP.bottom - 26, Math.min(source.y, destination.y) - lift + sway));
  const controlOne = {
    x: source.x + dx * (.25 + (variant % 2) * .04),
    y: source.y + (peakY - source.y) * .8
  };
  const controlTwo = {
    x: destination.x - dx * (.25 + ((variant + 1) % 2) * .04),
    y: destination.y + (peakY - destination.y) * .8
  };

  // Screen-space arcs intentionally keep Pacific traffic continuous inside the composition.
  return `M${source.x.toFixed(1)} ${source.y.toFixed(1)} C${controlOne.x.toFixed(1)} ${controlOne.y.toFixed(1)} ${controlTwo.x.toFixed(1)} ${controlTwo.y.toFixed(1)} ${destination.x.toFixed(1)} ${destination.y.toFixed(1)}`;
}

function makeFieldBurst(sequence: number, requestedDestination?: string): FieldBurst {
  const destinationId = requestedDestination ?? destinationRotation[sequence % destinationRotation.length];
  const destination = fieldCities.find((city) => city.id === destinationId) ?? fieldCities[4];
  const sourceCount = 7 + Math.floor(fieldNoise(sequence + 7) * 4);
  const candidates = fieldCities
    .filter((city) => city.id !== destination.id)
    .map((city, index) => ({ city, rank: fieldNoise(sequence * 31 + index * 17 + city.id.length) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, sourceCount)
    .map(({ city }) => city);

  const routes = candidates.map((source, index) => ({
    source,
    destination,
    path: buildTransmissionPath(source, destination, sequence + index),
    sequence: index,
    emissionDelay: .08 + index * .115 + fieldNoise(sequence * 19 + index + 2) * .14
  }));

  const packets = routes.flatMap((route, index) => {
    const packetCount = (index + sequence) % 3 === 0 ? 2 : 1;
    return Array.from({ length: packetCount }, (_, packetIndex) => {
      const delay = route.emissionDelay + packetIndex * .16 + fieldNoise(sequence * 43 + index * 7 + packetIndex) * .1;
      const duration = 1.92 + fieldNoise(sequence * 53 + index * 11 + packetIndex) * .82;
      return {
        id: `burst-${sequence}-route-${index}-packet-${packetIndex}`,
        route,
        delay,
        duration
      };
    });
  });

  return { sequence, destination, routes, packets };
}

function FieldTransmissionPacket({ packet, phase }: { packet: FieldPacket; phase: FieldPhase }) {
  if (phase === "idle") return null;

  const tailDots = [
    { lag: .2, radius: 1.05, opacity: .13 },
    { lag: .14, radius: 1.3, opacity: .19 },
    { lag: .08, radius: 1.7, opacity: .27 },
    { lag: .035, radius: 2, opacity: .36 }
  ];
  const arrival = packet.delay + packet.duration;

  return (
    <g className="field-transmission__packet" key={packet.id}>
      {tailDots.map((dot, index) => (
        <circle className="field-transmission__packet-tail" r={dot.radius} key={`${packet.id}-tail-${index}`}>
          <animateMotion dur={`${packet.duration.toFixed(2)}s`} begin={`${(packet.delay + dot.lag).toFixed(2)}s`} path={packet.route.path} rotate="auto" fill="remove" />
          <animate attributeName="opacity" values={`0;${dot.opacity};${dot.opacity * .34};0`} dur={`${packet.duration.toFixed(2)}s`} begin={`${(packet.delay + dot.lag).toFixed(2)}s`} fill="remove" />
        </circle>
      ))}
      <circle className="field-transmission__packet-ring" r="6">
        <animateMotion dur={`${packet.duration.toFixed(2)}s`} begin={`${packet.delay.toFixed(2)}s`} path={packet.route.path} rotate="auto" fill="remove" />
        <animate attributeName="opacity" values="0;.62;.24;0" dur={`${packet.duration.toFixed(2)}s`} begin={`${packet.delay.toFixed(2)}s`} fill="remove" />
      </circle>
      <circle className="field-transmission__particle" r="2.8">
        <animateMotion dur={`${packet.duration.toFixed(2)}s`} begin={`${packet.delay.toFixed(2)}s`} path={packet.route.path} rotate="auto" fill="remove" />
        <animate attributeName="opacity" values="0;1;1;0" dur={`${packet.duration.toFixed(2)}s`} begin={`${packet.delay.toFixed(2)}s`} fill="remove" />
      </circle>
      <circle className="field-transmission__pulse field-transmission__receive-pulse" cx={packet.route.destination.x} cy={packet.route.destination.y} r="4">
        <animate attributeName="r" values="4;13" dur=".62s" begin={`${arrival.toFixed(2)}s`} repeatCount="1" fill="remove" />
        <animate attributeName="opacity" values=".62;0" dur=".62s" begin={`${arrival.toFixed(2)}s`} repeatCount="1" fill="remove" />
      </circle>
    </g>
  );
}

export function InfrastructureField() {
  const [burst, setBurst] = useState<FieldBurst>(() => makeFieldBurst(0, "fra"));
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
      later(() => setPhase("route-draw"), 240);
      later(() => setPhase("travel"), 620);
      later(() => setPhase("receive"), 3_900);
      later(() => setPhase("decay"), 4_760);
      later(() => setPhase("idle"), 5_520);
      later(() => {
        setBurst((current) => {
          const nextSequence = current.sequence + 1;
          const currentIndex = destinationRotation.indexOf(current.destination.id);
          const nextDestination = destinationRotation[(currentIndex + 1 + nextSequence) % destinationRotation.length];
          return makeFieldBurst(nextSequence, nextDestination);
        });
        startCycle();
      }, 6_160 + Math.random() * 720);
    };

    startCycle();
    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const activeSourceIds = new Set(burst.routes.map((route) => route.source.id));

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
        data-route={`ingress-${burst.sequence}`}
        data-phase={phase}
        data-destination={burst.destination.id}
        data-source-count={burst.routes.length}
        data-packet-count={burst.packets.length}
      >
        <g className="field-map" aria-hidden="true">
          <path className="field-map__land" d={WORLD_MAP_PATH} />
          <path className="field-map__graticule" d="M28 144H772 M28 234H772 M28 324H772 M214 54V414 M400 54V414 M586 54V414" />
        </g>

        <g className="field-transmission__routes" aria-hidden="true">
          {burst.routes.map((route) => (
            <g key={`route-group-${burst.sequence}-${route.sequence}`}>
              <path className={`field-transmission__underlay is-${phase}`} d={route.path} pathLength="1" />
              <path className={`field-transmission__route is-${phase}`} d={route.path} pathLength="1" style={{ transitionDelay: `${(route.sequence * .035).toFixed(2)}s` }} />
            </g>
          ))}
        </g>

        <g className="field-cities">
          {fieldCities.map((city) => {
            const isSource = phase !== "idle" && activeSourceIds.has(city.id);
            const isDestination = city.id === burst.destination.id;
            const isActive = isSource || isDestination;
            const labelX = city.x + city.labelDx;
            const labelY = city.y + city.labelDy;
            const leaderX = city.x + city.labelDx * .58;
            const leaderY = city.y + city.labelDy * .58;

            return (
              <g className={`field-city${isSource ? " is-source" : ""}${isDestination ? " is-destination" : ""}`} key={city.id}>
                {isDestination && <path className="field-city__leader" d={`M${city.x.toFixed(1)} ${city.y.toFixed(1)} L${leaderX.toFixed(1)} ${leaderY.toFixed(1)} L${labelX.toFixed(1)} ${(labelY - 3).toFixed(1)}`} />}
                {isDestination && <circle className="field-city__sink-ring" cx={city.x} cy={city.y} r="9" />}
                <circle className="field-city__halo" cx={city.x} cy={city.y} r={isActive ? (isDestination ? 8.5 : 6) : 4.5} />
                <circle className="field-city__dot" cx={city.x} cy={city.y} r={isActive ? (isDestination ? 3.2 : 2.35) : 1.8} />
                {isDestination && <text className="field-city__label" x={labelX} y={labelY}>{city.short}</text>}
              </g>
            );
          })}
        </g>

        <g className="field-transmission__emissions" aria-hidden="true">
          {burst.routes.map((route) => (
            <circle className="field-transmission__source-pulse" key={`source-pulse-${burst.sequence}-${route.sequence}`} cx={route.source.x} cy={route.source.y} r="4">
              <animate attributeName="r" values="4;14" dur=".68s" begin={`${route.emissionDelay.toFixed(2)}s`} repeatCount="1" fill="remove" />
              <animate attributeName="opacity" values=".58;0" dur=".68s" begin={`${route.emissionDelay.toFixed(2)}s`} repeatCount="1" fill="remove" />
            </circle>
          ))}
        </g>

        {burst.packets.map((packet) => <FieldTransmissionPacket key={packet.id} packet={packet} phase={phase} />)}
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
