import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Start fade-out at 2.6 seconds, then navigate at 3.2 seconds
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 2600);

    const navTimer = setTimeout(() => {
      navigate("/onboarding");
    }, 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ease-in-out select-none ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(180deg, #031944 0%, #02102E 50%, #01102D 100%)",
      }}
    >
      <div className="relative w-full h-full max-w-lg max-h-[920px] flex items-center justify-center p-4">
        <img
          src="/splash.png"
          alt="FinFamily Splash"
          className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-1000 ease-out transform scale-100 animate-in fade-in zoom-in-95"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
          }}
        />
      </div>
    </div>
  );
}