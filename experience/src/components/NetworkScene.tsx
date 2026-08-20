import { useEffect, useRef } from "react";
import * as THREE from "three";
import { networkNodes } from "../data";

type NodePoint = { label: string; x: number; y: number; z: number };

const positions = [
  { x: -3.6, y: 1.2, z: 0 },
  { x: -1.5, y: 1.9, z: -0.2 },
  { x: 0.4, y: 0.75, z: 0.2 },
  { x: 1.6, y: -1.0, z: -0.1 },
  { x: 3.6, y: 1.4, z: 0.15 },
  { x: 0, y: -0.2, z: 0.4 }
];

const nodes: NodePoint[] = networkNodes.map((node, index) => ({ label: node.label, ...positions[index] }));

const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [5, 2], [5, 1]];

export function NetworkScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const surface: HTMLCanvasElement = canvas;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 3.5, -3.5, 0.1, 20);
    camera.position.z = 8;
    const renderer = new THREE.WebGLRenderer({ canvas: surface, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const graph = new THREE.Group();
    scene.add(graph);
    const linePositions = new Float32Array(edges.length * 2 * 3);
    edges.forEach(([from, to], index) => {
      const start = nodes[from];
      const end = nodes[to];
      const offset = index * 6;
      linePositions[offset] = start.x;
      linePositions[offset + 1] = start.y;
      linePositions[offset + 2] = start.z;
      linePositions[offset + 3] = end.x;
      linePositions[offset + 4] = end.y;
      linePositions[offset + 5] = end.z;
    });
    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const linesMaterial = new THREE.LineBasicMaterial({ color: 0x20221d, transparent: true, opacity: 0.3 });
    graph.add(new THREE.LineSegments(linesGeometry, linesMaterial));

    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x20221d });
    const homeMaterial = new THREE.MeshBasicMaterial({ color: 0xb7ff2a });
    const nodeMeshes: THREE.Mesh[] = [];
    nodes.forEach((node, index) => {
      const mesh = new THREE.Mesh(new THREE.CircleGeometry(index === nodes.length - 1 ? 0.095 : 0.055, 16), index === nodes.length - 1 ? homeMaterial : nodeMaterial);
      mesh.position.set(node.x, node.y, node.z);
      graph.add(mesh);
      nodeMeshes.push(mesh);
    });

    const pulse = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), new THREE.MeshBasicMaterial({ color: 0xb7ff2a, transparent: true, opacity: 0.16 }));
    pulse.position.set(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y, -0.05);
    graph.add(pulse);

    const pointer = new THREE.Vector2();
    const target = new THREE.Vector2();
    let frame = 0;
    let visible = true;
    const startedAt = performance.now();

    function resize() {
      const rect = surface.getBoundingClientRect();
      const aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
      const height = 7;
      camera.left = -height * aspect / 2;
      camera.right = height * aspect / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
    }

    function move(event: PointerEvent) {
      const rect = surface.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * -2;
    }

    function animate() {
      if (!visible) return;
      frame = window.requestAnimationFrame(animate);
      const time = (performance.now() - startedAt) / 1000;
      pointer.lerp(target, 0.045);
      graph.rotation.y = pointer.x * 0.04;
      graph.rotation.x = pointer.y * 0.025;
      pulse.scale.setScalar(1 + Math.sin(time * 2.1) * 0.2);
      pulse.material.opacity = 0.11 + (Math.sin(time * 2.1) + 1) * 0.035;
      nodeMeshes.forEach((node, index) => {
        if (index !== nodes.length - 1) node.scale.setScalar(1 + Math.sin(time * 1.2 + index) * 0.08);
      });
      renderer.render(scene, camera);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) animate();
    }, { threshold: 0.01 });
    observer.observe(surface);
    surface.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    resize();
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      surface.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
      linesGeometry.dispose();
      linesMaterial.dispose();
      nodeMaterial.dispose();
      homeMaterial.dispose();
      (pulse.geometry as THREE.BufferGeometry).dispose();
      (pulse.material as THREE.Material).dispose();
      nodeMeshes.forEach((node) => (node.geometry as THREE.BufferGeometry).dispose());
      renderer.dispose();
    };
  }, []);

  return <canvas className="network-scene" ref={canvasRef} aria-label="Infrastructure network map" />;
}
