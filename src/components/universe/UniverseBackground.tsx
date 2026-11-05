"use client";

import { useEffect, useRef } from "react";

type RGB = readonly [number, number, number];

interface PointerState {
  x: number;
  y: number;
  isInside: boolean;
  lastMovedAt: number;
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: RGB;
  gatherAngle: number;
  gatherRadius: number;
}

interface Planet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  light: RGB;
  dark: RGB;
  hasRing: boolean;
}

interface GalaxyParticle {
  angle: number;
  distance: number;
  size: number;
  alpha: number;
  color: RGB;
}

interface Galaxy {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  spin: number;
  cosTilt: number;
  sinTilt: number;
  glow: RGB;
  particles: GalaxyParticle[];
}

interface ShootingStar {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  speed: number;
  length: number;
  age: number;
  lifespan: number;
  color: RGB;
}

interface Scene {
  width: number;
  height: number;
  gather: number;
  stars: Star[];
  planets: Planet[];
  galaxies: Galaxy[];
  shootingStars: ShootingStar[];
}

const TAU = Math.PI * 2;
const MAX_DEVICE_PIXEL_RATIO = 2;
const GATHER_IDLE_MS = 450;
const GATHER_EASE = 0.035;
const GATHER_GLOW_RADIUS = 160;
const SHOOTING_STAR_CHANCE_PER_FRAME = 0.006;

const PALETTE = {
  cream: [255, 248, 236],
  butter: [255, 236, 170],
  pink: [255, 183, 210],
  lilac: [200, 180, 255],
  sky: [170, 218, 255],
  mint: [185, 245, 220],
} as const satisfies Record<string, RGB>;

const STAR_COLORS: readonly RGB[] = [
  PALETTE.cream,
  PALETTE.cream,
  PALETTE.butter,
  PALETTE.pink,
  PALETTE.sky,
  PALETTE.mint,
];

const GALAXY_COLORS: readonly RGB[] = [PALETTE.cream, PALETTE.pink, PALETTE.lilac, PALETTE.sky];

const PLANET_STYLES: readonly { light: RGB; dark: RGB; hasRing: boolean }[] = [
  { light: PALETTE.mint, dark: [143, 227, 192], hasRing: false },
  { light: PALETTE.pink, dark: [247, 163, 201], hasRing: true },
  { light: PALETTE.butter, dark: [255, 217, 138], hasRing: false },
  { light: PALETTE.lilac, dark: [185, 162, 245], hasRing: false },
  { light: PALETTE.sky, dark: [140, 200, 245], hasRing: true },
];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function rgba(color: RGB, alpha: number): string {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

/** Keeps a value inside [min, max] by wrapping it to the other side. */
function wrapAround(value: number, min: number, max: number): number {
  if (value < min) return value + (max - min);
  if (value > max) return value - (max - min);
  return value;
}

function createStar(width: number, height: number): Star {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: rand(-0.05, 0.05),
    vy: rand(-0.08, 0.08),
    radius: rand(0.4, 1.8),
    brightness: rand(0.45, 1),
    twinkleSpeed: rand(0.0008, 0.0025),
    twinklePhase: rand(0, TAU),
    color: pick(STAR_COLORS),
    gatherAngle: rand(0, TAU),
    gatherRadius: rand(18, 140),
  };
}

function createStars(width: number, height: number): Star[] {
  const count = Math.min(260, Math.max(120, Math.floor((width * height) / 5000)));
  return Array.from({ length: count }, () => createStar(width, height));
}

function createPlanet(style: (typeof PLANET_STYLES)[number], width: number, height: number): Planet {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: rand(-0.15, 0.15),
    vy: rand(-0.08, 0.08),
    radius: rand(14, 34),
    light: style.light,
    dark: style.dark,
    hasRing: style.hasRing,
  };
}

function createGalaxyParticle(radius: number): GalaxyParticle {
  const distance = Math.pow(Math.random(), 0.8) * radius;
  const arm = Math.random() < 0.5 ? 0 : Math.PI;
  const progress = distance / radius;

  return {
    angle: arm + progress * 3.4 + rand(-0.3, 0.3),
    distance,
    size: rand(0.5, 1.5),
    alpha: rand(0.35, 0.9) * (1 - progress * 0.6),
    color: pick(GALAXY_COLORS),
  };
}

function createGalaxy(x: number, y: number, radius: number): Galaxy {
  const tilt = rand(0.4, 1.1);
  const direction = Math.random() < 0.5 ? -1 : 1;

  return {
    x,
    y,
    radius,
    rotation: rand(0, TAU),
    spin: direction * rand(0.00015, 0.0004),
    cosTilt: Math.cos(tilt),
    sinTilt: Math.sin(tilt),
    glow: pick([PALETTE.pink, PALETTE.lilac, PALETTE.sky]),
    particles: Array.from({ length: 150 }, () => createGalaxyParticle(radius)),
  };
}

function createScene(width: number, height: number): Scene {
  const shortSide = Math.min(width, height);

  return {
    width,
    height,
    gather: 0,
    stars: createStars(width, height),
    planets: PLANET_STYLES.map((style) => createPlanet(style, width, height)),
    galaxies: [
      createGalaxy(width * 0.18, height * 0.32, shortSide * 0.22),
      createGalaxy(width * 0.84, height * 0.76, shortSide * 0.17),
    ],
    shootingStars: [],
  };
}

function spawnShootingStar(scene: Scene): ShootingStar {
  const angle = rand(0.35, 0.55);

  return {
    x: rand(0, scene.width * 0.7),
    y: rand(0, scene.height * 0.35),
    dirX: Math.cos(angle),
    dirY: Math.sin(angle),
    speed: rand(9, 15),
    length: rand(140, 260),
    age: 0,
    lifespan: rand(70, 110),
    color: pick([PALETTE.pink, PALETTE.sky, PALETTE.butter]),
  };
}

function moveStars(scene: Scene): void {
  for (const star of scene.stars) {
    star.x = wrapAround(star.x + star.vx, 0, scene.width);
    star.y = wrapAround(star.y + star.vy, 0, scene.height);
  }
}

function movePlanets(scene: Scene): void {
  for (const planet of scene.planets) {
    const margin = planet.radius * 2;
    planet.x = wrapAround(planet.x + planet.vx, -margin, scene.width + margin);
    planet.y = wrapAround(planet.y + planet.vy, -margin, scene.height + margin);
  }
}

function spinGalaxies(scene: Scene): void {
  for (const galaxy of scene.galaxies) {
    galaxy.rotation += galaxy.spin;
  }
}

function updateShootingStars(scene: Scene): void {
  if (Math.random() < SHOOTING_STAR_CHANCE_PER_FRAME) {
    scene.shootingStars.push(spawnShootingStar(scene));
  }

  scene.shootingStars = scene.shootingStars.filter((star) => star.age < star.lifespan);

  for (const star of scene.shootingStars) {
    star.x += star.dirX * star.speed;
    star.y += star.dirY * star.speed;
    star.age++;
  }
}

/** Advances the scene one step. Gather strength eases toward 1 when the cursor has been still. */
function updateScene(scene: Scene, pointer: PointerState, now: number): void {
  const isIdle = pointer.isInside && now - pointer.lastMovedAt > GATHER_IDLE_MS;
  scene.gather += ((isIdle ? 1 : 0) - scene.gather) * GATHER_EASE;

  moveStars(scene);
  movePlanets(scene);
  spinGalaxies(scene);
  updateShootingStars(scene);
}

/** Blends a star from its drifting position toward an orbit around the cursor. */
function positionStar(
  star: Star,
  gather: number,
  pointer: PointerState,
  now: number,
): { x: number; y: number } {
  if (gather < 0.001) return { x: star.x, y: star.y };

  const orbit = star.gatherAngle + now * 0.0008;
  const targetX = pointer.x + Math.cos(orbit) * star.gatherRadius;
  const targetY = pointer.y + Math.sin(orbit) * star.gatherRadius;

  return {
    x: star.x + (targetX - star.x) * gather,
    y: star.y + (targetY - star.y) * gather,
  };
}

function drawGalaxy(ctx: CanvasRenderingContext2D, galaxy: Galaxy): void {
  const glow = ctx.createRadialGradient(galaxy.x, galaxy.y, 0, galaxy.x, galaxy.y, galaxy.radius);
  glow.addColorStop(0, rgba(galaxy.glow, 0.28));
  glow.addColorStop(1, rgba(galaxy.glow, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(galaxy.x, galaxy.y, galaxy.radius, 0, TAU);
  ctx.fill();

  for (const particle of galaxy.particles) {
    const angle = particle.angle + galaxy.rotation;
    const localX = Math.cos(angle) * particle.distance;
    const localY = Math.sin(angle) * particle.distance * 0.42;
    const x = galaxy.x + localX * galaxy.cosTilt - localY * galaxy.sinTilt;
    const y = galaxy.y + localX * galaxy.sinTilt + localY * galaxy.cosTilt;

    ctx.beginPath();
    ctx.arc(x, y, particle.size, 0, TAU);
    ctx.fillStyle = rgba(particle.color, particle.alpha);
    ctx.fill();
  }
}

function drawRing(ctx: CanvasRenderingContext2D, planet: Planet): void {
  ctx.save();
  ctx.translate(planet.x, planet.y);
  ctx.rotate(-0.35);
  ctx.scale(1, 0.3);
  ctx.beginPath();
  ctx.arc(0, 0, planet.radius * 1.8, 0, TAU);
  ctx.strokeStyle = rgba(PALETTE.butter, 0.8);
  ctx.lineWidth = planet.radius * 0.16;
  ctx.stroke();
  ctx.restore();
}

function drawFace(ctx: CanvasRenderingContext2D, planet: Planet): void {
  const { x, y, radius } = planet;
  const ink = rgba([74, 53, 88], 0.85);

  ctx.fillStyle = ink;
  for (const offset of [-0.3, 0.3]) {
    ctx.beginPath();
    ctx.arc(x + radius * offset, y - radius * 0.05, radius * 0.08, 0, TAU);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(x, y + radius * 0.2, radius * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1, radius * 0.05);
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.fillStyle = rgba(PALETTE.pink, 0.6);
  for (const offset of [-0.5, 0.5]) {
    ctx.beginPath();
    ctx.ellipse(x + radius * offset, y + radius * 0.2, radius * 0.12, radius * 0.07, 0, 0, TAU);
    ctx.fill();
  }
}

function drawPlanet(ctx: CanvasRenderingContext2D, planet: Planet): void {
  const { x, y, radius, light, dark, hasRing } = planet;

  const body = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, radius * 0.1, x, y, radius);
  body.addColorStop(0, rgba(light, 1));
  body.addColorStop(1, rgba(dark, 0.95));

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fillStyle = body;
  ctx.fill();

  if (hasRing) drawRing(ctx, planet);
  drawFace(ctx, planet);
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  star: Star,
  scene: Scene,
  pointer: PointerState,
  now: number,
): void {
  const { x, y } = positionStar(star, scene.gather, pointer, now);
  const twinkle = 0.5 + 0.5 * Math.sin(now * star.twinkleSpeed + star.twinklePhase);
  const alpha = Math.min(1, star.brightness * (0.35 + 0.65 * twinkle) + scene.gather * 0.35);

  ctx.beginPath();
  ctx.arc(x, y, star.radius + scene.gather * 0.6, 0, TAU);
  ctx.fillStyle = rgba(star.color, alpha);
  ctx.fill();
}

function drawCursorGlow(ctx: CanvasRenderingContext2D, pointer: PointerState, gather: number): void {
  const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, GATHER_GLOW_RADIUS);
  glow.addColorStop(0, rgba(PALETTE.pink, 0.25 * gather));
  glow.addColorStop(1, rgba(PALETTE.pink, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, GATHER_GLOW_RADIUS, 0, TAU);
  ctx.fill();
}

function drawShootingStar(ctx: CanvasRenderingContext2D, star: ShootingStar): void {
  const tailX = star.x - star.dirX * star.length;
  const tailY = star.y - star.dirY * star.length;
  const fade = 1 - star.age / star.lifespan;

  const gradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
  gradient.addColorStop(0, rgba(star.color, 0));
  gradient.addColorStop(1, rgba(star.color, fade));

  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(star.x, star.y);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawScene(ctx: CanvasRenderingContext2D, scene: Scene, pointer: PointerState, now: number): void {
  ctx.clearRect(0, 0, scene.width, scene.height);

  for (const galaxy of scene.galaxies) drawGalaxy(ctx, galaxy);
  for (const planet of scene.planets) drawPlanet(ctx, planet);
  if (scene.gather > 0.01) drawCursorGlow(ctx, pointer, scene.gather);
  for (const star of scene.stars) drawStar(ctx, star, scene, pointer, now);
  for (const shootingStar of scene.shootingStars) drawShootingStar(ctx, shootingStar);
}

/**
 * Full-screen cosmic background: drifting planets, spiral galaxies, twinkling stars,
 * and stars that gather around the cursor when it pauses.
 * With reduced motion enabled, it draws one still frame and does not animate.
 */
export function UniverseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer: PointerState = { x: 0, y: 0, isInside: false, lastMovedAt: 0 };
    let scene: Scene | null = null;
    let frameId = 0;

    const renderFrame = (now: number): void => {
      if (!scene) return;

      if (!reduceMotion) updateScene(scene, pointer, now);
      drawScene(ctx, scene, pointer, now);

      if (!reduceMotion) frameId = requestAnimationFrame(renderFrame);
    };

    const resize = (): void => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      scene = createScene(width, height);
      if (reduceMotion) renderFrame(0);
    };

    const handlePointerMove = (event: PointerEvent): void => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.isInside = true;
      pointer.lastMovedAt = performance.now();
    };

    const handlePointerOut = (event: PointerEvent): void => {
      if (event.relatedTarget === null) pointer.isInside = false;
    };

    resize();
    window.addEventListener("resize", resize);

    if (!reduceMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerout", handlePointerOut);
      frameId = requestAnimationFrame(renderFrame);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,183,210,0.18),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(170,218,255,0.16),transparent_60%)]" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}