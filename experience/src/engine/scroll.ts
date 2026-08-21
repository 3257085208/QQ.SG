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
  fieldEnter: 0.25,
  fieldDwell: 0.48,
  handoff: 0.78,
  exit: 1
} as const;

const ARCHIVE_TIMING = {
  hold: 0.76,
  transition: 0.24
} as const;

const WORK_TIMING = {
  hold: 0.66,
  transition: 0.34
} as const;

function getChapterIndex(progress: number, count: number, timing: typeof ARCHIVE_TIMING | typeof WORK_TIMING) {
  const total = count * timing.hold + Math.max(0, count - 1) * timing.transition;
  const timelineTime = Math.min(1, Math.max(0, progress)) * total;
  return Math.min(count - 1, Math.max(0, Math.floor(timelineTime / (timing.hold + timing.transition))));
}

function mountIntroMotion(root: HTMLElement) {
  const intro = root.querySelector<HTMLElement>(".intro");
  const name = root.querySelector<HTMLElement>(".intro-name");
  const nameLines = Array.from(root.querySelectorAll<HTMLElement>(".intro-name span"));
  const field = root.querySelector<HTMLElement>(".intro-field");
  const handoff = root.querySelector<HTMLElement>(".intro-handoff");
  if (!intro || !name || nameLines.length < 2 || !field || !handoff) return;

  gsap.set(nameLines, { transformOrigin: "center center" });

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
    .addLabel("fieldEnter", HERO_PHASE.fieldEnter)
    .addLabel("fieldDwell", HERO_PHASE.fieldDwell)
    .addLabel("handoff", HERO_PHASE.handoff)
    .addLabel("exit", HERO_PHASE.exit);

  timeline
    .to(".intro-topline, .intro-bottomline", { opacity: 0, y: -motion.distance.small, duration: 0.09, ease: "none" }, "identity+=0.16")
    .to(name, { opacity: 0.4, duration: 0.15, ease: "none" }, "fieldEnter")
    .to(name, { scaleX: 0.86, scaleY: 0.82, y: "-9vh", duration: HERO_PHASE.fieldDwell - HERO_PHASE.fieldEnter, ease: "none" }, "fieldEnter")
    .to(nameLines[0], { x: "-7vw", y: "-5vh", opacity: 0.82, duration: 0.18, ease: "none" }, "fieldEnter+=0.03")
    .to(nameLines[1], { x: "8vw", y: "6vh", opacity: 0.52, duration: 0.18, ease: "none" }, "fieldEnter+=0.03")
    .set(field, { clipPath: "inset(22% 22% 22% 22%)", opacity: 0, scale: 0.955 }, "fieldEnter")
    .to(field, { opacity: 0.38, scale: 0.97, duration: 0.07, ease: motion.hero.ease }, "fieldEnter")
    .to(field, { clipPath: "inset(10% 8% 10% 8%)", opacity: 0.62, scale: 0.985, duration: 0.08, ease: motion.hero.ease }, "fieldEnter+=0.07")
    .to(field, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, scale: 1, duration: 0.08, ease: motion.hero.ease }, "fieldEnter+=0.15")
    .to(field, { scale: 1.004, duration: HERO_PHASE.handoff - HERO_PHASE.fieldDwell, ease: "none" }, "fieldDwell")
    .to(name, { x: "-2vw", y: "-28vh", scaleX: 0.54, scaleY: 0.52, opacity: 0, duration: 0.14, ease: "none" }, "handoff")
    .to(handoff, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, "handoff+=0.02")
    .to(field, { scale: 1.03, duration: HERO_PHASE.exit - HERO_PHASE.handoff - 0.08, ease: "none" }, "handoff+=0.08");
}

function setArchiveActive(stage: HTMLElement, cards: HTMLElement[], current: HTMLElement | null, index: number, state: { index: number }) {
  const safeIndex = Math.min(cards.length - 1, Math.max(0, index));
  if (safeIndex === state.index) return;
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
  const current = root.querySelector<HTMLElement>(".archive-stage__current");
  if (!stage || !viewport || !deck || cards.length < 2) return;

  const activeState = { index: -1 };
  let geometry = { positions: [] as number[], metrics: [] as { offsetLeft: number; width: number }[], viewportWidth: 0 };
  const measure = () => {
    const viewportWidth = viewport.clientWidth;
    const metrics = cards.map((card) => ({ offsetLeft: card.offsetLeft, width: card.offsetWidth }));
    const positions = metrics.map(({ offsetLeft, width }) => viewportWidth / 2 - (offsetLeft + width / 2));
    return { positions, metrics, viewportWidth };
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
      const fade = Math.min(1, distance / (geometry.viewportWidth * .72));
      gsap.set(card, { opacity: 1 - fade * .66, scale: 1 - fade * .055 });
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

  let sequenceTime = 0;
  sequence.addLabel("archive-enter", sequenceTime);
  sequence.addLabel("record-01-hold", sequenceTime).to({}, { duration: ARCHIVE_TIMING.hold }, sequenceTime);
  sequenceTime += ARCHIVE_TIMING.hold;

  cards.slice(1).forEach((_, index) => {
    const cardNumber = String(index + 2).padStart(2, "0");
    sequence
      .addLabel(`record-${cardNumber}-enter`, sequenceTime)
      .to(deck, { x: () => geometry.positions[index + 1], duration: ARCHIVE_TIMING.transition + .06, ease: "power1.inOut" }, sequenceTime);
    sequenceTime += ARCHIVE_TIMING.transition + .06;
    sequence
      .addLabel(`record-${cardNumber}-hold`, sequenceTime)
      .to({}, { duration: ARCHIVE_TIMING.hold * .9 }, sequenceTime);
    sequenceTime += ARCHIVE_TIMING.hold * .9;
  });
  sequence.addLabel("archive-exit", sequenceTime);
}

function mountWorkIntroMotion(root: HTMLElement) {
  const intro = root.querySelector<HTMLElement>(".work-intro");
  const lines = Array.from(root.querySelectorAll<HTMLElement>(".work-intro__line"));
  if (!intro || lines.length !== 2) return;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: intro,
      start: "top 78%",
      end: "bottom 22%",
      scrub: motion.work.scrub,
      invalidateOnRefresh: true
    }
  });

  timeline
    .addLabel("convergence-enter", 0)
    .fromTo(lines[0], { x: "-12vw", opacity: .38 }, { x: 0, opacity: 1, duration: .62, ease: "power1.inOut" }, 0)
    .fromTo(lines[1], { x: "12vw", opacity: .38 }, { x: 0, opacity: 1, duration: .62, ease: "power1.inOut" }, 0)
    .addLabel("convergence-settled", .68);
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
