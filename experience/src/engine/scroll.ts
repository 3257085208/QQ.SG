import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const motion = {
  ease: "power2.out",
  easeSoft: "power1.inOut",
  scrub: 0.85,
  fast: 0.45,
  normal: 0.8,
  slow: 1.2,
  distance: {
    small: 18,
    medium: 40,
    large: 64
  }
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
    .to(".hero-aside", { x: motion.distance.large, opacity: 0, ease: "none" }, 0)
    .to(".hero-topline, .hero-bottomline, .hero-rule", { opacity: 0, ease: "none" }, 0.08)
    .to(".hero-window", { width: "min(100vw, 1220px)", height: "calc(100svh - var(--header-height))", ease: motion.easeSoft }, 0.08)
    .to(".infrastructure-field", { scale: 1.04, ease: "none" }, 0.42)
    .to(".hero-title", { opacity: 0.08, ease: "none" }, 0.47)
    .to(".hero-statement", { y: -motion.distance.small, opacity: 1, ease: motion.ease }, 0.52)
    .to(".hero-statement", { y: -motion.distance.medium, opacity: 0, ease: motion.easeSoft }, 0.82)
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
    timelineSequence.to(timelineEntries[index - 1], { y: -motion.distance.medium, opacity: 0, duration: motion.fast, ease: motion.ease }, index);
    timelineSequence.to(timelineYears[index - 1], { opacity: .14, scale: .98, duration: motion.fast, ease: motion.ease }, index);
    timelineSequence.to(entry, { y: 0, opacity: 1, duration: motion.normal, ease: motion.ease }, index + .08);
    timelineSequence.to(timelineYears[index], { opacity: .78, scale: 1, duration: motion.fast, ease: motion.ease }, index + .08);
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
      sequence.fromTo(visual, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: motion.normal, ease: motion.ease }, 0);
      return;
    }

    const previousVisual = rows[index - 1].querySelector<HTMLElement>(".work-visual");
    if (previousVisual) sequence.to(previousVisual, { x: -motion.distance.small, scale: .96, opacity: .58, duration: motion.fast, ease: motion.ease }, index - .12);
    sequence.fromTo(visual, { clipPath: "inset(0 0 0 100%)", x: motion.distance.medium, opacity: .45 }, { clipPath: "inset(0 0 0 0%)", x: 0, opacity: 1, duration: motion.normal, ease: motion.easeSoft }, index);
    if (copy) sequence.fromTo(copy, { x: motion.distance.small, opacity: .42 }, { x: 0, opacity: 1, duration: motion.fast, ease: motion.ease }, index + .08);
  });
}

function mountCapabilitiesMotion(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".capabilities");
  const rows = root.querySelectorAll<HTMLElement>(".capability-row");
  if (!section || !rows.length) return;

  gsap.fromTo(rows, { x: motion.distance.medium, opacity: .22 }, {
    x: 0,
    opacity: 1,
    stagger: motion.fast / 4,
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

  gsap.fromTo(heading, { y: motion.distance.large, opacity: .2 }, {
    y: 0,
    opacity: 1,
    ease: motion.ease,
    scrollTrigger: { trigger: section, start: "top 78%", end: "top 36%", scrub: motion.scrub }
  });
}

export function mountScrollExperience(root: HTMLElement) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return () => undefined;

  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  const lenis = new Lenis({ autoRaf: false, duration: motion.slow, smoothWheel: true, syncTouch: !isMobile, anchors: true });
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
