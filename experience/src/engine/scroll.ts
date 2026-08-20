import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const motion = {
  ease: "power2.out",
  scrub: 0.85,
  duration: 0.8
};

export function mountScrollExperience(root: HTMLElement) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return () => undefined;

  const lenis = new Lenis({ autoRaf: false, duration: 1.05, smoothWheel: true, syncTouch: true, anchors: true });
  const ticker = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(ticker);
  lenis.on("scroll", ScrollTrigger.update);

  const context = gsap.context(() => {
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
      .to(".hero-window", { width: "min(100vw, 1220px)", height: "calc(100svh - 92px)", ease: motion.ease }, 0.08)
      .to(".infrastructure-field", { scale: 1.04, ease: "none" }, 0.42)
      .to(".hero-title", { opacity: 0.08, ease: "none" }, 0.47)
      .to(".hero-statement", { y: -18, opacity: 1, ease: motion.ease }, 0.52)
      .to(".hero-statement", { y: -54, opacity: 0, ease: motion.ease }, 0.82)
      .to(".hero-window", { y: -26, scale: 1.04, opacity: 0.35, ease: "none" }, 0.78);

    const timelineStage = root.querySelector<HTMLElement>(".timeline-stage");
    const timelineEntries = gsap.utils.toArray<HTMLElement>(".timeline-entry");
    const timelineYears = gsap.utils.toArray<HTMLElement>(".timeline-years span");
    if (timelineStage && timelineEntries.length) {
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
        if (index > 0) {
          timelineSequence.to(timelineEntries[index - 1], { y: -52, opacity: 0, duration: .42, ease: motion.ease }, index);
          timelineSequence.to(timelineYears[index - 1], { opacity: .14, scale: .98, duration: .28, ease: motion.ease }, index);
          timelineSequence.to(entry, { y: 0, opacity: 1, duration: .58, ease: motion.ease }, index + .08);
          timelineSequence.to(timelineYears[index], { opacity: .78, scale: 1, duration: .4, ease: motion.ease }, index + .08);
        }
      });
    }

    gsap.utils.toArray<HTMLElement>(".work-row").forEach((row, index) => {
      const visual = row.querySelector<HTMLElement>(".work-visual");
      if (!visual) return;
      gsap.fromTo(visual, { clipPath: "inset(0 0 0 100%)" }, {
        clipPath: "inset(0 0 0 0%)",
        ease: motion.ease,
        scrollTrigger: { trigger: row, start: "top 80%", end: "top 36%", scrub: motion.scrub + index * .08 }
      });
    });

    gsap.fromTo(".capability-row", { x: 45, opacity: .22 }, {
      x: 0,
      opacity: 1,
      stagger: .12,
      ease: motion.ease,
      scrollTrigger: { trigger: ".capabilities", start: "top 76%", end: "top 34%", scrub: motion.scrub }
    });

    gsap.fromTo(".system-map", { clipPath: "inset(0 100% 0 0)" }, {
      clipPath: "inset(0 0% 0 0)",
      ease: motion.ease,
      scrollTrigger: { trigger: ".system", start: "top 78%", end: "top 34%", scrub: motion.scrub }
    });

    gsap.fromTo(".contact-heading", { y: 70, opacity: .2 }, {
      y: 0,
      opacity: 1,
      ease: motion.ease,
      scrollTrigger: { trigger: ".contact", start: "top 78%", end: "top 36%", scrub: motion.scrub }
    });
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
