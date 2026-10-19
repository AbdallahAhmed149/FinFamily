// احتفالات بصرية (confetti). canvas-confetti كان متنصب في package.json ومش مستخدم في أي مكان.
// كلها بتحترم "تقليل الحركة" في إعدادات الجهاز (prefers-reduced-motion) — الأطفال الحساسين للحركة.
import confetti from "canvas-confetti";

const COLORS = ["#FFC857", "#00B894", "#3b82f6", "#7C3AED", "#ef4444", "#ffffff"];

const reducedMotion = () => {
  try { return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};

const fire = (opts) => {
  try { confetti({ colors: COLORS, disableForReducedMotion: true, zIndex: 200, ...opts }); } catch { /* canvas مش متاح */ }
};

/** دفعة واحدة صغيرة — نتيجة كويسة، استلام مهمة. */
export function burst(origin = { y: 0.65 }) {
  if (reducedMotion()) return;
  fire({ particleCount: 70, spread: 70, startVelocity: 38, origin });
}

/** احتفال كبير من الجنبين — Level-Up، فتح الصندوق، Perfect Day. */
export function bigCelebration(durationMs = 1400) {
  if (reducedMotion()) return;
  const end = Date.now() + durationMs;
  const frame = () => {
    fire({ particleCount: 5, angle: 60, spread: 60, startVelocity: 55, origin: { x: 0, y: 0.75 } });
    fire({ particleCount: 5, angle: 120, spread: 60, startVelocity: 55, origin: { x: 1, y: 0.75 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  fire({ particleCount: 120, spread: 100, startVelocity: 45, origin: { y: 0.55 } });
}