import { useEffect, useRef, useState, useCallback } from "react";
import { StickyNote } from "./StickyNote";
import { MiniMap } from "./MiniMap";
import { FloatingNavbar } from "./FloatingNavbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Note } from "@/lib/schema";
import { Maximize, RefreshCw, Minimize, Map } from "lucide-react";

interface CanvasProps {
  notes: Note[];
  isGridVisible: boolean;
  gridSize: number;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  onAddNote: () => void;
  onToggleGrid: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenSettings: () => void;
  onClearAll: () => void;
  onOpenHelp: () => void;
}

export function Canvas({ 
  notes, 
  isGridVisible, 
  gridSize,
  onUpdateNote,
  onDeleteNote,
  scale,
  onScaleChange,
  onAddNote,
  onToggleGrid,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenSettings,
  onClearAll,
  onOpenHelp
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragMode, setIsDragMode] = useState(false);
  const zoomTimeoutRef = useRef<number | null>(null);
  const lastTouchDistanceRef = useRef<number | null>(null);
  
  // Canvas size constants - canvas center point is at 5000, 5000
  const canvasDimensions = { width: 10000, height: 10000 };
  const canvasCenterX = 5000;
  const canvasCenterY = 5000;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Bring note to front when clicked
  const handleBringToFront = (id: string) => {
    // Find the highest z-index
    const highestZ = Math.max(...notes.map(note => note.zIndex), 0);
    console.log('Bringing note to front with zIndex:', highestZ + 1);
    onUpdateNote(id, { zIndex: highestZ + 1 });
  };
  
  // Center the canvas view on the center point
  const centerCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    // Calculate position to center the canvas center point in the viewport
    const centerX = (canvas.clientWidth / 2) - (canvasCenterX * scale);
    const centerY = (canvas.clientHeight / 2) - (canvasCenterY * scale);
    
    console.log('Centering canvas at:', { x: centerX, y: centerY, scale });
    setPosition({
      x: centerX,
      y: centerY
    });
  }, [scale]);

  // Initialize canvas position on load
  useEffect(() => {
    centerCanvas();
    
    // Also re-center when window is resized
    window.addEventListener('resize', centerCanvas);
    return () => window.removeEventListener('resize', centerCanvas);
  }, [centerCanvas]);
  
  // Canvas zoom in/out
  const handleZoom = useCallback((delta: number) => {
    const newScale = Math.min(Math.max(scale + delta, 0.25), 2);
    
    // Update scale first, then the canvas position will be adjusted in the useEffect that depends on scale
    onScaleChange(newScale);
  }, [onScaleChange]);
  
  // Re-center when scale changes
  useEffect(() => {
    centerCanvas();
  }, [scale, centerCanvas]);
  
  // Reset zoom and canvas position
  const handleReset = useCallback(() => {
    onScaleChange(1);
    // centerCanvas will be called due to the scale change
  }, [onScaleChange]);
  
  // Handle wheel events for zooming - improve this to work better
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        // Calculate delta based on wheel direction
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        
        // Get canvas content element
        const content = contentRef.current;
        if (!content) return;
        
        // Get mouse position relative to viewport
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Calculate the position of the mouse relative to the canvas content's center
        const contentRect = content.getBoundingClientRect();
        const contentCenterX = contentRect.left + (contentRect.width / 2);
        const contentCenterY = contentRect.top + (contentRect.height / 2);
        
        // Get old scale for calculations
        const oldScale = scale;
        
        // Calculate new scale
        const newScale = Math.min(Math.max(scale + delta, 0.25), 2);
        
        // Calculate scale factor
        const scaleFactor = newScale / oldScale;
        
        // Calculate the offset that maintains the point under the mouse in the same position
        const dx = (mouseX - contentCenterX) * (1 - scaleFactor);
        const dy = (mouseY - contentCenterY) * (1 - scaleFactor);
        
        // Clear previous timeout to prevent rapid updates
        if (zoomTimeoutRef.current !== null) {
          window.clearTimeout(zoomTimeoutRef.current);
        }
        
        // Update scale first
        onScaleChange(newScale);
        
        // Then adjust position to keep the point under the cursor fixed with a small delay for smoothness
        zoomTimeoutRef.current = window.setTimeout(() => {
          setPosition(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
          }));
          zoomTimeoutRef.current = null;
        }, 5);
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      if (zoomTimeoutRef.current !== null) {
        window.clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, [scale, onScaleChange]);
  
  // Handle canvas pan/drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if the canvas background is clicked (not a note)
    // or if drag mode is enabled
    if (isDragMode || e.target === e.currentTarget || (e.target as HTMLElement).id === 'gridOverlay') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      
      // Change cursor to indicate grabbing
      document.body.style.cursor = 'grabbing';
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
    // Reset cursor
    document.body.style.cursor = '';
  };

  // Handle touch events for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only handle touch on canvas background
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'gridOverlay' || isDragMode) {
      // Single finger for panning
      if (e.touches.length === 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        });
      }
      // Two fingers for pinch-to-zoom
      else if (e.touches.length === 2) {
        // Calculate initial distance between two fingers
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        lastTouchDistanceRef.current = distance;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Using CSS to prevent scrolling instead of preventDefault
    
    // Single finger for panning
    if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
    // Two fingers for pinch-to-zoom
    else if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      // Calculate new distance
      const newDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Calculate midpoint between touches
      const midX = (touch1.clientX + touch2.clientX) / 2;
      const midY = (touch1.clientY + touch2.clientY) / 2;
      
      // Calculate scale change
      const distanceChange = newDistance - lastTouchDistanceRef.current;
      const scaleDelta = distanceChange * 0.005; // Adjust sensitivity
      
      // Get content element for calculations
      const content = contentRef.current;
      if (!content) return;
      
      // Calculate position relative to content
      const contentRect = content.getBoundingClientRect();
      const contentCenterX = contentRect.left + (contentRect.width / 2);
      const contentCenterY = contentRect.top + (contentRect.height / 2);
      
      // Calculate new scale
      const oldScale = scale;
      const newScale = Math.min(Math.max(scale + scaleDelta, 0.25), 2);
      
      // Calculate scale factor
      const scaleFactor = newScale / oldScale;
      
      // Calculate position offset to keep pinch midpoint fixed
      const dx = (midX - contentCenterX) * (1 - scaleFactor);
      const dy = (midY - contentCenterY) * (1 - scaleFactor);
      
      // Update scale and remember new distance
      lastTouchDistanceRef.current = newDistance;
      onScaleChange(newScale);
      
      // Update position
      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    lastTouchDistanceRef.current = null;
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const docElement = document.documentElement;
      if (docElement.requestFullscreen) {
        docElement.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(err => console.error(err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(err => console.error(err));
      }
    }
  };

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Calculate scaled grid size
  const scaledGridSize = gridSize * scale;
  
  // Add a navigation method to the Canvas component
  const navigateTo = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Calculate position to center on the target coordinates
    const centerX = (canvas.clientWidth / 2) - (x * scale);
    const centerY = (canvas.clientHeight / 2) - (y * scale);
    
    console.log('Navigating to:', { x, y, centerX, centerY });
    setPosition({ x: centerX, y: centerY });
  }, [scale]);

  // Add state to toggle minimap visibility
  const [isMiniMapVisible, setIsMiniMapVisible] = useState(false);
  
  // Handle zoom in (for floating navbar)
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(scale + 0.1, 2);
    onScaleChange(newScale);
  }, [scale, onScaleChange]);
  
  // Handle zoom out (for floating navbar)
  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(scale - 0.1, 0.25);
    onScaleChange(newScale);
  }, [scale, onScaleChange]);
  
  // Toggle drag mode (for floating navbar)
  const toggleDragMode = useCallback(() => {
    setIsDragMode(prevMode => !prevMode);
  }, []);

  return (
    <div 
      ref={canvasRef}
      id="canvas" 
      className="relative flex-1 overflow-hidden"
    >
      {/* Fixed canvas background with grid */}
      <div 
        className={cn(
          "absolute inset-0 transition-colors duration-200 bg-gray-50 dark:bg-gray-900",
          isDragging ? "cursor-grabbing" : isDragMode ? "cursor-grab" : "cursor-default"
        )}
        style={{
          backgroundImage: isGridVisible
            ? `linear-gradient(to right, rgba(229, 231, 235, 0.5) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(229, 231, 235, 0.5) 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Canvas content */}
        <div
          ref={contentRef}
          className="absolute origin-center transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            width: canvasDimensions.width,
            height: canvasDimensions.height,
            transformOrigin: '0 0',
            willChange: 'transform'
          }}
          id="canvas-content"
        >
          {/* Render all notes */}
          {notes.map(note => (
            <StickyNote
              key={note.id}
              note={note}
              onUpdate={onUpdateNote}
              onDelete={onDeleteNote}
              onBringToFront={handleBringToFront}
              gridSize={gridSize}
              isGridVisible={isGridVisible}
            />
          ))}
        </div>
      </div>

      {/* Add Floating Navbar */}
      <FloatingNavbar 
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        isGridVisible={isGridVisible}
        onToggleGrid={onToggleGrid}
        onAddNote={onAddNote}
        isDragMode={isDragMode}
        onToggleDragMode={toggleDragMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenSettings={onOpenSettings}
        onClearAll={onClearAll}
        onOpenHelp={onOpenHelp}
      />

      {/* Add Mini Map toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMiniMapVisible(!isMiniMapVisible)}
        className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg z-50"
        title="Toggle Mini Map"
      >
        <Map className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </Button>
      
      {/* Show Mini Map when visible */}
      {isMiniMapVisible && (
        <div className="absolute bottom-16 left-4 z-50 animate-in fade-in duration-200">
          <MiniMap
            notes={notes}
            canvasPosition={position}
            canvasScale={scale}
            onNavigateTo={navigateTo}
          />
        </div>
      )}
    </div>
  );
}
