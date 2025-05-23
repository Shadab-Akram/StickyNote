import { Note } from "@/lib/schema";
import { useEffect, useRef, useState } from "react";

interface MiniMapProps {
  notes: Note[];
  canvasPosition: { x: number; y: number };
  canvasScale: number;
  onNavigateTo: (x: number, y: number) => void;
}

export function MiniMap({ 
  notes, 
  canvasPosition, 
  canvasScale,
  onNavigateTo 
}: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDraggingViewport, setIsDraggingViewport] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewportRect, setViewportRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  
  // Canvas dimensions
  const width = 150;
  const height = 150;
  const canvasVirtualWidth = 3000;
  const canvasVirtualHeight = 3000;
  
  // Map canvas coordinate space to mini map space (centered at 0,0)
  const mapX = (x: number) => ((x + canvasVirtualWidth / 2) / canvasVirtualWidth) * width;
  const mapY = (y: number) => ((y + canvasVirtualHeight / 2) / canvasVirtualHeight) * height;
  
  // Convert mini map coordinates to canvas coordinates (centered at 0,0)
  const miniMapToCanvas = (x: number, y: number) => {
    const canvasX = (x / width) * canvasVirtualWidth - canvasVirtualWidth / 2;
    const canvasY = (y / height) * canvasVirtualHeight - canvasVirtualHeight / 2;
    return { x: canvasX, y: canvasY };
  };
  
  // Draw the mini map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Clear canvas
    context.clearRect(0, 0, width, height);
    
    // Set canvas background
    context.fillStyle = 'rgba(30, 41, 59, 0.7)';
    context.fillRect(0, 0, width, height);
    
    // Draw grid
    context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    context.lineWidth = 0.5;
    
    // Draw horizontal lines
    for (let i = 0; i < height; i += 10) {
      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(width, i);
      context.stroke();
    }
    
    // Draw vertical lines
    for (let i = 0; i < width; i += 10) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, height);
      context.stroke();
    }
    
    // Draw each note
    notes.forEach(note => {
      // Map note position to mini map
      const x = mapX(note.position.x);
      const y = mapY(note.position.y);
      
      // Set color based on note color
      let dotColor;
      switch(note.color) {
        case 'yellow': dotColor = '#fbbf24'; break; // amber-400
        case 'blue': dotColor = '#60a5fa'; break; // blue-400
        case 'green': dotColor = '#4ade80'; break; // green-400
        case 'purple': dotColor = '#a78bfa'; break; // purple-400
        case 'pink': dotColor = '#f472b6'; break; // pink-400
        case 'orange': dotColor = '#fb923c'; break; // orange-400
        default: dotColor = '#fbbf24'; break;
      }
      
      // Draw note
      context.fillStyle = dotColor;
      context.beginPath();
      context.arc(x, y, 3, 0, Math.PI * 2);
      context.fill();
    });
    
    // Calculate viewport indicator
    const viewportWidth = (window.innerWidth / canvasVirtualWidth) * width / canvasScale;
    const viewportHeight = (window.innerHeight / canvasVirtualHeight) * height / canvasScale;
    // Calculate viewport position on mini map (centered logic)
    const viewX = mapX(-canvasPosition.x);
    const viewY = mapY(-canvasPosition.y);
    // Store viewport rectangle for dragging
    setViewportRect({
      x: viewX,
      y: viewY,
      width: viewportWidth,
      height: viewportHeight
    });
    // Draw viewport rectangle
    if (isDraggingViewport) {
      context.strokeStyle = 'rgba(59, 130, 246, 0.9)'; // blue-500
      context.lineWidth = 2;
    } else {
      context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      context.lineWidth = 1;
    }
    context.strokeRect(viewX, viewY, viewportWidth, viewportHeight);
    context.fillStyle = isDraggingViewport 
      ? 'rgba(59, 130, 246, 0.2)'  // blue tint when dragging
      : 'rgba(255, 255, 255, 0.1)'; // normal state
    context.fillRect(viewX, viewY, viewportWidth, viewportHeight);
    
  }, [notes, canvasPosition, canvasScale, isDraggingViewport]);
  
  // Handle mouse down on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !viewportRect) return;
    
    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is inside viewport rectangle
    if (
      mouseX >= viewportRect.x && 
      mouseX <= viewportRect.x + viewportRect.width &&
      mouseY >= viewportRect.y && 
      mouseY <= viewportRect.y + viewportRect.height
    ) {
      // Start dragging viewport
      setIsDraggingViewport(true);
      setDragStart({ x: mouseX, y: mouseY });
      e.preventDefault(); // Prevent text selection while dragging
    } else {
      // If clicking outside viewport, navigate to that point
      const coords = miniMapToCanvas(mouseX, mouseY);
      onNavigateTo(coords.x, coords.y);
    }
  };
  
  // Handle mouse move on canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingViewport || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate the new position
    const coords = miniMapToCanvas(mouseX, mouseY);
    onNavigateTo(coords.x, coords.y);
  };
  
  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDraggingViewport(false);
  };
  
  return (
    <div className="p-1 bg-white/10 rounded-lg shadow-lg overflow-hidden backdrop-blur-sm border border-white/10">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`cursor-${isDraggingViewport ? 'grabbing' : 'pointer'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
} 