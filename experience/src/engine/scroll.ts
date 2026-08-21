import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const motion = {
  hero: { scrub: 0.72, ease: "power1.inOut" },
  archive: { scrub: 0.64, ease: "power1.inOut" },
  work: { scrub: 0.52, ease: "power2.out" },
  system: { scrub: 0.72, ease: "power2.out" },
  smoothing: 0.84,
  wheelMultiplier: 0.80,
  distance: { small: 18, medium: 40 }
};

const HERO_PHASE = {
  identity: 0,
  signatureEnter: 0.12,
  tracksEnter: 0.24,
  fieldEnter: 0.42,
  fieldDwell: 0.54,
  handoff: 0.78,
  exit: 1
} as const;

const WORK_TIMING = {
  hold: 0.66,
  transition: 0.34
} as const;

function getChapterIndex(progress: number, count: number, timing: typeof WORK_TIMING) {
  const total = count * timing.hold + Math.max(0, count - 1) * timing.transition;
  const timelineTime = Math.min(1, Math.max(0, progress)) * total;
  return Math.min(count - 1, Math.max(0, Math.floor(timelineTime / (timing.hold + timing.transition))));
}

function mountHeroMarqueeMotion(tracks: HTMLElement[]) {
  const trigger = tracks[0]?.closest<HTMLElement>(".intro");
  if (!trigger) return;

  tracks.forEach((track) => {
    const strip = track.querySelector<HTMLElement>(".intro-track__strip");
    const collection = strip?.querySelector<HTMLElement>(".intro-track__collection");
    if (!strip || !collection) return;

    const direction = track.dataset.marqueeDirection === "right" ? 1 : -1;
    const pixelsPerSecond = Math.max(24, Number(track.dataset.marqueeSpeed) || 48);
    const collectionWidth = Math.max(1, collection.getBoundingClientRect().width);
    const startX = direction > 0 ? -collectionWidth : 0;
    const endX = direction > 0 ? 0 : -collectionWidth;
    const loop = gsap.fromTo(
      strip,
      { x: startX },
      {
        x: endX,
        duration: Math.max(14, collectionWidth / pixelsPerSecond),
        ease: "none",
        repeat: -1
      }
    );

    ScrollTrigger.create({
      trigger,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => loop.timeScale(self.direction === 1 ? 1.12 : -0.72)
    });
  });
}

function mountIntroMotion(root: HTMLElement) {
  const intro = root.querySelector<HTMLElement>(".intro");
  const name = root.querySelector<HTMLElement>(".intro-name");
  const nameLines = Array.from(root.querySelectorAll<HTMLElement>(".intro-name span"));
  const field = root.querySelector<HTMLElement>(".intro-field");
  const handoff = root.querySelector<HTMLElement>(".intro-handoff");
  const trackWindow = root.querySelector<HTMLElement>(".intro-track-window");
  const tracks = Array.from(root.querySelectorAll<HTMLElement>(".intro-track"));
  const signature = root.querySelector<HTMLElement>(".intro-signature");
  const signatureMask = root.querySelector<HTMLElement>(".intro-signature__mask");
  const fieldRuntime = field?.querySelector<HTMLElement>(".infrastructure-field");
  const metadata = Array.from(root.querySelectorAll<HTMLElement>(".intro-topline, .intro-bottomline"));
  if (!intro || !name || nameLines.length < 2 || !field || !fieldRuntime || !handoff || !trackWindow || tracks.length !== 2 || !signature || !signatureMask) return;

  gsap.set(nameLines, { transformOrigin: "center center" });
  gsap.set(tracks, { x: 0 });
  gsap.set(signature, { autoAlpha: 0, xPercent: -50, yPercent: -50, x: -12, y: 8, scale: 0.96 });
  mountHeroMarqueeMotion(tracks);

  const signatureStart = "polygon(0 70%, 13% 43%, 34% 16%, 55% 0, 61% 0, 56% 35%, 38% 65%, 16% 100%, 0 100%)";
  const signatureMiddle = "polygon(0 44%, 16% 20%, 39% 2%, 62% 0, 82% 18%, 100% 43%, 100% 67%, 79% 96%, 50% 100%, 24% 86%, 0 69%)";
  const signatureFull = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
  gsap.set(signatureMask, { clipPath: signatureStart });
  gsap.set(fieldRuntime, { attr: { "data-scene-phase": "idle" } });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: intro,
      start: "top top",
      end: "bottom bottom",
      scrub: motion.hero.scrub,
      invalidateOnRefresh: true
    }
  });

  timeline
    .addLabel("identity", HERO_PHASE.identity)
    .addLabel("signatureEnter", HERO_PHASE.signatureEnter)
    .addLabel("tracksEnter", HERO_PHASE.tracksEnter)
    .addLabel("fieldEnter", HERO_PHASE.fieldEnter)
    .addLabel("fieldDwell", HERO_PHASE.fieldDwell)
    .addLabel("handoff", HERO_PHASE.handoff)
    .addLabel("exit", HERO_PHASE.exit);

  timeline
    .to(signature, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.07, ease: "power1.out" }, "signatureEnter")
    .to(signatureMask, { clipPath: signatureMiddle, duration: 0.065, ease: "power1.out" }, "signatureEnter")
    .to(signatureMask, { clipPath: signatureFull, duration: 0.1, ease: "power1.out" }, "signatureEnter+=0.065")
    .to(metadata, { opacity: 0.5, y: -8, duration: 0.12, ease: "none" }, "tracksEnter")
    .to(trackWindow, { opacity: 1, duration: 0.08, ease: "none" }, "tracksEnter")
    .to(name, { opacity: 0.04, scaleX: 0.92, scaleY: 0.9, y: "-4vh", duration: 0.1, ease: "none" }, "tracksEnter")
    .to(nameLines[0], { x: "-3vw", y: "-2vh", opacity: 0.05, duration: 0.11, ease: "none" }, "tracksEnter+=0.02")
    .to(nameLines[1], { x: "4vw", y: "3vh", opacity: 0.04, duration: 0.11, ease: "none" }, "tracksEnter+=0.02")
    .to(tracks[0], { x: "-56vw", duration: 0.22, ease: "none" }, "tracksEnter")
    .to(tracks[1], { x: "56vw", duration: 0.22, ease: "none" }, "tracksEnter")
    .to(signature, { autoAlpha: 0.1, x: "1vw", y: "-0.8vh", scale: 1.005, duration: 0.05, ease: "none" }, "tracksEnter")
    .set(field, { clipPath: "inset(22% 22% 22% 22%)", opacity: 0, scale: 0.955 }, "fieldEnter")
    .to(field, { opacity: 0.52, scale: 0.97, duration: 0.05, ease: motion.hero.ease }, "fieldEnter")
    .to(field, { clipPath: "inset(10% 8% 10% 8%)", opacity: 0.76, scale: 0.985, duration: 0.07, ease: motion.hero.ease }, "fieldEnter+=0.05")
    .to(field, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, scale: 1, duration: 0.07, ease: motion.hero.ease }, "fieldEnter+=0.12")
    .to(metadata, { opacity: 0, y: -motion.distance.small, duration: 0.09, ease: "none" }, "fieldEnter+=0.03")
    .to(name, { x: "-2vw", y: "-9vh", scaleX: 0.72, scaleY: 0.68, opacity: 0, duration: 0.12, ease: "none" }, "fieldEnter+=0.03")
    .to(signature, { autoAlpha: 0.08, x: "1vw", y: "-0.8vh", scale: 1.006, duration: 0.055, ease: "none" }, "fieldEnter")
    .to(trackWindow, { opacity: 0.28, y: "-1vh", duration: 0.055, ease: "none" }, "fieldEnter")
    .to(signature, { autoAlpha: 0, x: "1.4vw", y: "-1vh", scale: 1.01, duration: 0.075, ease: "none" }, "fieldEnter+=0.055")
    .to(trackWindow, { opacity: 0, y: "-4vh", duration: 0.075, ease: "none" }, "fieldEnter+=0.055")
    .set(fieldRuntime, { attr: { "data-scene-phase": "enter" } }, "fieldEnter")
    .set(fieldRuntime, { attr: { "data-scene-phase": "dwell" } }, "fieldDwell")
    .to(field, { scale: 1.004, duration: HERO_PHASE.handoff - HERO_PHASE.fieldDwell, ease: "none" }, "fieldDwell")
    .set(fieldRuntime, { attr: { "data-scene-phase": "handoff" } }, "handoff")
    .to(handoff, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, "handoff+=0.02")
    .to(field, { scale: 1.03, duration: HERO_PHASE.exit - HERO_PHASE.handoff - 0.08, ease: "none" }, "handoff+=0.08")
    .set(fieldRuntime, { attr: { "data-scene-phase": "idle" } }, "exit");
}

function setArchiveActive(stage: HTMLElement, cards: HTMLElement[], current: HTMLElement | null, index: number, state: { index: number }) {
  const safeIndex = Math.min(cards.length - 1, Math.max(0, index));
  if (safeIndex === state.index) return;
  cards.forEach((card, cardIndex) => {
    card.classList.toggle("is-active", cardIndex === safeIndex);
    if (cardIndex === safeIndex) card.classList.add("is-entered");
  });
  state.index = safeIndex;
  const label = cards[safeIndex]?.dataset.archiveLabel;
  stage.dataset.active = String(safeIndex + 1).padStart(2, "0");
  if (current && label && current.textContent !== label) current.textContent = label;
}

function mountArchiveMotion(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>(".archive-stage");
  const viewport = stage?.querySelector<HTMLElement>(".archive-stage__viewport");
  const deck = stage?.querySelector<HTMLElement>(".archive-deck");
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".archive-stage .archive-card"));
  const media = cards.map((card) => card.querySelector<HTMLElement>(".archive-card__image picture"));
  const current = root.querySelector<HTMLElement>(".archive-stage__current");
  if (!stage || !viewport || !deck || cards.length < 2) return;

  const activeState = { index: -1 };
  let appliedRunway = 0;
  let geometry = { positions: [] as number[], metrics: [] as { offsetLeft: number; width: number }[], viewportWidth: 0, runway: 0 };
  const measure = () => {
    const viewportWidth = viewport.clientWidth;
    const rawMetrics = cards.map((card) => ({ offsetLeft: card.offsetLeft, width: card.offsetWidth }));
    const startPadding = Math.max(0, viewportWidth / 2 - rawMetrics[0].width / 2);
    const endPadding = Math.max(0, viewportWidth / 2 - rawMetrics[rawMetrics.length - 1].width / 2);
    deck.style.setProperty("--archive-deck-start", `${startPadding}px`);
    deck.style.setProperty("--archive-deck-end", `${endPadding}px`);
    const metrics = cards.map((card) => ({ offsetLeft: card.offsetLeft, width: card.offsetWidth }));
    const positions = metrics.map(({ offsetLeft, width }) => viewportWidth / 2 - (offsetLeft + width / 2));
    const actualOverflow = Math.max(0, deck.scrollWidth - viewportWidth);
    const runway = actualOverflow / 0.9;
    const stageHeight = Math.ceil(viewport.clientHeight + runway);
    if (Math.abs(stageHeight - appliedRunway) > 1) {
      stage.style.setProperty("--archive-runway", `${stageHeight}px`);
      appliedRunway = stageHeight;
    }
    return { positions, metrics, viewportWidth, runway };
  };
  const updateFocus = (deckX: number) => {
    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const metric = geometry.metrics[index];
      const cardCenter = deckX + metric.offsetLeft + metric.width / 2;
      const distance = Math.abs(geometry.viewportWidth / 2 - cardCenter);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });
    if (nearest === activeState.index) return;
    cards.forEach((card, index) => {
      const offset = index - nearest;
      const adjacency = Math.abs(offset);
      const opacity = adjacency === 0 ? 1 : adjacency === 1 ? (offset < 0 ? 0.2 : 0.15) : 0.025;
      const scale = adjacency === 0 ? 1 : adjacency === 1 ? 0.965 : 0.94;
      gsap.set(card, { opacity, scale, zIndex: adjacency === 0 ? 3 : adjacency === 1 ? 2 : 1 });
    });
    setArchiveActive(stage, cards, current, nearest, activeState);
  };

  gsap.set(cards, { transformOrigin: "center center", clipPath: "inset(0% 0% 0% 0%)" });
  geometry = measure();
  gsap.set(deck, { x: geometry.positions[0] });
  updateFocus(geometry.positions[0]);

  const sequence = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      scrub: motion.archive.scrub,
      invalidateOnRefresh: true,
      onRefresh: () => {
        geometry = measure();
        const deckX = Number(gsap.getProperty(deck, "x"));
        updateFocus(Number.isFinite(deckX) ? deckX : geometry.positions[0]);
      }
    },
    onUpdate: () => {
      const deckX = Number(gsap.getProperty(deck, "x"));
      updateFocus(Number.isFinite(deckX) ? deckX : geometry.positions[0]);
    }
  });

  sequence
    .addLabel("archive-start", 0)
    .to(deck, { x: () => geometry.positions[geometry.positions.length - 1], duration: 1, ease: "none" }, 0)
    .addLabel("archive-travel", .04)
    .addLabel("archive-exit", .94);

  media.forEach((picture, index) => {
    if (!picture) return;
    const direction = index % 2 === 0 ? 1 : -1;
    gsap.fromTo(
      picture,
      { x: direction * -24 },
      {
        x: direction * 24,
        duration: 1,
        ease: "none",
        scrollTrigger: {
          trigger: cards[index],
          containerAnimation: sequence,
          start: "left right",
          end: "right left",
          scrub: true,
          invalidateOnRefresh: true
        }
      }
    );
  });
}

function mountWorkIntroMotion(root: HTMLElement) {
  const intro = root.querySelector<HTMLElement>(".work-intro");
  const copy = Array.from(root.querySelectorAll<HTMLElement>("[data-work-intro-copy]"));
  const media = Array.from(root.querySelectorAll<HTMLElement>("[data-work-intro-media]"));
  if (!intro || copy.length !== 2 || media.length !== 2) return;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: intro,
      start: "top top",
      end: "bottom bottom",
      scrub: motion.work.scrub,
      invalidateOnRefresh: true
    }
  });

  timeline
    .addLabel("convergence-enter", 0)
    .fromTo(copy[0], { x: "-5.5rem", y: "-1.5vh", opacity: .28 }, { x: 0, y: 0, opacity: 1, duration: .6, ease: "power1.inOut" }, 0)
    .fromTo(copy[1], { x: "5.5rem", y: "1.5vh", opacity: .28 }, { x: 0, y: 0, opacity: 1, duration: .6, ease: "power1.inOut" }, 0)
    .addLabel("text-settled", .6)
    .fromTo(media[0], { x: "-22rem", y: "14vh", scale: .94, opacity: .08 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: .84, ease: "power1.inOut" }, 0)
    .fromTo(media[1], { x: "22rem", y: "-14vh", scale: .94, opacity: .08 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: .84, ease: "power1.inOut" }, .02)
    .addLabel("media-settled", .84)
    .addLabel("takeover-complete", 1);
}

function mountWorkMotion(root: HTMLElement) {
  const sequenceRoot = root.querySelector<HTMLElement>(".work-sequence");
  const records = Array.from(root.querySelectorAll<HTMLElement>(".work-sequence__record"));
  const visuals = Array.from(root.querySelectorAll<HTMLElement>(".work-sequence__visual-item"));
  const current = root.querySelector<HTMLElement>(".work-sequence__current");
  const handoff = root.querySelector<HTMLElement>(".work-sequence__handoff-current");
  if (!sequenceRoot || records.length !== visuals.length || !records.length) return;

  const handoffLabels = ["ROWS → README TREE", "README TREE → ARTICLE INDEX", "ARTICLE INDEX → LIVE INDEX"];
  let activeIndex = -1;
  const updateActive = (index: number) => {
    const safeIndex = Math.min(records.length - 1, Math.max(0, index));
    if (safeIndex === activeIndex) return;
    activeIndex = safeIndex;
    const label = records[safeIndex].dataset.workLabel;
    sequenceRoot.dataset.active = records[safeIndex].dataset.workIndex ?? String(safeIndex + 1).padStart(2, "0");
    if (current && label && current.textContent !== label) current.textContent = label;
    if (handoff && handoff.textContent !== handoffLabels[safeIndex]) handoff.textContent = handoffLabels[safeIndex];
  };
  gsap.set(visuals, { transformOrigin: "center center", x: "3vw", y: "2vh", scale: 0.98, opacity: 0.38, clipPath: "inset(0 0 0 100%)" });
  gsap.set(visuals[0], { x: 0, y: 0, scale: 1, opacity: 1, clipPath: "inset(0 0 0 0%)" });
  records.forEach((record, index) => {
    const copy = record.querySelector<HTMLElement>(".work-copy");
    if (copy) gsap.set(copy, { y: index === 0 ? 0 : motion.distance.medium, opacity: index === 0 ? 1 : 0.46 });
  });
  updateActive(0);

  const sequence = gsap.timeline({
    scrollTrigger: {
      trigger: sequenceRoot,
      start: "top top",
      end: "bottom bottom",
      scrub: motion.work.scrub,
      invalidateOnRefresh: true,
      onUpdate: (self) => updateActive(getChapterIndex(self.progress, records.length, WORK_TIMING))
    }
  });

  sequence
    .addLabel("project-01-hold", 0)
    .to({}, { duration: WORK_TIMING.hold }, "project-01-hold");

  records.forEach((record, index) => {
    const copy = record.querySelector<HTMLElement>(".work-copy");
    if (copy && index > 0) {
      const enterStart = index * (WORK_TIMING.hold + WORK_TIMING.transition) - WORK_TIMING.transition + 0.14;
      sequence.to(copy, { y: 0, opacity: 1, duration: 0.2, ease: motion.work.ease }, enterStart);
    }
    if (index === 0) return;

    const previous = visuals[index - 1];
    const visual = visuals[index];
    const transitionStart = index * WORK_TIMING.hold + (index - 1) * WORK_TIMING.transition;
    const enterStart = transitionStart + 0.14;
    const projectNumber = String(index + 1).padStart(2, "0");
    sequence
      .addLabel(`project-${projectNumber}-enter`, transitionStart)
      .addLabel(`project-${projectNumber}-hold`, enterStart + 0.2)
      .to(previous, { x: "-2vw", y: "-2vh", scale: 0.95, opacity: 0.5, duration: 0.14, ease: motion.work.ease }, transitionStart)
      .fromTo(visual,
        { x: "3vw", y: "2vh", scale: 0.98, opacity: 0.38, clipPath: "inset(0 0 0 100%)" },
        { x: 0, y: 0, scale: 1, opacity: 1, clipPath: "inset(0 0 0 0%)", duration: 0.2, ease: motion.work.ease },
        enterStart
      )
      .to({}, { duration: WORK_TIMING.hold }, enterStart + 0.2);
  });
}

function mountSystemMotion(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".current-system");
  const bars = Array.from(root.querySelectorAll<HTMLElement>(".region-bar i"));
  if (!section || !bars.length) return;

  gsap.fromTo(bars, { scaleX: 0 }, {
    scaleX: 1,
    duration: 0.8,
    stagger: 0.07,
    ease: motion.system.ease,
    scrollTrigger: { trigger: section, start: "top 72%", end: "top 42%", scrub: motion.system.scrub }
  });
}

export function mountScrollExperience(root: HTMLElement) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return () => undefined;

  const isMobile = window.matchMedia("(max-width: 820px), (max-height: 500px) and (orientation: landscape)").matches;
  if (isMobile) return () => undefined;

  const lenis = new Lenis({ autoRaf: false, duration: motion.smoothing, wheelMultiplier: motion.wheelMultiplier, smoothWheel: true, syncTouch: true, anchors: true });
  const ticker = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(ticker);
  lenis.on("scroll", ScrollTrigger.update);

  const context = gsap.context(() => {
    mountIntroMotion(root);
    mountArchiveMotion(root);
    mountWorkIntroMotion(root);
    mountWorkMotion(root);
    mountSystemMotion(root);
  }, root);

  let refreshTimer = 0;
  const scheduleRefresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshTimer = 0;
      ScrollTrigger.refresh();
    }, 140);
  };
  scheduleRefresh();
  window.addEventListener("resize", scheduleRefresh, { passive: true });

  return () => {
    window.removeEventListener("resize", scheduleRefresh);
    window.clearTimeout(refreshTimer);
    refreshTimer = 0;
    context.revert();
    gsap.ticker.remove(ticker);
    lenis.destroy();
  };
}
