import { useState, useRef, useEffect } from "react";
import { Note } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, GripHorizontal, Share2 } from "lucide-react";
import { ShareModal } from "@/components/ShareModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  isGridVisible: boolean;
  gridSize: number;
}

export function StickyNote({ 
  note, 
  onUpdate, 
  onDelete, 
  onBringToFront,
  isGridVisible,
  gridSize
}: StickyNoteProps) {
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [title, setTitle] = useState(note.title || "New Note");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Update title state when note.title changes
  useEffect(() => {
    setTitle(note.title || "New Note");
  }, [note.title]);
  
  // Format date
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Format time
  const formattedTime = new Date(note.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Set initial content
  useEffect(() => {
    if (textareaRef.current && note.content) {
      textareaRef.current.value = note.content;
    }
  }, []);
  
  // Handle document-level mouse events for dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (!noteRef.current) return;
      
      // Get the canvas element and its transform details
      const canvasContent = document.getElementById('canvas-content');
      if (!canvasContent) return;
      
      // Extract scale and position from canvas transform
      const transformStr = window.getComputedStyle(canvasContent).transform;
      let canvasScale = 1;
      let canvasX = 0;
      let canvasY = 0;
      
      // Parse the transform matrix
      if (transformStr && transformStr !== 'none') {
        const matrix = transformStr
          .match(/matrix\(([^)]+)\)/)?.[1]
          .split(',')
          .map(Number);
          
        if (matrix && matrix.length === 6) {
          // matrix(a, b, c, d, tx, ty) - a and d are scale, tx and ty are translate
          canvasScale = matrix[0]; // Same as matrix[3]
          canvasX = matrix[4];
          canvasY = matrix[5];
        }
      }
      
      // Get the current mouse position in viewport coordinates
      const viewportX = e.clientX - dragOffset.x;
      const viewportY = e.clientY - dragOffset.y;
      
      // Convert viewport coordinates to canvas content coordinates
      const canvasContentX = (viewportX - canvasX) / canvasScale;
      const canvasContentY = (viewportY - canvasY) / canvasScale;
      
      console.log('Dragging conversion:', { 
        viewport: { x: viewportX, y: viewportY },
        canvasTransform: { x: canvasX, y: canvasY, scale: canvasScale },
        canvasContent: { x: canvasContentX, y: canvasContentY }
      });
      
      // Apply grid snapping if enabled
      const snappedX = isGridVisible ? Math.round(canvasContentX / gridSize) * gridSize : canvasContentX;
      const snappedY = isGridVisible ? Math.round(canvasContentY / gridSize) * gridSize : canvasContentY;
      
      // Ensure position is never negative
      const finalX = Math.max(0, snappedX);
      const finalY = Math.max(0, snappedY);
      
      // Update element position visually for smooth dragging
      noteRef.current.style.transform = `translate(${finalX}px, ${finalY}px)`;
      noteRef.current.style.transition = 'none'; // Disable transition while dragging
    };
    
    const handleDocumentMouseUp = () => {
      if (isDragging && noteRef.current) {
        // Get final position from current element style
        const transform = noteRef.current.style.transform;
        const match = transform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
      
      if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          
          console.log('Final position after dragging:', { x, y });
          
          // Ensure we have valid position values
          if (!isNaN(x) && !isNaN(y)) {
            // Update note position in state - this updates the actual data
            onUpdate(note.id, { position: { x, y } });
          } else {
            console.error('Invalid position values after dragging');
            // Reset to original position if we got invalid values
            noteRef.current.style.transform = `translate(${note.position.x}px, ${note.position.y}px)`;
          }
        }
        
        // Re-enable transitions
        noteRef.current.style.transition = '';
        
        setIsDragging(false);
      }
    };
    
    // Add document-level event listeners
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [isDragging, dragOffset, isGridVisible, gridSize, note.id, note.position, onUpdate]);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking on interactive elements
    if (
      e.target instanceof HTMLTextAreaElement || 
      e.target instanceof HTMLInputElement ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).classList.contains('resize-handle')
    ) {
      return;
    }

    // Bring note to front
    onBringToFront(note.id);
    
    // Get the canvas content element
    const canvasContent = document.getElementById('canvas-content');
    
    // Set dragging state and offset
    setIsDragging(true);
    
    // Calculate the offset from the mouse position to the note's top-left corner
    const rect = noteRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      console.log('Starting drag', {
        clientX: e.clientX,
        clientY: e.clientY,
        rectLeft: rect.left,
        rectTop: rect.top,
        offset: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        },
        notePosition: note.position
      });
    }
    
    // Prevent default to avoid text selection during drag
    e.preventDefault();
  };
  
  // Handle touch start for dragging on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't drag if touching interactive elements
    if (
      e.target instanceof HTMLTextAreaElement || 
      e.target instanceof HTMLInputElement ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).classList.contains('resize-handle')
    ) {
      return;
    }

    // Bring note to front
    onBringToFront(note.id);
    
    // For single touch (drag)
    if (e.touches.length === 1) {
      setIsDragging(true);
      
      // Calculate offset from touch point to note corner
      const rect = noteRef.current?.getBoundingClientRect();
      if (rect) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        setDragOffset({
          x: touchX - rect.left,
          y: touchY - rect.top
        });
        
        console.log('Starting touch drag', {
          touchX,
          touchY,
          rectLeft: rect.left,
          rectTop: rect.top,
          offset: {
            x: touchX - rect.left,
            y: touchY - rect.top
          }
        });
      }
    }
    
    // Using CSS touchAction: 'none' instead of preventDefault
  };
  
  // Handle touch move for dragging on mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    // Get the canvas element and its transform details
    const canvasContent = document.getElementById('canvas-content');
    if (!canvasContent) return;
    
    // Extract scale and position from canvas transform
    const transformStr = window.getComputedStyle(canvasContent).transform;
    let canvasScale = 1;
    let canvasX = 0;
    let canvasY = 0;
    
    // Parse the transform matrix
    if (transformStr && transformStr !== 'none') {
      const matrix = transformStr
        .match(/matrix\(([^)]+)\)/)?.[1]
        .split(',')
        .map(Number);
        
      if (matrix && matrix.length === 6) {
        // matrix(a, b, c, d, tx, ty) - a and d are scale, tx and ty are translate
        canvasScale = matrix[0]; // Same as matrix[3]
        canvasX = matrix[4];
        canvasY = matrix[5];
      }
    }
    
    // Get the current touch position
    const viewportX = e.touches[0].clientX - dragOffset.x;
    const viewportY = e.touches[0].clientY - dragOffset.y;
    
    // Convert viewport coordinates to canvas content coordinates
    const canvasContentX = (viewportX - canvasX) / canvasScale;
    const canvasContentY = (viewportY - canvasY) / canvasScale;
    
    // Apply grid snapping if enabled
    const snappedX = isGridVisible ? Math.round(canvasContentX / gridSize) * gridSize : canvasContentX;
    const snappedY = isGridVisible ? Math.round(canvasContentY / gridSize) * gridSize : canvasContentY;
    
    // Ensure position is never negative
    const finalX = Math.max(0, snappedX);
    const finalY = Math.max(0, snappedY);
    
    if (noteRef.current) {
      // Update element position visually for smooth dragging
      noteRef.current.style.transform = `translate(${finalX}px, ${finalY}px)`;
      noteRef.current.style.transition = 'none'; // Disable transition while dragging
    }
    
    // Using CSS touchAction: 'none' instead of preventDefault
  };
  
  // Handle touch end for dragging on mobile
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDragging && noteRef.current) {
      // Get final position from current element style
      const transform = noteRef.current.style.transform;
      const match = transform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
    
      if (match) {
        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);
        
        console.log('Final position after touch dragging:', { x, y });
        
        // Ensure we have valid position values
        if (!isNaN(x) && !isNaN(y)) {
          // Update note position in state - this updates the actual data
          onUpdate(note.id, { position: { x, y } });
        } else {
          console.error('Invalid position values after touch dragging');
          // Reset to original position if we got invalid values
          noteRef.current.style.transform = `translate(${note.position.x}px, ${note.position.y}px)`;
        }
      }
      
      // Re-enable transitions
      noteRef.current.style.transition = '';
    }
    
    setIsDragging(false);
  };
  
  // Handle title input change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  // Save title when done editing
  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    onUpdate(note.id, { title });
  };
  
  // Handle resize functionality
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onBringToFront(note.id);
    
    const noteElement = noteRef.current;
    if (!noteElement) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = noteElement.offsetWidth;
    const startHeight = noteElement.offsetHeight;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      // Limit size between min and max values
      const width = Math.min(Math.max(150, startWidth + dx), 500);
      const height = Math.min(Math.max(120, startHeight + dy), 500);
      
      // Apply grid snapping if enabled
      const snappedWidth = isGridVisible ? Math.round(width / gridSize) * gridSize : width;
      const snappedHeight = isGridVisible ? Math.round(height / gridSize) * gridSize : height;
      
      // Update element size
      noteElement.style.width = `${snappedWidth}px`;
      noteElement.style.height = `${snappedHeight}px`;
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      onUpdate(note.id, { 
        size: { 
          width: Math.min(Math.max(150, noteElement.offsetWidth), 500), 
          height: Math.min(Math.max(120, noteElement.offsetHeight), 500) 
        }
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle resize functionality for touch devices
  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onBringToFront(note.id);
    
    const noteElement = noteRef.current;
    if (!noteElement) return;
    
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;
    const startWidth = noteElement.offsetWidth;
    const startHeight = noteElement.offsetHeight;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      // Using passive event listeners, avoiding preventDefault
      
      const dx = moveEvent.touches[0].clientX - startX;
      const dy = moveEvent.touches[0].clientY - startY;
      
      // Limit size between min and max values
      const width = Math.min(Math.max(150, startWidth + dx), 500);
      const height = Math.min(Math.max(120, startHeight + dy), 500);
      
      // Apply grid snapping if enabled
      const snappedWidth = isGridVisible ? Math.round(width / gridSize) * gridSize : width;
      const snappedHeight = isGridVisible ? Math.round(height / gridSize) * gridSize : height;
      
      // Update element size
      noteElement.style.width = `${snappedWidth}px`;
      noteElement.style.height = `${snappedHeight}px`;
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      onUpdate(note.id, { 
        size: { 
          width: Math.min(Math.max(150, noteElement.offsetWidth), 500), 
          height: Math.min(Math.max(120, noteElement.offsetHeight), 500) 
        }
      });
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  // Handle delete note
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteConfirmOpen(true);
  };
  
  // Get appropriate colors based on the note color
  const getColorClasses = () => {
    switch(note.color) {
      case 'yellow':
        return "bg-amber-100 shadow-amber-200/50 dark:bg-amber-200/90";
      case 'blue':
        return "bg-blue-100 shadow-blue-200/50 dark:bg-blue-200/90";
      case 'green':
        return "bg-green-100 shadow-green-200/50 dark:bg-green-200/90";
      case 'pink':
        return "bg-pink-100 shadow-pink-200/50 dark:bg-pink-200/90";
      case 'purple':
        return "bg-purple-100 shadow-purple-200/50 dark:bg-purple-200/90";
      case 'orange':
        return "bg-orange-100 shadow-orange-200/50 dark:bg-orange-200/90";
      default:
        return "bg-yellow-100 shadow-yellow-200/50 dark:bg-yellow-200/90";
    }
  };
  
  const getBorderColor = () => {
    switch(note.color) {
      case 'yellow':
        return "border-amber-200 dark:border-amber-300/50";
      case 'blue':
        return "border-blue-200 dark:border-blue-300/50";
      case 'green':
        return "border-green-200 dark:border-green-300/50";
      case 'pink':
        return "border-pink-200 dark:border-pink-300/50";
      case 'purple':
        return "border-purple-200 dark:border-purple-300/50";
      case 'orange':
        return "border-orange-200 dark:border-orange-300/50";
      default:
        return "border-yellow-200 dark:border-yellow-300/50";
    }
  };
  
  const getColorButtonClass = () => {
    switch(note.color) {
      case 'yellow':
        return "bg-amber-400 border border-amber-500/30";
      case 'blue':
        return "bg-blue-400 border border-blue-500/30";
      case 'green':
        return "bg-green-400 border border-green-500/30";
      case 'pink':
        return "bg-pink-400 border border-pink-500/30";
      case 'purple':
        return "bg-purple-400 border border-purple-500/30";
      case 'orange':
        return "bg-orange-400 border border-orange-500/30";
      default:
        return "bg-yellow-400 border border-yellow-500/30";
    }
  };

  useEffect(() => {
    // Check if first visit and show tutorial
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setIsTutorialOpen(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  // Add a style tag for text styling
  useEffect(() => {
    // Add a style tag for dark mode specific styles
    const style = document.createElement('style');
    style.textContent = `
      .dark .sticky-note-textarea {
        color: rgba(255, 255, 255, 0.9) !important;
      }
      .sticky-note-textarea {
        background-color: transparent;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .dark .sticky-note-textarea::placeholder {
        color: rgba(255, 255, 255, 0.4) !important;
      }
      .sticky-note-textarea::placeholder {
        color: rgba(0, 0, 0, 0.4);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add this near other button handlers
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  return (
    <>
      <div 
        ref={noteRef}
        className={cn(
          "sticky-note absolute rounded-md text-gray-800 shadow-lg border flex flex-col",
          getColorClasses(),
          getBorderColor()
        )}
        style={{
          width: `${note.size.width}px`,
          height: `${note.size.height}px`,
          zIndex: note.zIndex,
          transform: `translate(${note.position.x}px, ${note.position.y}px)`,
          transition: 'box-shadow 0.2s ease, transform 0.1s ease',
          minHeight: '120px',
          touchAction: 'none' // Prevents browser handling of all panning and zooming gestures
        }}
        data-id={note.id}
        data-note-id={note.id}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="note-header cursor-move flex justify-between items-center p-2 bg-white/30 dark:bg-white/50 rounded-t-md">
          <div className="note-drag-handle w-full flex items-center">
            <GripHorizontal className="h-4 w-4 text-gray-400 mr-2" />
            {isEditingTitle ? (
              <Input
                id={`note-title-${note.id}`}
                name={`note-title-${note.id}`}
                type="text"
                className="text-sm font-medium bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary w-full max-w-[120px]"
                value={title}
                autoFocus
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleBlur();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span 
                className="text-sm font-medium truncate cursor-text" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                title="Click to edit title"
              >
                {title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Color button clicked');
                  setIsColorPickerOpen(!isColorPickerOpen);
                }}
                title="Change color"
              >
            <div 
              className={cn(
                    "color-picker-trigger rounded-full w-5 h-5 shadow-sm transition-all",
                getColorButtonClass()
                  )}
                  style={{ 
                    transform: isColorPickerOpen ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
              </Button>
              
              {isColorPickerOpen && (
                <div 
                  className="absolute right-0 top-6 color-picker bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-[9999] border border-gray-200 dark:border-gray-700 w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                  style={{ animation: 'fadeIn 0.2s ease-in-out' }}
                >
                  <div className="text-sm font-medium mb-2 px-1 text-gray-700 dark:text-gray-300">Note Color</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "yellow", class: "bg-amber-400" },
                      { name: "green", class: "bg-green-400" },
                      { name: "blue", class: "bg-blue-400" },
                      { name: "purple", class: "bg-purple-400" },
                      { name: "pink", class: "bg-pink-400" },
                      { name: "orange", class: "bg-orange-400" }
                    ].map(color => (
                      <button 
                        key={color.name}
                        className={`color-option w-8 h-8 rounded-full ${color.class} cursor-pointer hover:scale-110 transition-transform border border-white/30 shadow-sm ${note.color === color.name ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Selecting color:', color.name);
                          onUpdate(note.id, { color: color.name });
                          setIsColorPickerOpen(false);
                        }}
                        title={`${color.name} note`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              onClick={handleDelete}
              title="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-black/10"
              onClick={handleShare}
            >
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="note-content flex-grow p-3 overflow-auto">
          <textarea
            ref={textareaRef}
            spellCheck="false"
            value={note.content || ''}
            placeholder="Write your note here..."
            className="bg-transparent outline-none w-full h-full min-h-[80px] focus:outline-none focus-visible:ring-0 resize-none font-sans text-base sticky-note-textarea"
            style={{
              direction: 'ltr',
              unicodeBidi: 'normal',
              writingMode: 'horizontal-tb',
              textAlign: 'left',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              border: 'none',
              padding: '0',
              color: 'rgba(0, 0, 0, 0.8)'
            }}
            onChange={(e) => {
              onUpdate(note.id, { content: e.target.value });
            }}
            onKeyDown={(e) => {
              // Handle keyboard shortcuts
              if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                  case 'b':
                  case 'i':
                  case 'u':
                    // We can't apply formatting to a textarea
                    // but we keep the handler to avoid breaking shortcuts
                    e.preventDefault();
                    break;
                }
              }
            }}
          />
        </div>
        
        <div className={cn(
          "note-footer flex justify-between items-center p-2 px-3 border-t mt-auto",
          getBorderColor()
        )}>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[70%] overflow-hidden">
            {formattedDate} · {formattedTime}
          </span>
          <div 
            className="resize-handle cursor-nwse-resize p-2 -m-2 flex items-center justify-center"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeTouchStart}
            title="Resize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-gray-400">
              <path d="M0 8.5L1.5 10L10 1.5L8.5 0L0 8.5Z" />
            </svg>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        noteContent={textareaRef.current?.value || note.content}
        notePosition={note.position}
        noteColor={note.color || 'red'}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => onDelete(note.id)}
        title="Delete Note"
        description="Are you sure you want to delete this note?"
        confirmText="Delete it"
        cancelText="Keep it"
        variant="destructive"
      />
    </>
  );
}