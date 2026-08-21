import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const motion = {
  ease: "power2.out",
  easeSoft: "power1.inOut",
  scrub: 0.85,
  normal: 0.8,
  slow: 1.2,
  distance: {
    small: 18,
    medium: 40
  }
};

function mountIntroMotion(root: HTMLElement) {
  const intro = root.querySelector<HTMLElement>(".intro");
  if (!intro) return;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: intro,
      start: "top top",
      end: "bottom bottom",
      scrub: motion.scrub,
      invalidateOnRefresh: true
    }
  });

  timeline
    .to(".intro-name", { y: "-14vh", scale: .86, ease: "none" }, 0)
    .to(".intro-topline, .intro-bottomline", { opacity: 0, y: -motion.distance.small, ease: "none" }, .08)
    .to(".intro-name", { opacity: 0, y: "-30vh", ease: motion.easeSoft }, .28)
    .to(".intro-field", { opacity: 1, clipPath: "inset(0 0% 0 0)", scale: 1, ease: motion.easeSoft }, .43)
    .to(".intro-handoff", { opacity: 1, y: 0, ease: motion.ease }, .7)
    .to(".intro-field", { scale: 1.025, ease: "none" }, .82);
}

function mountArchiveMotion(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".archive");
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".archive-card"));
  if (!section || !cards.length) return;

  cards.forEach((card, index) => {
    gsap.fromTo(card, { y: index % 2 ? motion.distance.small : motion.distance.medium, opacity: .82 }, {
      y: 0,
      opacity: 1,
      ease: motion.ease,
      scrollTrigger: { trigger: card, start: "top 88%", end: "top 56%", scrub: motion.scrub }
    });
  });
}

function mountWorkMotion(root: HTMLElement) {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>(".work-scene"));
  if (!scenes.length) return;

  scenes.forEach((scene, index) => {
    gsap.fromTo(scene, { y: index === 0 ? motion.distance.small : motion.distance.medium, opacity: .92 }, {
      y: 0,
      opacity: 1,
      ease: motion.ease,
      scrollTrigger: { trigger: scene, start: "top 90%", end: "top 60%", scrub: motion.scrub }
    });
  });
}

function mountSystemMotion(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".current-system");
  const bars = Array.from(root.querySelectorAll<HTMLElement>(".region-bar i"));
  if (!section || !bars.length) return;

  gsap.fromTo(bars, { scaleX: 0 }, {
    scaleX: 1,
    duration: motion.normal,
    stagger: .07,
    ease: motion.ease,
    scrollTrigger: { trigger: section, start: "top 72%", end: "top 42%", scrub: motion.scrub }
  });
}

export function mountScrollExperience(root: HTMLElement) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return () => undefined;

  const isMobile = window.matchMedia("(max-width: 820px), (max-height: 500px) and (orientation: landscape)").matches;
  if (isMobile) return () => undefined;

  const lenis = new Lenis({ autoRaf: false, duration: motion.slow, smoothWheel: true, syncTouch: true, anchors: true });
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
  window.addEventListener("resize", refresh, { passive: true });
  window.setTimeout(refresh, 250);

  return () => {
    window.removeEventListener("resize", refresh);
    context.revert();
    gsap.ticker.remove(ticker);
    lenis.destroy();
  };
}
