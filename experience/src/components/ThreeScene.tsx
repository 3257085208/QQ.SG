import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const surface: HTMLCanvasElement = canvas;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.1, 11);

    const renderer = new THREE.WebGLRenderer({ canvas: surface, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const root = new THREE.Group();
    root.position.y = -0.2;
    scene.add(root);

    const portraitMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.96 });
    const portrait = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      portraitMaterial
    );
    portrait.scale.set(4.15, 5.15, 1);
    portrait.position.z = 0.15;
    root.add(portrait);
    const texture = new THREE.TextureLoader().load("/virtual-helmet-v1-cutout.png", (loaded) => {
      const ratio = loaded.image.width / loaded.image.height;
      portrait.scale.set(5.15 * ratio, 5.15, 1);
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    portraitMaterial.map = texture;
    portraitMaterial.needsUpdate = true;

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x20221d, transparent: true, opacity: 0.16 });
    const acidMaterial = new THREE.MeshBasicMaterial({ color: 0xd5ff00, transparent: true, opacity: 0.75 });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.012, 8, 180), ringMaterial);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(3.72, 0.009, 8, 180), acidMaterial);
    const ringC = new THREE.Mesh(new THREE.TorusGeometry(4.18, 0.006, 8, 180), ringMaterial);
    ringA.rotation.set(Math.PI * 0.49, 0.18, -0.1);
    ringB.rotation.set(Math.PI * 0.5, -0.12, 0.21);
    ringC.rotation.set(Math.PI * 0.5, 0.32, -0.24);
    root.add(ringA, ringB, ringC);

    const particlePositions = new Float32Array(420 * 3);
    for (let index = 0; index < particlePositions.length; index += 3) {
      const radius = 3.3 + Math.random() * 2.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[index] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[index + 1] = radius * Math.cos(phi);
      particlePositions[index + 2] = radius * Math.sin(phi) * Math.sin(theta) - 1;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0x20221d, size: 0.018, transparent: true, opacity: 0.42 }));
    root.add(particles);

    const pointer = new THREE.Vector2();
    const target = new THREE.Vector2();
    let visible = true;
    let frame = 0;
    const clock = new THREE.Clock();

    function resize() {
      const rect = surface.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    function onPointerMove(event: PointerEvent) {
      const rect = surface.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * -2;
    }

    function animate() {
      if (!visible) return;
      frame = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      pointer.lerp(target, 0.055);
      root.rotation.y = pointer.x * 0.09;
      root.rotation.x = pointer.y * 0.055;
      portrait.rotation.z = Math.sin(elapsed * 0.34) * 0.006;
      ringA.rotation.z += 0.0009;
      ringB.rotation.z -= 0.00125;
      ringC.rotation.z += 0.00055;
      particles.rotation.y += 0.00035;
      renderer.render(scene, camera);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) animate();
    }, { threshold: 0.01 });
    observer.observe(surface);
    surface.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    resize();
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      surface.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      particleGeometry.dispose();
      (portrait.geometry as THREE.BufferGeometry).dispose();
      (ringA.geometry as THREE.BufferGeometry).dispose();
      (ringB.geometry as THREE.BufferGeometry).dispose();
      (ringC.geometry as THREE.BufferGeometry).dispose();
      portraitMaterial.dispose();
      ringMaterial.dispose();
      acidMaterial.dispose();
      renderer.dispose();
      texture.dispose();
    };
  }, []);

  return <canvas className="three-scene" ref={canvasRef} aria-hidden="true" />;
}
