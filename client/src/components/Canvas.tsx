import { useEffect, useRef, useState, useCallback } from "react";
import { StickyNote } from "./StickyNote";
import { ClientNote } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CanvasProps {
  notes: ClientNote[];
  isGridVisible: boolean;
  gridSize: number;
  onUpdateNote: (id: string, updates: Partial<ClientNote>) => void;
  onDeleteNote: (id: string) => void;
}

export function Canvas({ 
  notes, 
  isGridVisible, 
  gridSize,
  onUpdateNote,
  onDeleteNote 
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 5000, height: 5000 });
  
  // Bring note to front when clicked
  const handleBringToFront = (id: string) => {
    // Find the highest z-index
    const highestZ = Math.max(...notes.map(note => note.zIndex), 0);
    onUpdateNote(id, { zIndex: highestZ + 1 });
  };
  
  // Initialize canvas size
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Set initial position to center the canvas
      setPosition({
        x: (canvas.clientWidth - canvasDimensions.width * scale) / 2,
        y: (canvas.clientHeight - canvasDimensions.height * scale) / 2
      });
    }
  }, []);
  
  // Canvas zoom in/out
  const handleZoom = useCallback((delta: number) => {
    setScale(prevScale => {
      const newScale = Math.min(Math.max(prevScale + delta, 0.25), 2);
      return newScale;
    });
  }, []);
  
  // Handle wheel events for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      handleZoom(delta);
    }
  }, [handleZoom]);
  
  // Handle canvas pan/drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if the canvas background is clicked (not a note)
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'gridOverlay') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };
  
  // Create zoom controls
  const ZoomControls = () => (
    <div className="absolute bottom-4 right-4 flex flex-col bg-white/80 dark:bg-gray-800/80 rounded-lg shadow p-2 z-[1000]">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleZoom(0.1)} 
        className="text-gray-700 dark:text-gray-300"
        title="Zoom in"
      >
        <i className="ri-zoom-in-line text-lg"></i>
      </Button>
      <div className="text-center py-1 text-sm font-medium">
        {Math.round(scale * 100)}%
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleZoom(-0.1)} 
        className="text-gray-700 dark:text-gray-300"
        title="Zoom out"
      >
        <i className="ri-zoom-out-line text-lg"></i>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setScale(1)} 
        className="text-gray-700 dark:text-gray-300 mt-1"
        title="Reset zoom"
      >
        <i className="ri-restart-line text-lg"></i>
      </Button>
    </div>
  );
  
  return (
    <div 
      ref={canvasRef}
      id="canvas" 
      className={cn(
        "absolute inset-0 mt-14 touch-none overflow-hidden transition-colors duration-200 bg-gray-50 dark:bg-gray-900",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    >
      {/* Zoom controls */}
      <ZoomControls />
      
      {/* Canvas content */}
      <div
        className="absolute origin-top-left transition-transform duration-100"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          width: canvasDimensions.width,
          height: canvasDimensions.height,
        }}
      >
        {/* Grid overlay */}
        <div 
          id="gridOverlay" 
          className={cn("pointer-events-none absolute inset-0", isGridVisible ? "" : "hidden")}
          style={{
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
            width: '100%',
            height: '100%'
          }}
        ></div>
        
        {/* Render all notes */}
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
            onBringToFront={handleBringToFront}
            isGridVisible={isGridVisible}
            gridSize={gridSize}
          />
        ))}
      </div>
    </div>
  );
}
