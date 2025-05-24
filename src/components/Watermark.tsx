import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface WatermarkProps {
  text?: string;
  className?: string;
}

export function Watermark({ text = "NUXPAD", className }: WatermarkProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, 200); // Adjust typing speed here (milliseconds)

    return () => clearInterval(typingInterval);
  }, [text]);

  return (
    <div 
      className={cn(
        "fixed inset-0 pointer-events-none select-none z-[5] flex items-center justify-center",
        "opacity-[0.15] dark:opacity-[0.2]",
        className
      )}
    >
      <h1 
        className={cn(
          "text-[25vw] font-bold tracking-tighter text-black dark:text-white transition-opacity duration-500",
          !isTypingComplete && "border-r-4 border-current animate-blink"
        )}
        style={{
          background: "linear-gradient(to bottom right, currentColor 60%, transparent 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {displayText}
      </h1>
    </div>
  );
} 