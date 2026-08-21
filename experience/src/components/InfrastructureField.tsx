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

type ProjectedPoint = {
  x: number;
  y: number;
};

type FieldRouteSegment = {
  d: string;
  length: number;
};

type FieldRoute = {
  source: FieldCity;
  destination: FieldCity;
  path: string;
  segments: FieldRouteSegment[];
  sequence: number;
};

type FieldPhase = "idle" | "source" | "route-draw" | "travel" | "receive" | "decay";

function toRadians(value: number) {
  return value * (Math.PI / 180);
}

function toDegrees(value: number) {
  return value * (180 / Math.PI);
}

function interpolateGreatCircle(source: GeoPoint, destination: GeoPoint, segments = 42): GeoPoint[] {
  const phi1 = toRadians(source.lat);
  const phi2 = toRadians(destination.lat);
  const lambda1 = toRadians(source.lon);
  const lambda2 = toRadians(destination.lon);
  const distance = 2 * Math.asin(Math.min(1, Math.sqrt(
    Math.pow(Math.sin((phi2 - phi1) / 2), 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.pow(Math.sin((lambda2 - lambda1) / 2), 2)
  )));

  if (distance < 0.0001) return [source, destination];

  const sinDistance = Math.sin(distance);
  return Array.from({ length: segments + 1 }, (_, index) => {
    const progress = index / segments;
    const a = Math.sin((1 - progress) * distance) / sinDistance;
    const b = Math.sin(progress * distance) / sinDistance;
    const x = a * Math.cos(phi1) * Math.cos(lambda1) + b * Math.cos(phi2) * Math.cos(lambda2);
    const y = a * Math.cos(phi1) * Math.sin(lambda1) + b * Math.cos(phi2) * Math.sin(lambda2);
    const z = a * Math.sin(phi1) + b * Math.sin(phi2);

    return {
      lat: toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y))),
      lon: toDegrees(Math.atan2(y, x))
    };
  });
}

function projectRoutePoint(point: GeoPoint): ProjectedPoint {
  return projectFieldPoint(point.lat, point.lon);
}

function formatProjectedPoint(point: ProjectedPoint) {
  return `${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
}

function makeRouteSegment(points: ProjectedPoint[]): FieldRouteSegment {
  const length = points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);

  return {
    d: points.map((point, index) => `${index === 0 ? "M" : "L"}${formatProjectedPoint(point)}`).join(" "),
    length
  };
}

function buildRouteGeometry(source: FieldCity, destination: FieldCity) {
  const points = interpolateGreatCircle(source, destination);
  const projectedSegments: ProjectedPoint[][] = [[]];

  points.forEach((point, index) => {
    const projected = projectRoutePoint(point);

    if (index === 0) {
      projectedSegments[0].push(projected);
      return;
    }

    const previous = points[index - 1];
    if (Math.abs(point.lon - previous.lon) > 180) {
      const nextLon = point.lon + (previous.lon > 0 ? 360 : -360);
      const seamLon = previous.lon > 0 ? 180 : -180;
      const progress = (seamLon - previous.lon) / (nextLon - previous.lon);
      const seamLat = previous.lat + (point.lat - previous.lat) * progress;
      const seamPoint = projectRoutePoint({ lat: seamLat, lon: seamLon });
      const wrappedSeamPoint = projectRoutePoint({ lat: seamLat, lon: seamLon === 180 ? -180 : 180 });

      projectedSegments[projectedSegments.length - 1].push(seamPoint);
      projectedSegments.push([wrappedSeamPoint, projected]);
      return;
    }

    projectedSegments[projectedSegments.length - 1].push(projected);
  });

  const segments = projectedSegments
    .filter((segment) => segment.length > 1)
    .map(makeRouteSegment);

  return {
    path: segments.map((segment) => segment.d).join(" "),
    segments
  };
}

function makeFieldRoute(source: FieldCity, destination: FieldCity, sequence: number): FieldRoute {
  const geometry = buildRouteGeometry(source, destination);
  return {
    source,
    destination,
    ...geometry,
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

  const totalLength = route.segments.reduce((total, segment) => total + segment.length, 0);
  let elapsed = 0;
  const travelDuration = 2.35;

  return (
    <g className="field-transmission__packet" key={`packet-${route.sequence}`}>
      {route.segments.map((segment, index) => {
        const segmentDuration = Math.max(.24, travelDuration * (segment.length / totalLength));
        const begin = elapsed;
        elapsed += segmentDuration;

        return (
          <g key={`packet-segment-${route.sequence}-${index}`}>
            <circle className="field-transmission__packet-ring" r="5">
              <animateMotion dur={`${segmentDuration}s`} begin={`${begin}s`} path={segment.d} rotate="auto" fill="remove" />
              <animate attributeName="opacity" values="0;.55;.22;0" dur={`${segmentDuration}s`} begin={`${begin}s`} fill="remove" />
            </circle>
            <circle className="field-transmission__particle" r="2.7">
              <animateMotion dur={`${segmentDuration}s`} begin={`${begin}s`} path={segment.d} rotate="auto" fill="remove" />
              <animate attributeName="opacity" values="0;1;1;0" dur={`${segmentDuration}s`} begin={`${begin}s`} fill="remove" />
            </circle>
          </g>
        );
      })}
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
        <path className={`field-transmission__tail is-${phase}`} d={route.path} pathLength="1" />

        <g className="field-cities">
          {fieldCities.map((city) => {
            const isSource = sourceActive && city.id === route.source.id;
            const isDestination = destinationActive && city.id === route.destination.id;
            const labelX = city.x + city.labelDx;
            const labelY = city.y + city.labelDy;
            const leaderX = city.x + city.labelDx * .58;
            const leaderY = city.y + city.labelDy * .58;

            return (
              <g className={`field-city${isSource ? " is-source" : ""}${isDestination ? " is-destination" : ""}`} key={city.id}>
                <path className="field-city__leader" d={`M${city.x.toFixed(1)} ${city.y.toFixed(1)} L${leaderX.toFixed(1)} ${leaderY.toFixed(1)} L${labelX.toFixed(1)} ${(labelY - 3).toFixed(1)}`} />
                <circle className="field-city__halo" cx={city.x} cy={city.y} r="7" />
                <circle className="field-city__dot" cx={city.x} cy={city.y} r="2.6" />
                <text className="field-city__label" x={labelX} y={labelY}>{city.short}</text>
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
