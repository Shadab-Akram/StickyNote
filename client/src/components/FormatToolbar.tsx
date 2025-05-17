import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FormatToolbarProps {
  position: { x: number, y: number };
  onFormat: (format: string) => void;
  onClose: () => void;
}

export function FormatToolbar({ position, onFormat, onClose }: FormatToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Handle clicks outside the toolbar
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
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
  
  if (toolbarRef.current) {
    const toolbarWidth = toolbarRef.current.offsetWidth;
    const toolbarHeight = toolbarRef.current.offsetHeight;
    
    // Adjust for right edge of screen
    if (position.x + toolbarWidth / 2 > window.innerWidth) {
      adjustedPosition.x = window.innerWidth - toolbarWidth / 2 - 10;
    }
    
    // Adjust for left edge of screen
    if (position.x - toolbarWidth / 2 < 0) {
      adjustedPosition.x = toolbarWidth / 2 + 10;
    }
    
    // Adjust for top edge of screen
    if (position.y - toolbarHeight < 0) {
      // Position below selection instead of above
      adjustedPosition.y = position.y + 20;
    }
  }
  
  return (
    <div 
      ref={toolbarRef}
      className="absolute bg-white dark:bg-gray-700 shadow-md rounded-md z-[60] p-1.5 flex space-x-1"
      style={{
        top: `${adjustedPosition.y - 40}px`,
        left: `${adjustedPosition.x}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-1.5 h-8 text-gray-700 dark:text-gray-300"
        onClick={() => onFormat('bold')}
      >
        <i className="ri-bold"></i>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-1.5 h-8 text-gray-700 dark:text-gray-300"
        onClick={() => onFormat('italic')}
      >
        <i className="ri-italic"></i>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-1.5 h-8 text-gray-700 dark:text-gray-300"
        onClick={() => onFormat('underline')}
      >
        <i className="ri-underline"></i>
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-0.5" />
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-1.5 h-8 text-gray-700 dark:text-gray-300"
        onClick={() => onFormat('insertUnorderedList')}
      >
        <i className="ri-list-unordered"></i>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-1.5 h-8 text-gray-700 dark:text-gray-300"
        onClick={() => onFormat('insertOrderedList')}
      >
        <i className="ri-list-ordered"></i>
      </Button>
    </div>
  );
}
