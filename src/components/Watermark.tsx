import { cn } from "@/lib/utils";

interface WatermarkProps {
  text?: string;
  className?: string;
}

export function Watermark({ text = "DOCS", className }: WatermarkProps) {
  return (
    <div 
      className={cn(
        "fixed inset-0 pointer-events-none select-none z-[5] flex items-center justify-center",
        "opacity-[0.15] dark:opacity-[0.2]",
        className
      )}
    >
      <h1 
        className="text-[25vw] font-bold tracking-tighter text-black dark:text-white"
        style={{
          background: "linear-gradient(to bottom right, currentColor 60%, transparent 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {text}
      </h1>
    </div>
  );
} 