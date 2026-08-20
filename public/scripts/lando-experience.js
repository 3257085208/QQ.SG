const canvas = document.querySelector("#ambientGL");
const hero = document.querySelector("#home");
const storySections = [...document.querySelectorAll(".intro, .archive, .message, .contact")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

let storyFrame = 0;

function renderStory() {
  storyFrame = 0;
  if (hero) {
    const progress = clamp(-hero.getBoundingClientRect().top / Math.max(1, hero.offsetHeight));
    hero.style.setProperty("--stage-shift", `${progress * -92}px`);
    hero.style.setProperty("--stage-scale", String(1 - progress * .08));
    hero.style.setProperty("--brand-shift", `${progress * 120}px`);
    hero.style.setProperty("--brand-scale", String(1 - progress * .1));
    hero.style.setProperty("--brand-opacity", String(Math.max(0, 1 - progress * 1.35)));
    hero.style.setProperty("--copy-shift", `${progress * 54}px`);
    hero.style.setProperty("--hero-copy-opacity", String(Math.max(0, 1 - progress * 1.5)));
    hero.style.setProperty("--race-shift", `${progress * 42}px`);
    hero.style.setProperty("--race-opacity", String(Math.max(0, 1 - progress * 1.4)));
    hero.style.setProperty("--note-shift", `${progress * 30}px`);
    hero.style.setProperty("--note-opacity", String(Math.max(0, 1 - progress * 1.5)));
  }

  storySections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + Math.min(rect.height, window.innerHeight * 1.35)));
    const horizontal = (1 - progress) * 48;
    section.style.setProperty("--story-x", `${section.classList.contains("contact") ? horizontal : -horizontal}px`);
    section.style.setProperty("--story-y", `${(1 - progress) * 52}px`);
    if (section.classList.contains("archive")) {
      section.querySelectorAll(".archive-card").forEach((card, index) => {
        card.style.setProperty("--story-y", `${(1 - progress) * (34 + index * 13)}px`);
      });
    }
  });
}

function queueStoryRender() {
  if (storyFrame) return;
  storyFrame = window.requestAnimationFrame(renderStory);
}

window.addEventListener("scroll", queueStoryRender, { passive: true });
window.addEventListener("resize", queueStoryRender, { passive: true });
queueStoryRender();

document.querySelectorAll(".archive-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(1, rect.width) - .5;
    const y = (event.clientY - rect.top) / Math.max(1, rect.height) - .5;
    card.style.setProperty("--tilt-x", `${y * -4.5}deg`);
    card.style.setProperty("--tilt-y", `${x * 5.5}deg`);
  }, { passive: true });
  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  }, { passive: true });
});

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function startAmbientField() {
  if (!canvas || !hero) return;
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl) return;

  const vertex = createShader(gl, gl.VERTEX_SHADER, `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = position * .5 + .5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    varying vec2 uv;
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 pointer;

    float ring(vec2 point, float radius, float width) {
      return 1.0 - smoothstep(0.0, width, abs(length(point) - radius));
    }

    void main() {
      vec2 point = uv * 2.0 - 1.0;
      point.x *= resolution.x / resolution.y;
      vec2 cursor = pointer * 2.0 - 1.0;
      cursor.x *= resolution.x / resolution.y;
      float drift = time * .08;
      vec2 orbit = point + vec2(sin(drift) * .07, cos(drift * 1.3) * .04);
      float contour = ring(orbit, .58 + sin(drift) * .015, .012);
      contour += ring(orbit, .82 + cos(drift * .8) * .02, .009) * .82;
      contour += ring(orbit, 1.08 + sin(drift * .6) * .018, .007) * .54;
      float pointerGlow = exp(-length(point - cursor) * 3.2) * .14;
      float diagonal = smoothstep(.015, 0.0, abs(point.y - point.x * .22 - sin(point.x * 4.0 + drift) * .06)) * .09;
      vec3 ink = vec3(.12, .13, .11);
      vec3 acid = vec3(.83, 1.0, .0);
      vec3 color = mix(ink, acid, .34 + pointerGlow * 2.0);
      float alpha = contour * .13 + pointerGlow + diagonal;
      gl_FragColor = vec4(color, alpha);
    }
  `);
  if (!vertex || !fragment) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const timeLocation = gl.getUniformLocation(program, "time");
  const resolutionLocation = gl.getUniformLocation(program, "resolution");
  const pointerLocation = gl.getUniformLocation(program, "pointer");
  const pointer = { x: .5, y: .5 };
  let visible = true;
  let start = performance.now();

  function resize() {
    const rect = hero.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw(now) {
    if (!visible) return;
    const elapsed = reduceMotion ? 0 : (now - start) / 1000;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(timeLocation, elapsed);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(pointerLocation, pointer.x, pointer.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    window.requestAnimationFrame(draw);
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = clamp((event.clientX - rect.left) / Math.max(1, rect.width));
    pointer.y = clamp(1 - (event.clientY - rect.top) / Math.max(1, rect.height));
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { pointer.x = .5; pointer.y = .5; }, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) window.requestAnimationFrame(draw); }, { threshold: 0.01 }).observe(hero);
  resize();
  window.requestAnimationFrame(draw);
}

startAmbientField();
