"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GraffitiCelebrationProps {
  show: boolean;
  onComplete: () => void;
}

const graffitiMessages = [
  "BOOM! 💥",
  "LEVEL UP! 🚀",
  "PROGRESS! ⚡",
  "GROWTH! 🌱",
  "LEARNING! 🧠",
  "EVOLVING! 🦋",
  "CRUSHING IT! 💪",
  "DATA COLLECTED! 📊",
  "EXPERIENCE +1! ⭐",
  "WISDOM GAINED! 🎯",
  "BREAKTHROUGH! 💎",
  "UNSTOPPABLE! 🔥",
  "LEGEND MODE! 👑",
  "BEAST MODE! 🦁",
  "NEXT LEVEL! 🎮",
];

const colors = [
  "text-red-400",
  "text-blue-400",
  "text-green-400",
  "text-yellow-400",
  "text-purple-400",
  "text-pink-400",
  "text-orange-400",
  "text-cyan-400",
  "text-lime-400",
  "text-indigo-400",
];

export function GraffitiCelebration({
  show,
  onComplete,
}: GraffitiCelebrationProps) {
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Pick random message and color
      const randomMessage =
        graffitiMessages[Math.floor(Math.random() * graffitiMessages.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      setMessage(randomMessage);
      setColor(randomColor);
      setIsVisible(true);

      // Auto-hide after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center pointer-events-none",
        "transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Graffiti text */}
      <div
        className={cn(
          "relative transform transition-all duration-500",
          color,
          isVisible ? "scale-100 rotate-0" : "scale-150 rotate-12",
          "animate-pulse"
        )}
      >
        <div className="text-6xl md:text-8xl font-black tracking-wider transform -skew-x-12 drop-shadow-2xl">
          {message}
        </div>

        {/* Spray paint effect */}
        <div className="absolute inset-0 opacity-30">
          <div
            className={cn(
              "absolute -top-2 -left-2 w-4 h-4 rounded-full blur-sm",
              color.replace("text-", "bg-")
            )}
          />
          <div
            className={cn(
              "absolute -bottom-1 -right-3 w-3 h-3 rounded-full blur-sm",
              color.replace("text-", "bg-")
            )}
          />
          <div
            className={cn(
              "absolute top-1/2 -left-4 w-2 h-2 rounded-full blur-sm",
              color.replace("text-", "bg-")
            )}
          />
          <div
            className={cn(
              "absolute top-1/4 -right-2 w-2 h-2 rounded-full blur-sm",
              color.replace("text-", "bg-")
            )}
          />
        </div>
      </div>

      {/* Confetti-like particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-2 h-2 rounded-full animate-bounce",
              colors[i % colors.length].replace("text-", "bg-"),
              "opacity-60"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
