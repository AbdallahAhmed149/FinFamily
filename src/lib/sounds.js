// أصوات التطبيق (Kenney.nl — CC0، الملفات في public/sounds/<event>.mp3).
//
// الاستخدام:   import { play } from "@/lib/sounds";   play("correct");
// الـ events:   tap back open correct wrong locked coin coins freeze questDone badge win finish soft levelUp
// لتغيير صوت: بدّل الملف في public/sounds بنفس الاسم (مفيش كود يتغير).
//
// - الكتم محفوظ في localStorage وبيتحكم فيه SoundToggle.
// - كل الاستدعاءات آمنة: لو المتصفح منع التشغيل (قبل أول لمسة) أو الملف مش موجود، مفيش error.

const STORAGE_KEY = "ff_sound_muted";

export const SOUND_EVENTS = [
  "tap", "back", "open", "correct", "wrong", "locked", "coin", "coins",
  "freeze", "questDone", "badge", "win", "finish", "soft", "levelUp",
];

// مستوى كل صوت (0..1) — الملفات نفسها متظبطة، ده بس ضبط نهائي بالنسبة لبعض.
const VOLUME = { tap: 0.5, back: 0.5, locked: 0.5, correct: 0.7, wrong: 0.6, levelUp: 0.9, win: 0.85 };
const DEFAULT_VOLUME = 0.75;

const base = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL) || "/";

let muted = false;
try { muted = window.localStorage.getItem(STORAGE_KEY) === "1"; } catch { /* خصوصية/تخزين مقفول */ }

const cache = {};
const listeners = new Set();

function getAudio(event) {
  if (!cache[event]) {
    const a = new Audio(`${base}sounds/${event}.mp3`);
    a.preload = "auto";
    cache[event] = a;
  }
  return cache[event];
}

/** شغّل صوت. بيرجع فورًا ومبيرميش error أبدًا. */
export function play(event) {
  if (muted) return;
  try {
    // cloneNode عشان نفس الصوت يقدر يشتغل مرتين فوق بعض (إجابات سريعة)
    const node = getAudio(event).cloneNode();
    node.volume = VOLUME[event] ?? DEFAULT_VOLUME;
    const p = node.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch { /* مفيش صوت = مفيش مشكلة */ }
}

/** حمّل الأصوات الأساسية مقدمًا (بنناديها عند أول لمسة). */
export function preloadSounds(events = SOUND_EVENTS) {
  if (muted) return;
  try { events.forEach(getAudio); } catch { /* تجاهل */ }
}

export const isMuted = () => muted;

export function setMuted(value) {
  muted = !!value;
  try { window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0"); } catch { /* تجاهل */ }
  listeners.forEach((l) => l());
}

// للـ useSyncExternalStore (SoundToggle)
export const subscribeMuted = (cb) => { listeners.add(cb); return () => listeners.delete(cb); };