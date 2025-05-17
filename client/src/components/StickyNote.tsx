import { useState, useRef, useEffect } from "react";
import { ClientNote } from "@shared/schema";
import { FormatToolbar } from "./FormatToolbar";
import { ColorPicker } from "./ColorPicker";
import interact from "interact.js";
import { cn } from "@/lib/utils";

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
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [isFormatToolbarOpen, setIsFormatToolbarOpen] = useState(false);
  const [formatToolbarPosition, setFormatToolbarPosition] = useState({ x: 0, y: 0 });
  
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  useEffect(() => {
    const noteElement = noteRef.current;
    if (!noteElement) return;
    
    // Make note draggable
    const draggable = interact(noteElement).draggable({
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true
        })
      ],
      listeners: {
        start() {
          onBringToFront(note.id);
        },
        move(event) {
          const x = (parseFloat(noteElement.getAttribute('data-x') || '0') || 0) + event.dx;
          const y = (parseFloat(noteElement.getAttribute('data-y') || '0') || 0) + event.dy;
          
          // Apply grid snapping if enabled
          const snappedPosition = isGridVisible ? 
            { x: Math.round(x / gridSize) * gridSize, y: Math.round(y / gridSize) * gridSize } : 
            { x, y };
          
          // Update element position
          noteElement.style.transform = `translate(${snappedPosition.x}px, ${snappedPosition.y}px)`;
          
          // Update data attributes
          noteElement.setAttribute('data-x', String(snappedPosition.x));
          noteElement.setAttribute('data-y', String(snappedPosition.y));
        },
        end(event) {
          const x = parseFloat(noteElement.getAttribute('data-x') || '0');
          const y = parseFloat(noteElement.getAttribute('data-y') || '0');
          
          onUpdate(note.id, { x, y });
        }
      }
    });
    
    // Make note resizable
    const resizable = interact(noteElement).resizable({
      edges: { right: true, bottom: true, left: false, top: false },
      restrictSize: {
        min: { width: 150, height: 120 }
      },
      listeners: {
        start() {
          onBringToFront(note.id);
        },
        move(event) {
          let width = event.rect.width;
          let height = event.rect.height;
          
          // Apply grid snapping if enabled
          if (isGridVisible) {
            width = Math.round(width / gridSize) * gridSize;
            height = Math.round(height / gridSize) * gridSize;
          }
          
          // Update element size
          Object.assign(noteElement.style, {
            width: `${width}px`,
            height: `${height}px`
          });
        },
        end(event) {
          const width = parseFloat(noteElement.style.width);
          const height = parseFloat(noteElement.style.height);
          
          onUpdate(note.id, { width, height });
        }
      }
    });
    
    // Set initial position
    noteElement.style.transform = `translate(${note.x}px, ${note.y}px)`;
    noteElement.setAttribute('data-x', String(note.x));
    noteElement.setAttribute('data-y', String(note.y));
    
    return () => {
      draggable.unset();
      resizable.unset();
    };
  }, [note.id, note.x, note.y, onBringToFront, onUpdate, isGridVisible, gridSize]);
  
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    onUpdate(note.id, { 
      content: e.currentTarget.innerHTML 
    });
  };
  
  const handleClick = () => {
    onBringToFront(note.id);
  };
  
  const handleColorPickerOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
    setColorPickerPosition({
      x: buttonRect.left,
      y: buttonRect.bottom + 5
    });
    
    setIsColorPickerOpen(true);
  };
  
  const handleColorChange = (color: string) => {
    onUpdate(note.id, { color });
    setIsColorPickerOpen(false);
  };
  
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
  
  const handleFormatAction = (format: string) => {
    document.execCommand(format, false);
  };
  
  return (
    <>
      <div 
        ref={noteRef}
        onClick={handleClick}
        className={cn(
          "sticky-note absolute rounded-md text-gray-800",
          `bg-${note.color}-100 dark:bg-${note.color}-200/90 dark:text-gray-800`
        )}
        style={{
          width: `${note.width}px`,
          height: `${note.height}px`,
          zIndex: note.zIndex
        }}
        data-id={note.id}
      >
        <div className="note-header cursor-move flex justify-between p-2">
          <div className="note-drag-handle w-full h-5"></div>
          <div 
            className={cn(
              "color-picker-trigger cursor-pointer rounded-full w-5 h-5 border border-gray-300",
              `bg-${note.color}-100`
            )}
            onClick={handleColorPickerOpen}
          ></div>
        </div>
        
        <div className="note-content h-[calc(100%-60px)] p-3 overflow-auto">
          <div 
            className="note-text" 
            contentEditable
            dangerouslySetInnerHTML={{ __html: note.content }}
            onInput={handleContentChange}
            onMouseUp={handleContentSelection}
            onKeyUp={handleContentSelection}
          />
        </div>
        
        <div className={cn(
          "note-footer flex justify-between items-center p-2 border-t",
          `border-${note.color}-200 dark:border-${note.color}-300/50`
        )}>
          <span className="text-xs text-gray-500 dark:text-gray-700">{formattedDate}</span>
          <button 
            className="delete-note text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
            onClick={() => onDelete(note.id)}
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
        
        <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize">
          <i className="ri-corner-right-down-line text-gray-400 text-xs"></i>
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
