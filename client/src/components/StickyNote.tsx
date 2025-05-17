import { useState, useRef, useEffect } from "react";
import { ClientNote } from "@shared/schema";
import { FormatToolbar } from "./FormatToolbar";
import { ColorPicker } from "./ColorPicker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StickyNoteProps {
  note: ClientNote;
  onUpdate: (id: string, updates: Partial<ClientNote>) => void;
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
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [isFormatToolbarOpen, setIsFormatToolbarOpen] = useState(false);
  const [formatToolbarPosition, setFormatToolbarPosition] = useState({ x: 0, y: 0 });
  const [title, setTitle] = useState(note.title || "Note");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  // Format date
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Set initial content
  useEffect(() => {
    if (contentRef.current && note.content) {
      contentRef.current.innerHTML = note.content;
    }
  }, []);
  
  // Handle drag functionality
  const handleDragStart = (e: React.MouseEvent) => {
    // Make sure we're only dragging from the header
    const target = e.target as HTMLElement;
    if (!target.closest('.note-header')) return;
    
    // Prevent default browser behavior and bring note to front
    e.preventDefault();
    onBringToFront(note.id);
    
    const noteElement = noteRef.current;
    if (!noteElement) return;
    
    // Get starting mouse position
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Get initial note position
    let startPosX = note.x; 
    let startPosY = note.y;
    
    // Track mouse movement
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      
      // Calculate distance moved
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      // Calculate new position
      let newX = startPosX + dx;
      let newY = startPosY + dy;
      
      // Ensure position is not negative
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      
      // Apply grid snapping if enabled
      if (isGridVisible) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      // Update element position visually
      noteElement.style.transform = `translate(${newX}px, ${newY}px)`;
    };
    
    // Handle mouse up - save the new position
    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Get final position from transform
      const finalTransform = noteElement.style.transform;
      const match = finalTransform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
      
      if (match) {
        const x = parseInt(match[1]);
        const y = parseInt(match[2]);
        onUpdate(note.id, { x, y });
      }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle resize functionality
  const handleResizeStart = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.resize-handle')) return;
    
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
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      let width = Math.max(150, startWidth + dx);
      let height = Math.max(120, startHeight + dy);
      
      // Apply grid snapping if enabled
      if (isGridVisible) {
        width = Math.round(width / gridSize) * gridSize;
        height = Math.round(height / gridSize) * gridSize;
      }
      
      // Update element size
      noteElement.style.width = `${width}px`;
      noteElement.style.height = `${height}px`;
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      onUpdate(note.id, { 
        width: noteElement.offsetWidth,
        height: noteElement.offsetHeight
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Update note content when user edits the text
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    onUpdate(note.id, { content });
  };
  
  // Handle delete note
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note.id);
  };
  
  // Bring note to front on click
  const handleClick = () => {
    onBringToFront(note.id);
  };
  
  // Open color picker when clicking the color button
  const handleColorPickerOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
    setColorPickerPosition({
      x: buttonRect.left,
      y: buttonRect.bottom + 5
    });
    
    setIsColorPickerOpen(true);
  };
  
  // Update note color when selecting from color picker
  const handleColorChange = (color: string) => {
    onUpdate(note.id, { color });
    setIsColorPickerOpen(false);
  };
  
  // Show format toolbar when text is selected
  const handleContentSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setFormatToolbarPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top - 10
      });
      
      setIsFormatToolbarOpen(true);
    } else {
      setIsFormatToolbarOpen(false);
    }
  };
  
  // Apply format to selected text
  const handleFormatAction = (format: string) => {
    document.execCommand(format, false);
    
    // Make sure to update the content in state after formatting
    if (contentRef.current) {
      const content = contentRef.current.innerHTML;
      onUpdate(note.id, { content });
    }
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
      default:
        return "border-yellow-200 dark:border-yellow-300/50";
    }
  };
  
  const getColorButtonClass = () => {
    switch(note.color) {
      case 'yellow':
        return "bg-amber-400";
      case 'blue':
        return "bg-blue-400";
      case 'green':
        return "bg-green-400";
      case 'pink':
        return "bg-pink-400";
      case 'purple':
        return "bg-purple-400";
      default:
        return "bg-yellow-400";
    }
  };
  
  return (
    <>
      <div 
        ref={noteRef}
        onClick={handleClick}
        className={cn(
          "sticky-note absolute rounded-md text-gray-800 shadow-lg",
          getColorClasses()
        )}
        style={{
          width: `${note.width}px`,
          height: `${note.height}px`,
          zIndex: note.zIndex,
          transform: `translate(${note.x}px, ${note.y}px)`
        }}
        data-id={note.id}
      >
        <div 
          className="note-header cursor-move flex justify-between items-center p-2 bg-white/30 dark:bg-white/50 rounded-t-md"
          onMouseDown={handleDragStart}
        >
          <div className="note-drag-handle w-full flex items-center">
            <i className="ri-drag-move-line text-gray-400 mr-2"></i>
            {isEditingTitle ? (
              <input
                type="text"
                className="text-sm font-medium bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary w-full max-w-[120px]"
                value={title}
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false);
                  onUpdate(note.id, { title });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                    onUpdate(note.id, { title });
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
            <div 
              className={cn(
                "color-picker-trigger cursor-pointer rounded-full w-5 h-5 border border-gray-200",
                getColorButtonClass()
              )}
              onClick={handleColorPickerOpen}
              title="Change color"
            ></div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              onClick={handleDelete}
              title="Delete note"
            >
              <i className="ri-delete-bin-line text-sm"></i>
            </Button>
          </div>
        </div>
        
        <div className="note-content h-[calc(100%-60px)] p-3 overflow-auto">
          <div 
            ref={contentRef}
            className="note-text min-h-[40px]" 
            contentEditable
            onInput={handleContentChange}
            onMouseUp={handleContentSelection}
            onKeyUp={handleContentSelection}
          />
        </div>
        
        <div className={cn(
          "note-footer flex justify-between items-center p-2 border-t",
          getBorderColor()
        )}>
          <span className="text-xs text-gray-500 dark:text-gray-700">{formattedDate}</span>
          <div 
            className="resize-handle cursor-nwse-resize flex items-center justify-center"
            onMouseDown={handleResizeStart}
            title="Resize"
          >
            <i className="ri-corner-right-down-line text-gray-400 text-xs"></i>
          </div>
        </div>
      </div>
      
      {isColorPickerOpen && (
        <ColorPicker 
          position={colorPickerPosition}
          onSelectColor={handleColorChange}
          onClose={() => setIsColorPickerOpen(false)}
        />
      )}
      
      {isFormatToolbarOpen && (
        <FormatToolbar 
          position={formatToolbarPosition}
          onFormat={handleFormatAction}
          onClose={() => setIsFormatToolbarOpen(false)}
        />
      )}
    </>
  );
}
