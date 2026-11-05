"use client";

import { useEffect, useRef } from "react";
import styles from "./UniverseBackground.module.css";

interface Star {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  driftSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  age: number;
  lifespan: number;
  speed: number;
  length: number;
}

interface Vector2D {
  x: number;
  y: number;
}

const MAX_DEVICE_PIXEL_RATIO = 2;
const SHOOTING_STAR_CHANCE_PER_FRAME = 0.01;

function normalize(x: number, y: number): Vector2D {
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

const SHOOTING_STAR_DIRECTION = normalize(1, 0.45);

function createStars(width: number, height: number): Star[] {
  const count = Math.min(400, Math.max(90, Math.floor((width * height) / 2800)));

  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.3 + 0.3,
    brightness: Math.random() * 0.6 + 0.4,
    twinkleSpeed: Math.random() * 0.002 + 0.0007,
    twinklePhase: Math.random() * Math.PI * 2,
    driftSpeed: Math.random() * 0.12 + 0.03,
  }));
}

function spawnShootingStar(width: number, height: number): ShootingStar {
  return {
    x: Math.random() * width * 0.7,
    y: Math.random() * height * 0.35,
    age: 0,
    lifespan: 70 + Math.random() * 40,
    speed: 9 + Math.random() * 6,
    length: 140 + Math.random() * 120,
  };
}

/**
 * Full-screen animated starfield behind the page content.
 * Stars always twinkle. Drift, shooting stars, and nebula motion are skipped
 * when the visitor prefers reduced motion.
 */
export function UniverseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const canvas: HTMLCanvasElement = canvasElement;

    const contextOrNull = canvas.getContext("2d");
    if (!contextOrNull) return;
    // An explicit type keeps these values non-null inside the nested functions.
    const context: CanvasRenderingContext2D = contextOrNull;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let frameId = 0;

    function resize(): void {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      stars = createStars(width, height);
      shootingStars = [];
    }

    function drawStars(time: number): void {
      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.brightness * (0.35 + 0.65 * twinkle);

        if (!reduceMotion) {
          star.y += star.driftSpeed;
          if (star.y > height) star.y = 0;
        }

        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 244, 225, ${alpha})`;
        context.fill();
      }
    }

    function drawShootingStars(): void {
      shootingStars = shootingStars.filter((star) => star.age < star.lifespan);

      for (const star of shootingStars) {
        const tailX = star.x - SHOOTING_STAR_DIRECTION.x * star.length;
        const tailY = star.y - SHOOTING_STAR_DIRECTION.y * star.length;
        const fade = 1 - star.age / star.lifespan;

        const gradient = context.createLinearGradient(tailX, tailY, star.x, star.y);
        gradient.addColorStop(0, "rgba(255, 236, 200, 0)");
        gradient.addColorStop(1, `rgba(255, 236, 200, ${fade})`);

        context.beginPath();
        context.moveTo(tailX, tailY);
        context.lineTo(star.x, star.y);
        context.strokeStyle = gradient;
        context.lineWidth = 1.8;
        context.stroke();

        star.x += SHOOTING_STAR_DIRECTION.x * star.speed;
        star.y += SHOOTING_STAR_DIRECTION.y * star.speed;
        star.age++;
      }
    }

    function frame(time: number): void {
      context.clearRect(0, 0, width, height);
      drawStars(time);

      if (!reduceMotion) {
        if (Math.random() < SHOOTING_STAR_CHANCE_PER_FRAME) {
          shootingStars.push(spawnShootingStar(width, height));
        }
        drawShootingStars();
      }

      frameId = requestAnimationFrame(frame);
    }

    resize();
    frameId = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className={`${styles.nebula} ${styles.nebulaRose}`} />
      <div className={`${styles.nebula} ${styles.nebulaSage}`} />
      <div className={`${styles.nebula} ${styles.nebulaGold}`} />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className={styles.vignette} />
    </div>
  );
}