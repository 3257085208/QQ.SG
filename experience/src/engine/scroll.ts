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
  wheelMultiplier: 0.72,
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
    .to(name, { scaleX: 0.86, scaleY: 0.82, y: "-9vh", duration: 0.12, ease: "none" }, "fieldEnter")
    .to(nameLines[0], { x: "-10vw", y: "-9vh", opacity: 0.54, duration: 0.23, ease: "none" }, "fieldEnter")
    .to(nameLines[1], { x: "12vw", y: "10vh", opacity: 0.4, duration: 0.23, ease: "none" }, "fieldEnter")
    .to(field, { clipPath: "inset(9% 38% 9% 38%)", opacity: 0.28, scale: 0.98, duration: 0.12, ease: motion.hero.ease }, "fieldEnter")
    .to(name, { scaleX: 0.7, scaleY: 0.62, y: "-18vh", clipPath: "inset(0 0 86% 0)", opacity: 0.42, duration: 0.11, ease: motion.hero.ease }, "fieldEnter+=0.12")
    .to(field, { clipPath: "inset(0 0% 0 0%)", opacity: 1, scale: 1, duration: 0.13, ease: motion.hero.ease }, "fieldEnter+=0.10")
    .to(field, { scale: 1.004, duration: HERO_PHASE.handoff - HERO_PHASE.fieldDwell, ease: "none" }, "fieldDwell")
    .to(name, { x: "-2vw", y: "-28vh", scaleX: 0.54, scaleY: 0.52, opacity: 0, duration: 0.14, ease: "none" }, "handoff")
    .to(handoff, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, "handoff+=0.02")
    .to(field, { scale: 1.03, duration: HERO_PHASE.exit - HERO_PHASE.handoff - 0.08, ease: "none" }, "handoff+=0.08");
}

function setArchiveActive(stage: HTMLElement, cards: HTMLElement[], current: HTMLElement | null, progress: number, state: { index: number }) {
  const index = getChapterIndex(progress, cards.length, ARCHIVE_TIMING);
  if (index === state.index) return;
  state.index = index;
  const label = cards[index]?.dataset.archiveLabel;
  stage.dataset.active = String(index + 1).padStart(2, "0");
  if (current && label && current.textContent !== label) current.textContent = label;
}

function mountArchiveMotion(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>(".archive-stage");
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".archive-stage .archive-card"));
  const current = root.querySelector<HTMLElement>(".archive-stage__current");
  if (!stage || cards.length < 2) return;

  const activeState = { index: -1 };
  gsap.set(cards, { transformOrigin: "center center" });
  gsap.set(cards.slice(1), { x: "5vw", y: "4vh", scale: 0.92, opacity: 0.2, clipPath: "inset(0 0 0 76%)" });
  gsap.set(cards[0], { x: 0, y: 0, scale: 1, opacity: 1, clipPath: "inset(0 0 0 0%)" });
  setArchiveActive(stage, cards, current, 0, activeState);

  const sequence = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      scrub: motion.archive.scrub,
      invalidateOnRefresh: true,
      onUpdate: (self) => setArchiveActive(stage, cards, current, self.progress, activeState)
    }
  });

  sequence
    .addLabel("record-01-hold", 0)
    .to({}, { duration: ARCHIVE_TIMING.hold }, "record-01-hold");

  cards.slice(1).forEach((card, index) => {
    const previous = cards[index];
    const transitionStart = (index + 1) * ARCHIVE_TIMING.hold + index * ARCHIVE_TIMING.transition;
    const cardNumber = String(index + 2).padStart(2, "0");

    sequence
      .addLabel(`record-${cardNumber}-enter`, transitionStart)
      .addLabel(`record-${cardNumber}-hold`, transitionStart + ARCHIVE_TIMING.transition)
      .to(previous, { x: "-5vw", y: "-5vh", scale: 0.88, opacity: 0.42, duration: ARCHIVE_TIMING.transition, ease: motion.archive.ease }, transitionStart)
      .fromTo(card,
        { x: "5vw", y: "4vh", scale: 0.92, opacity: 0.2, clipPath: "inset(0 0 0 76%)" },
        { x: 0, y: 0, scale: 1, opacity: 1, clipPath: "inset(0 0 0 0%)", duration: ARCHIVE_TIMING.transition, ease: "power2.out" },
        transitionStart
      )
      .to({}, { duration: ARCHIVE_TIMING.hold }, transitionStart + ARCHIVE_TIMING.transition);
  });
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
