import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MOBILE_QUERY = "(max-width: 820px), (max-height: 500px) and (orientation: landscape)";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mountPressInteraction(target: HTMLElement) {
  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let active = false;

  const reset = () => {
    if (!active && pointerId === null) return;
    if (pointerId !== null && target.hasPointerCapture?.(pointerId)) target.releasePointerCapture(pointerId);
    pointerId = null;
    active = false;
    target.classList.remove("is-pressed");
    if (target.matches("button,[role=button]")) target.setAttribute("aria-pressed", "false");
    target.style.removeProperty("--touch-x");
    target.style.removeProperty("--touch-y");
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" || pointerId !== null) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    active = true;
    target.classList.add("is-pressed");
    if (target.matches("button,[role=button]")) target.setAttribute("aria-pressed", "true");
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is an enhancement; native scrolling remains the authority.
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!active || event.pointerId !== pointerId) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
      reset();
      return;
    }

    if (!target.dataset.touchVisual) return;
    const bounds = target.getBoundingClientRect();
    const x = clamp(((event.clientX - bounds.left) / Math.max(1, bounds.width) - .5) * 16, -8, 8);
    const y = clamp(((event.clientY - bounds.top) / Math.max(1, bounds.height) - .5) * 12, -6, 6);
    target.style.setProperty("--touch-x", `${x.toFixed(2)}px`);
    target.style.setProperty("--touch-y", `${y.toFixed(2)}px`);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId === pointerId) reset();
  };

  const onPointerCancel = () => reset();
  const onPointerLeave = () => {
    if (pointerId !== null && !target.hasPointerCapture?.(pointerId)) reset();
  };
  const onLostPointerCapture = () => reset();

  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointermove", onPointerMove);
  target.addEventListener("pointerup", onPointerUp);
  target.addEventListener("pointercancel", onPointerCancel);
  target.addEventListener("pointerleave", onPointerLeave);
  target.addEventListener("lostpointercapture", onLostPointerCapture);

  return () => {
    reset();
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointermove", onPointerMove);
    target.removeEventListener("pointerup", onPointerUp);
    target.removeEventListener("pointercancel", onPointerCancel);
    target.removeEventListener("pointerleave", onPointerLeave);
    target.removeEventListener("lostpointercapture", onLostPointerCapture);
  };
}

function mountScrollLinkedMotion(root: HTMLElement) {
  const intro = root.querySelector<HTMLElement>(".mobile-intro");
  const name = root.querySelector<HTMLElement>(".mobile-intro__name");
  const nameLines = Array.from(root.querySelectorAll<HTMLElement>(".mobile-intro__name span"));
  const statusFigure = root.querySelector<HTMLElement>(".mobile-status__image");
  const mobileExperience = root.querySelector<HTMLElement>(".mobile-experience");
  if (!intro || !name || nameLines.length < 3 || !statusFigure || !mobileExperience) return;

  mobileExperience.classList.add("has-mobile-motion");

  const context = gsap.context(() => {
    const heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: intro,
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    heroTimeline
      .to(name, { scale: .94, opacity: .72, duration: 1, ease: "none" }, 0)
      .to(nameLines[0], { x: "-3vw", duration: 1, ease: "none" }, 0)
      .to(nameLines[1], { x: "3vw", duration: 1, ease: "none" }, 0)
      .to(nameLines[2], { y: "2vh", duration: 1, ease: "none" }, 0);

    gsap.fromTo(statusFigure,
      { y: 12, scale: 1.02 },
      {
        y: -12,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: statusFigure,
          start: "top 92%",
          end: "bottom 8%",
          scrub: true,
          invalidateOnRefresh: true
        }
      }
    );
  }, root);

  return () => {
    mobileExperience.classList.remove("has-mobile-motion");
    context.revert();
  };
}

export function mountMobileExperience(root: HTMLElement) {
  const isMobile = window.matchMedia(MOBILE_QUERY).matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!isMobile) return () => undefined;

  const cleanups = Array.from(root.querySelectorAll<HTMLElement>("[data-touch-visual], [data-touch-row]")).map(mountPressInteraction);
  const scrollCleanup = reduced ? undefined : mountScrollLinkedMotion(root);

  return () => {
    cleanups.forEach((cleanup) => cleanup());
    scrollCleanup?.();
  };
}
