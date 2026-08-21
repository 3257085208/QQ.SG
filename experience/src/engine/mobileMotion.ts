import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MOBILE_QUERY = "(max-width: 820px), (max-height: 500px) and (orientation: landscape)";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const TAP_THRESHOLD = 12;

function mountPressInteraction(target: HTMLElement) {
  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let active = false;

  const reset = () => {
    if (!active && pointerId === null) return;
    pointerId = null;
    active = false;
    target.classList.remove("is-pressed");
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" || pointerId !== null) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    active = true;
    target.classList.add("is-pressed");
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!active || event.pointerId !== pointerId) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaY) > TAP_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
      reset();
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId === pointerId) reset();
  };

  const onPointerCancel = () => reset();
  const onPointerLeave = () => reset();

  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointermove", onPointerMove);
  target.addEventListener("pointerup", onPointerUp);
  target.addEventListener("pointercancel", onPointerCancel);
  target.addEventListener("pointerleave", onPointerLeave);

  return () => {
    reset();
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointermove", onPointerMove);
    target.removeEventListener("pointerup", onPointerUp);
    target.removeEventListener("pointercancel", onPointerCancel);
    target.removeEventListener("pointerleave", onPointerLeave);
  };
}

function mountPersistentInteractions(root: HTMLElement) {
  let activeVisual: HTMLElement | null = null;
  let activeSystemRow: HTMLElement | null = null;

  const getVisualContainer = (target: HTMLElement) => target.closest<HTMLElement>(".mobile-status__media, .mobile-archive__media") ?? target;

  const setVisualState = (target: HTMLElement, inspecting: boolean) => {
    const container = getVisualContainer(target);
    target.classList.toggle("is-inspecting", inspecting);
    container.classList.toggle("is-inspecting", inspecting);
    if (inspecting) {
      target.dataset.inspecting = "true";
      container.dataset.inspecting = "true";
    } else {
      delete target.dataset.inspecting;
      delete container.dataset.inspecting;
      target.style.removeProperty("--touch-x");
      target.style.removeProperty("--touch-y");
    }
    target.setAttribute("aria-pressed", String(inspecting));
    const label = target.dataset.inspectTarget === "archive" ? "NodeGet archive image" : "status screenshot";
    target.setAttribute("aria-label", inspecting ? `Exit ${label} inspection` : `Inspect ${label}`);
  };

  const exitVisual = (target: HTMLElement | null) => {
    if (!target) return;
    setVisualState(target, false);
    if (activeVisual === target) activeVisual = null;
  };

  const toggleVisual = (target: HTMLElement) => {
    if (activeVisual === target) {
      exitVisual(target);
      return;
    }
    exitVisual(activeVisual);
    activeVisual = target;
    setVisualState(target, true);
  };

  const setSystemRowState = (target: HTMLElement, selected: boolean) => {
    target.classList.toggle("is-active", selected);
    target.setAttribute("aria-pressed", String(selected));
  };

  const toggleSystemRow = (target: HTMLElement) => {
    if (activeSystemRow === target) {
      setSystemRowState(target, false);
      activeSystemRow = null;
      return;
    }
    if (activeSystemRow) setSystemRowState(activeSystemRow, false);
    activeSystemRow = target;
    setSystemRowState(target, true);
  };

  const mountInspectable = (target: HTMLElement) => {
    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let active = false;
    let skipClick = false;
    let skipClickTimer = 0;

    const markMoved = () => {
      skipClick = true;
      window.clearTimeout(skipClickTimer);
      skipClickTimer = window.setTimeout(() => { skipClick = false; }, 400);
    };

    const resetPress = () => {
      pointerId = null;
      active = false;
      target.classList.remove("is-pressed");
    };

    const updateTouchPosition = (event: PointerEvent) => {
      if (!target.classList.contains("is-inspecting")) return;
      const bounds = target.getBoundingClientRect();
      const x = clamp(((event.clientX - bounds.left) / Math.max(1, bounds.width) - .5) * 38, -19, 19);
      const y = clamp(((event.clientY - bounds.top) / Math.max(1, bounds.height) - .5) * 24, -12, 12);
      target.style.setProperty("--touch-x", `${x.toFixed(2)}px`);
      target.style.setProperty("--touch-y", `${y.toFixed(2)}px`);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || pointerId !== null) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      active = true;
      target.classList.add("is-pressed");
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!active || event.pointerId !== pointerId) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      const verticalScroll = Math.abs(deltaY) > TAP_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX);
      if (verticalScroll) {
        markMoved();
        exitVisual(target);
        resetPress();
        return;
      }
      if (Math.hypot(deltaX, deltaY) > TAP_THRESHOLD) {
        markMoved();
        target.classList.remove("is-pressed");
      }
      updateTouchPosition(event);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId === pointerId) resetPress();
    };

    const onPointerCancel = () => resetPress();
    const onPointerLeave = () => resetPress();
    const onClick = (event: MouseEvent) => {
      if (skipClick) {
        skipClick = false;
        window.clearTimeout(skipClickTimer);
        return;
      }
      toggleVisual(target);
      if (event.detail === 0) target.classList.remove("is-pressed");
    };

    target.addEventListener("pointerdown", onPointerDown);
    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
    target.addEventListener("pointercancel", onPointerCancel);
    target.addEventListener("pointerleave", onPointerLeave);
    target.addEventListener("click", onClick);

    return () => {
      window.clearTimeout(skipClickTimer);
      resetPress();
      exitVisual(target);
      target.removeEventListener("pointerdown", onPointerDown);
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("pointercancel", onPointerCancel);
      target.removeEventListener("pointerleave", onPointerLeave);
      target.removeEventListener("click", onClick);
    };
  };

  const mountSystemRow = (target: HTMLElement) => {
    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let active = false;
    let skipClick = false;
    let skipClickTimer = 0;

    const markMoved = () => {
      skipClick = true;
      window.clearTimeout(skipClickTimer);
      skipClickTimer = window.setTimeout(() => { skipClick = false; }, 400);
    };

    const resetPress = () => {
      pointerId = null;
      active = false;
      target.classList.remove("is-pressed");
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || pointerId !== null) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      active = true;
      target.classList.add("is-pressed");
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!active || event.pointerId !== pointerId) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (Math.abs(deltaY) > TAP_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
        markMoved();
        resetPress();
        return;
      }
      if (Math.hypot(deltaX, deltaY) > TAP_THRESHOLD) {
        markMoved();
        target.classList.remove("is-pressed");
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId === pointerId) resetPress();
    };

    const onPointerCancel = () => resetPress();
    const onPointerLeave = () => resetPress();
    const onClick = () => {
      if (skipClick) {
        skipClick = false;
        window.clearTimeout(skipClickTimer);
        return;
      }
      toggleSystemRow(target);
    };

    target.addEventListener("pointerdown", onPointerDown);
    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
    target.addEventListener("pointercancel", onPointerCancel);
    target.addEventListener("pointerleave", onPointerLeave);
    target.addEventListener("click", onClick);

    return () => {
      window.clearTimeout(skipClickTimer);
      resetPress();
      if (activeSystemRow === target) activeSystemRow = null;
      setSystemRowState(target, false);
      target.removeEventListener("pointerdown", onPointerDown);
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("pointercancel", onPointerCancel);
      target.removeEventListener("pointerleave", onPointerLeave);
      target.removeEventListener("click", onClick);
    };
  };

  const inspectTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-inspect-target]"));
  const systemRows = Array.from(root.querySelectorAll<HTMLElement>('[data-touch-row="system"]'));
  const visualCleanups = inspectTargets.map(mountInspectable);
  const systemCleanups = systemRows.map(mountSystemRow);
  let previousScrollY = window.scrollY;
  const onScroll = () => {
    const nextScrollY = window.scrollY;
    const delta = Math.abs(nextScrollY - previousScrollY);
    previousScrollY = nextScrollY;
    if (delta > 8) exitVisual(activeVisual);
  };
  const onRootClick = (event: MouseEvent) => {
    if (!activeVisual) return;
    const node = event.target as Node | null;
    if (!node || activeVisual.contains(node)) return;
    exitVisual(activeVisual);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  root.addEventListener("click", onRootClick);

  return () => {
    window.removeEventListener("scroll", onScroll);
    root.removeEventListener("click", onRootClick);
    visualCleanups.forEach((cleanup) => cleanup());
    systemCleanups.forEach((cleanup) => cleanup());
    exitVisual(activeVisual);
    if (activeSystemRow) setSystemRowState(activeSystemRow, false);
    activeVisual = null;
    activeSystemRow = null;
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

  const persistentCleanup = mountPersistentInteractions(root);
  const pressTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-touch-row]")).filter((target) => target.dataset.touchRow !== "system");
  const cleanups = pressTargets.map(mountPressInteraction);
  const scrollCleanup = reduced ? undefined : mountScrollLinkedMotion(root);

  return () => {
    cleanups.forEach((cleanup) => cleanup());
    persistentCleanup();
    scrollCleanup?.();
  };
}
