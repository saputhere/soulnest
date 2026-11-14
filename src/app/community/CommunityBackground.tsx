/** Fixed, animated backdrop: drifting color glows and twinkling stars. Pure CSS, so it needs no client JavaScript. */

const KEYFRAMES = `
@keyframes cb-drift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(40px, -30px, 0) scale(1.08); }
}
@keyframes cb-twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
.cb-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(90px);
  opacity: 0.45;
  animation: cb-drift 22s ease-in-out infinite;
}
.cb-orb-1 { width: 36rem; height: 36rem; left: -10rem; top: -8rem; background: #ffb8d6; }
.cb-orb-2 { width: 40rem; height: 40rem; right: -12rem; top: 30%; background: #8fe3c0; animation-duration: 28s; }
.cb-orb-3 { width: 30rem; height: 30rem; left: 30%; bottom: -12rem; background: #b9a2f5; animation-duration: 32s; }
.cb-star {
  position: absolute;
  border-radius: 9999px;
  background: #fff4fb;
  animation: cb-twinkle 4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .cb-orb, .cb-star { animation: none; }
}
`;

// Fixed positions, not random, so the server and browser render identical markup.
const STARS = Array.from({ length: 45 }, (_, index) => ({
  left: (index * 37) % 100,
  top: (index * 53) % 100,
  size: 1 + (index % 3),
  delay: (index % 7) * 0.8,
  duration: 3 + (index % 5),
}));

export function CommunityBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#1b1433]">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div className="cb-orb cb-orb-1" />
      <div className="cb-orb cb-orb-2" />
      <div className="cb-orb cb-orb-3" />

      {STARS.map((star, index) => (
        <span
          key={index}
          className="cb-star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}