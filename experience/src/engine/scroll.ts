import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const motion = {
  ease: "power2.out",
  scrub: 0.85,
  duration: 0.8
};

function mountHeroMotion(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(".hero");
  const frame = root.querySelector<HTMLElement>(".hero__frame");
  if (!hero || !frame) return;

  const heroTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom bottom",
      scrub: motion.scrub,
      invalidateOnRefresh: true
    }
  });

  heroTimeline
    .to(".hero-title span:first-child", { x: "-9vw", y: "-3vh", scale: .9, ease: "none" }, 0)
    .to(".hero-title span:last-child", { x: "7vw", y: "4vh", scale: .9, ease: "none" }, 0)
    .to(".hero-aside", { x: 90, opacity: 0, ease: "none" }, 0)
    .to(".hero-topline, .hero-bottomline, .hero-rule", { opacity: 0, ease: "none" }, 0.08)
    .to(".hero-window", { width: "min(100vw, 1220px)", height: "calc(100svh - var(--header-height))", ease: motion.ease }, 0.08)
    .to(".infrastructure-field", { scale: 1.04, ease: "none" }, 0.42)
    .to(".hero-title", { opacity: 0.08, ease: "none" }, 0.47)
    .to(".hero-statement", { y: -18, opacity: 1, ease: motion.ease }, 0.52)
    .to(".hero-statement", { y: -54, opacity: 0, ease: motion.ease }, 0.82)
    .to(".hero-window", { y: -26, scale: 1.04, opacity: 0.35, ease: "none" }, 0.78);
}

function mountTimelineMotion(root: HTMLElement) {
  const timelineStage = root.querySelector<HTMLElement>(".timeline-stage");
  const timelineEntries = Array.from(root.querySelectorAll<HTMLElement>(".timeline-entry"));
  const timelineYears = Array.from(root.querySelectorAll<HTMLElement>(".timeline-years span"));
  if (!timelineStage || !timelineEntries.length) return;
  if (window.matchMedia("(max-width: 640px)").matches) return;

  gsap.set(timelineEntries, { opacity: 0, y: 52 });
  gsap.set(timelineYears, { opacity: .14, scale: .98 });
  gsap.set(timelineEntries[0], { opacity: 1, y: 0 });
  gsap.set(timelineYears[0], { opacity: .78, scale: 1 });

  const timelineSequence = gsap.timeline({
    scrollTrigger: {
      trigger: timelineStage,
      start: "top top",
      end: "bottom bottom",
      scrub: motion.scrub,
      invalidateOnRefresh: true
    }
  });

  timelineEntries.forEach((entry, index) => {
    if (index === 0) return;
    timelineSequence.to(timelineEntries[index - 1], { y: -52, opacity: 0, duration: .42, ease: motion.ease }, index);
    timelineSequence.to(timelineYears[index - 1], { opacity: .14, scale: .98, duration: .28, ease: motion.ease }, index);
    timelineSequence.to(entry, { y: 0, opacity: 1, duration: .58, ease: motion.ease }, index + .08);
    timelineSequence.to(timelineYears[index], { opacity: .78, scale: 1, duration: .4, ease: motion.ease }, index + .08);
  });
}

function mountWorkMotion(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>(".work-list");
  const rows = Array.from(root.querySelectorAll<HTMLElement>(".work-row"));
  const current = root.querySelector<HTMLElement>(".work-sequence-current");
  if (!list || !rows.length) return;
  if (window.matchMedia("(max-width: 640px)").matches) return;

  const sequence = gsap.timeline({
    scrollTrigger: {
      trigger: list,
      start: "top 70%",
      end: "bottom bottom",
      scrub: motion.scrub,
      invalidateOnRefresh: true,
      onUpdate: () => {
        if (!current) return;
        const focusLine = window.innerHeight * .56;
        let activeIndex = 0;
        rows.forEach((row, index) => {
          if (row.getBoundingClientRect().top <= focusLine) activeIndex = index;
        });
        current.textContent = rows[activeIndex].dataset.workLabel ?? `0${activeIndex + 1} / PROJECT`;
      }
    }
  });

  rows.forEach((row, index) => {
    const visual = row.querySelector<HTMLElement>(".work-visual");
    const copy = row.querySelector<HTMLElement>(".work-copy");
    if (!visual) return;

    if (index === 0) {
      sequence.fromTo(visual, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: .65, ease: motion.ease }, 0);
      return;
    }

    const previousVisual = rows[index - 1].querySelector<HTMLElement>(".work-visual");
    if (previousVisual) sequence.to(previousVisual, { x: -18, scale: .96, opacity: .58, duration: .5, ease: motion.ease }, index - .12);
    sequence.fromTo(visual, { clipPath: "inset(0 0 0 100%)", x: 55, opacity: .45 }, { clipPath: "inset(0 0 0 0%)", x: 0, opacity: 1, duration: .6, ease: motion.ease }, index);
    if (copy) sequence.fromTo(copy, { x: 30, opacity: .42 }, { x: 0, opacity: 1, duration: .52, ease: motion.ease }, index + .08);
  });
}

function mountCapabilitiesMotion(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".capabilities");
  const rows = root.querySelectorAll<HTMLElement>(".capability-row");
  if (!section || !rows.length) return;

  gsap.fromTo(rows, { x: 45, opacity: .22 }, {
    x: 0,
    opacity: 1,
    stagger: .12,
    ease: motion.ease,
    scrollTrigger: { trigger: section, start: "top 76%", end: "top 34%", scrub: motion.scrub }
  });
}

function mountSystemMotion(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".system");
  const map = root.querySelector<HTMLElement>(".system-map");
  if (!section || !map) return;

  gsap.fromTo(map, { clipPath: "inset(0 100% 0 0)" }, {
    clipPath: "inset(0 0% 0 0)",
    ease: motion.ease,
    scrollTrigger: { trigger: section, start: "top 78%", end: "top 34%", scrub: motion.scrub }
  });
}

function mountContactMotion(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".contact");
  const heading = root.querySelector<HTMLElement>(".contact-heading");
  if (!section || !heading) return;

  gsap.fromTo(heading, { y: 70, opacity: .2 }, {
    y: 0,
    opacity: 1,
    ease: motion.ease,
    scrollTrigger: { trigger: section, start: "top 78%", end: "top 36%", scrub: motion.scrub }
  });
}

export function mountScrollExperience(root: HTMLElement) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return () => undefined;

  const lenis = new Lenis({ autoRaf: false, duration: 1.05, smoothWheel: true, syncTouch: true, anchors: true });
  const ticker = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(ticker);
  lenis.on("scroll", ScrollTrigger.update);

  const context = gsap.context(() => {
    mountHeroMotion(root);
    mountTimelineMotion(root);
    mountWorkMotion(root);
    mountCapabilitiesMotion(root);
    mountSystemMotion(root);
    mountContactMotion(root);
  }, root);

  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("resize", refresh, { passive: true });
  window.setTimeout(refresh, 250);

  return () => {
    window.removeEventListener("resize", refresh);
    context.revert();
    gsap.ticker.remove(ticker);
    lenis.destroy();
  };
}
