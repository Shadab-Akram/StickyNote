import { useEffect, useRef } from "react";

interface ColorPickerProps {
  position: { x: number, y: number };
  onSelectColor: (color: string) => void;
  onClose: () => void;
}

export function ColorPicker({ position, onSelectColor, onClose }: ColorPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const colors = [
    { name: "yellow", class: "bg-yellow-100" },
    { name: "green", class: "bg-green-100" },
    { name: "blue", class: "bg-blue-100" },
    { name: "purple", class: "bg-purple-100" },
    { name: "pink", class: "bg-pink-100" },
    { name: "orange", class: "bg-orange-100" }
  ];
  
  useEffect(() => {
    // Handle clicks outside the color picker
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);
  
  // Adjust position to keep within viewport
  const adjustedPosition = { ...position };
  
  // Adjust for right edge of screen
  if (pickerRef.current) {
    const pickerWidth = pickerRef.current.offsetWidth;
    if (position.x + pickerWidth > window.innerWidth) {
      adjustedPosition.x = window.innerWidth - pickerWidth - 10;
    }
  }
  
  return (
    <div 
      ref={pickerRef}
      className="color-picker absolute bg-white dark:bg-gray-700 p-2 rounded-lg shadow-lg z-[100]"
      style={{
        top: `${adjustedPosition.y}px`,
        left: `${adjustedPosition.x}px`,
      }}
    >
      <div className="text-sm font-medium mb-2 px-1 text-gray-700 dark:text-gray-300">Note Color</div>
      <div className="grid grid-cols-3 gap-2">
        {colors.map(color => (
          <div 
            key={color.name}
            className={`color-option w-7 h-7 rounded-full ${color.class} cursor-pointer border-2 border-transparent hover:border-gray-400`}
            onClick={() => onSelectColor(color.name)}
          ></div>
        ))}
      </div>
    </div>
  );
}
