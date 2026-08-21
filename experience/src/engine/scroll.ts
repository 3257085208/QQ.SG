import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const motion = {
  hero: { scrub: 0.72, ease: "power1.inOut" },
  archive: { scrub: 0.64, ease: "power1.inOut" },
  work: { scrub: 0.52, ease: "power2.out" },
  system: { scrub: 0.72, ease: "power2.out" },
  smoothing: 1.05,
  distance: { small: 18, medium: 40 }
};

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
    .to(".intro-topline, .intro-bottomline", { opacity: 0, y: -motion.distance.small, duration: 0.14, ease: "none" }, 0.02)
    .to(name, { scaleX: 0.86, scaleY: 0.82, y: "-9vh", duration: 0.2, ease: "none" }, 0.04)
    .to(nameLines[0], { x: "-10vw", y: "-9vh", clipPath: "inset(0 78% 0 0)", opacity: 0.54, duration: 0.22, ease: "none" }, 0.14)
    .to(nameLines[1], { x: "12vw", y: "10vh", clipPath: "inset(0 0 0 78%)", opacity: 0.4, duration: 0.22, ease: "none" }, 0.14)
    .to(field, { clipPath: "inset(9% 38% 9% 38%)", opacity: 0.28, scale: 0.98, duration: 0.22, ease: motion.hero.ease }, 0.24)
    .to(name, { scaleX: 0.7, scaleY: 0.62, y: "-18vh", clipPath: "inset(0 0 86% 0)", opacity: 0.42, duration: 0.18, ease: motion.hero.ease }, 0.37)
    .to(field, { clipPath: "inset(3% 10% 3% 9%)", opacity: 0.72, scale: 1, duration: 0.16, ease: motion.hero.ease }, 0.46)
    .to(name, { x: "-2vw", y: "-28vh", scaleX: 0.54, scaleY: 0.52, opacity: 0, duration: 0.18, ease: "none" }, 0.56)
    .to(field, { clipPath: "inset(0 0% 0 0%)", opacity: 1, duration: 0.18, ease: motion.hero.ease }, 0.62)
    .to(handoff, { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" }, 0.73)
    .to(field, { scale: 1.03, duration: 0.14, ease: "none" }, 0.86);
}

function setArchiveActive(stage: HTMLElement, cards: HTMLElement[], current: HTMLElement | null, progress: number) {
  const index = Math.min(cards.length - 1, Math.max(0, Math.floor(progress * cards.length)));
  const label = cards[index]?.dataset.archiveLabel;
  stage.dataset.active = String(index + 1).padStart(2, "0");
  if (current && label && current.textContent !== label) current.textContent = label;
}

function mountArchiveMotion(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>(".archive-stage");
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".archive-stage .archive-card"));
  const current = root.querySelector<HTMLElement>(".archive-stage__current");
  if (!stage || cards.length < 2) return;

  gsap.set(cards, { transformOrigin: "center center" });
  gsap.set(cards.slice(1), { x: "5vw", y: "4vh", scale: 0.92, opacity: 0.2, clipPath: "inset(0 0 0 76%)" });
  gsap.set(cards[0], { x: 0, y: 0, scale: 1, opacity: 1, clipPath: "inset(0 0 0 0%)" });
  setArchiveActive(stage, cards, current, 0);

  const sequence = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      scrub: motion.archive.scrub,
      invalidateOnRefresh: true,
      onUpdate: (self) => setArchiveActive(stage, cards, current, self.progress)
    }
  });

  cards.slice(1).forEach((card, index) => {
    const previous = cards[index];
    const at = index + 1;

    sequence
      .to(previous, { x: "-5vw", y: "-5vh", scale: 0.88, opacity: 0.42, duration: 0.46, ease: motion.archive.ease }, at - 0.22)
      .to(previous, { clipPath: "inset(0 62% 0 0)", duration: 0.32, ease: motion.archive.ease }, at)
      .fromTo(card,
        { x: "5vw", y: "4vh", scale: 0.92, opacity: 0.2, clipPath: "inset(0 0 0 76%)" },
        { x: 0, y: 0, scale: 1, opacity: 1, clipPath: "inset(0 0 0 0%)", duration: 0.68, ease: "power2.out" },
        at - 0.02
      );
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
  const updateActive = (index: number) => {
    const safeIndex = Math.min(records.length - 1, Math.max(0, index));
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
      onUpdate: (self) => updateActive(Math.min(records.length - 1, Math.floor(self.progress * records.length)))
    }
  });

  records.forEach((record, index) => {
    const copy = record.querySelector<HTMLElement>(".work-copy");
    if (copy) sequence.to(copy, { y: 0, opacity: 1, duration: 0.46, ease: motion.work.ease }, index === 0 ? 0 : index - 0.02);
    if (index === 0) return;

    const previous = visuals[index - 1];
    const visual = visuals[index];
    const at = index;
    sequence
      .to(previous, { x: "-2vw", y: "-2vh", scale: 0.95, opacity: 0.5, duration: 0.42, ease: motion.work.ease }, at - 0.16)
      .to(previous, { clipPath: "inset(0 62% 0 0)", duration: 0.3, ease: motion.work.ease }, at + 0.02)
      .fromTo(visual,
        { x: "3vw", y: "2vh", scale: 0.98, opacity: 0.38, clipPath: "inset(0 0 0 100%)" },
        { x: 0, y: 0, scale: 1, opacity: 1, clipPath: "inset(0 0 0 0%)", duration: 0.58, ease: motion.work.ease },
        at
      );
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

  const lenis = new Lenis({ autoRaf: false, duration: motion.smoothing, smoothWheel: true, syncTouch: true, anchors: true });
  const ticker = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(ticker);
  lenis.on("scroll", ScrollTrigger.update);

  const context = gsap.context(() => {
    mountIntroMotion(root);
    mountArchiveMotion(root);
    mountWorkMotion(root);
    mountSystemMotion(root);
  }, root);

  const refresh = () => ScrollTrigger.refresh();
  let refreshTimer = window.setTimeout(refresh, 250);
  window.addEventListener("resize", refresh, { passive: true });

  return () => {
    window.removeEventListener("resize", refresh);
    window.clearTimeout(refreshTimer);
    refreshTimer = 0;
    context.revert();
    gsap.ticker.remove(ticker);
    lenis.destroy();
  };
}
