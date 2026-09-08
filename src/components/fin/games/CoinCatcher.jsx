import React, { useEffect, useRef, useState } from "react";
import { Bomb, Timer } from "lucide-react";

export default function CoinCatcher({ onFinish }) {
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    if (!started || done) return;
    const spawn = setInterval(() => {
      const isBomb = Math.random() < 0.22;
      const id = idRef.current++;
      setItems((prev) => [...prev, { id, x: Math.random() * 78 + 6, isBomb }]);
      setTimeout(() => setItems((prev) => prev.filter((p) => p.id !== id)), 2400);
    }, 650);
    const timer = setInterval(() => setTime((t) => t - 1), 1000);
    return () => { clearInterval(spawn); clearInterval(timer); };
  }, [started, done]);

  useEffect(() => {
    if (time <= 0 && !done) { setDone(true); onFinish(score, 40); }
  }, [time, done, score, onFinish]);

  const catchItem = (item) => {
    setItems((prev) => prev.filter((p) => p.id !== item.id));
    setScore((s) => Math.max(0, s + (item.isBomb ? -5 : 2)));
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 pt-20 max-w-md mx-auto">
        <div className="text-7xl mb-4">🪙</div>
        <h2 className="text-2xl font-extrabold font-heading">Coin Catcher</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">Tap the falling coins to catch them (+2). Avoid the bombs (−5)! You have 20 seconds.</p>
        <button onClick={() => setStarted(true)} className="w-full max-w-xs h-14 rounded-2xl text-white font-bold font-heading grad-emerald shadow-glow-emerald active:scale-95 transition-all">
          Start ▶
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="glass rounded-full px-4 py-2 flex items-center gap-2 font-bold">
          🪙 <span>{score}</span>
        </div>
        <div className={"glass rounded-full px-4 py-2 flex items-center gap-2 font-bold " + (time <= 5 ? "text-red-500" : "")}>
          <Timer className="w-4 h-4" /> {Math.max(0, time)}s
        </div>
      </div>

      <div className="relative h-[62vh] rounded-3xl overflow-hidden grad-hero">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 2px, transparent 2px)", backgroundSize: "40px 40px" }} />
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => catchItem(item)}
            className="absolute top-0 text-3xl animate-fall active:scale-150 transition-transform"
            style={{ left: `${item.x}%` }}
          >
            {item.isBomb ? <Bomb className="w-8 h-8 text-red-400" /> : "🪙"}
          </button>
        ))}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="text-white text-center animate-pop">
              <div className="text-5xl mb-2">🏁</div>
              <div className="text-2xl font-extrabold">Final Score: {score}</div>
            </div>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3">Tap coins, dodge bombs!</p>
    </div>
  );
}