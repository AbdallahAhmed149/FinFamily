import React from "react";
import { ChevronLeft, X } from "lucide-react";

export default function GameOverlay({ title, icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-slide-up">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-border">
        <button onClick={onClose} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-2xl">{icon}</div>
        <h1 className="text-lg font-extrabold font-heading">{title}</h1>
        <button onClick={onClose} className="ml-auto w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}