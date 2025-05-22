import { useEffect, useRef, useState, useCallback } from "react";
import { Nuxpad } from "./Nuxpad";
import { MiniMap } from "./MiniMap";
import { FloatingNavbar } from "./FloatingNavbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Note } from "@/lib/schema";
import { Maximize, RefreshCw, Minimize, Map, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Error Fallback component
function ErrorFallback({ error, resetCanvas }: { error: Error, resetCanvas: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 p-8">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-xl font-bold mb-2">Canvas Error</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
        Something went wrong with the canvas rendering: {error.message}
      </p>
      <Button onClick={resetCanvas} variant="default">
        Reset Canvas
      </Button>
    </div>
  );
}

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
  const [hasError, setHasError] = useState<Error | null>(null);
  
  // Canvas size constants - reduce size for better performance
  const canvasDimensions = { width: 3000, height: 3000 };
  // Set center point to the middle of our dimensions
  const canvasCenterX = canvasDimensions.width / 2;
  const canvasCenterY = canvasDimensions.height / 2;
  
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
    // Use more conservative values
    const centerX = 0;
    const centerY = 0;
    
    console.log('Centering canvas at:', { x: centerX, y: centerY, scale });
    
    // Force valid coordinates
    setPosition({
      x: centerX,
      y: centerY
    });
  }, [scale]);

  // Initialize canvas position on load - force immediate execution
  useEffect(() => {
    // Force initial position immediately
    setPosition({ x: 0, y: 0 });
    
    // Then try centering
    centerCanvas();
    
    // Also re-center when window is resized
    window.addEventListener('resize', centerCanvas);
    return () => {
      window.removeEventListener('resize', centerCanvas);
    };
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
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        
        // Get mouse position relative to viewport
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Get canvas content element
        const content = contentRef.current;
        if (!content) return;
        
        // Get the current transform values
        const contentRect = content.getBoundingClientRect();
        
        // Calculate the mouse position relative to the canvas content
        const mouseXRelative = mouseX - contentRect.left;
        const mouseYRelative = mouseY - contentRect.top;
        
        // Calculate the mouse position in canvas coordinates
        const mouseXCanvas = mouseXRelative / scale;
        const mouseYCanvas = mouseYRelative / scale;
        
        // Calculate new scale
        const newScale = Math.min(Math.max(scale + delta, 0.25), 2);
        
        // Calculate the new position to keep the mouse point fixed
        const newX = mouseX - mouseXCanvas * newScale;
        const newY = mouseY - mouseYCanvas * newScale;
        
        // Update scale and position
        onScaleChange(newScale);
        setPosition({ x: newX, y: newY });
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
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

  // Handle touch zoom (pinch)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      // Calculate midpoint between touches
      const midX = (touch1.clientX + touch2.clientX) / 2;
      const midY = (touch1.clientY + touch2.clientY) / 2;
      
      // Calculate new distance
      const newDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Get content element for calculations
      const content = contentRef.current;
      if (!content) return;
      
      // Get the current transform values
      const contentRect = content.getBoundingClientRect();
      
      // Calculate the touch midpoint relative to the canvas content
      const midXRelative = midX - contentRect.left;
      const midYRelative = midY - contentRect.top;
      
      // Calculate the touch midpoint in canvas coordinates
      const midXCanvas = midXRelative / scale;
      const midYCanvas = midYRelative / scale;
      
      // Calculate scale change
      const distanceChange = newDistance - lastTouchDistanceRef.current;
      const scaleDelta = distanceChange * 0.005; // Adjust sensitivity
      const newScale = Math.min(Math.max(scale + scaleDelta, 0.25), 2);
      
      // Calculate the new position to keep the midpoint fixed
      const newX = midX - midXCanvas * newScale;
      const newY = midY - midYCanvas * newScale;
      
      // Update scale and position
      lastTouchDistanceRef.current = newDistance;
      onScaleChange(newScale);
      setPosition({ x: newX, y: newY });
    } else if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
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

  // Error handling to capture rendering issues
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Canvas error:', event.error);
      setHasError(event.error);
      // Prevent the default error handling
      event.preventDefault();
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // Reset canvas on error
  const handleResetCanvas = () => {
    setHasError(null);
    setPosition({ x: 0, y: 0 });
    onScaleChange(1);
    // Force a refresh after reset
    setTimeout(() => {
      centerCanvas();
    }, 100);
  };
  
  // If there's an error, show the error fallback
  if (hasError) {
    return <ErrorFallback error={hasError} resetCanvas={handleResetCanvas} />;
  }
  
  return (
    <div 
      ref={canvasRef}
      id="canvas" 
      className="relative flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900"
      style={{ width: '100%', height: '100%' }}
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
          backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
          width: '100%',
          height: '100%'
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
            <Nuxpad
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMiniMapVisible(!isMiniMapVisible)}
            className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg z-50 h-12 w-12"
          >
            <Map className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          <p>{isMiniMapVisible ? 'Hide Mini Map' : 'Show Mini Map'}</p>
          <p className="text-xs text-muted-foreground">Quick overview and navigation</p>
        </TooltipContent>
      </Tooltip>
      
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
