import { StickyNote } from "./StickyNote";
import { ClientNote } from "@shared/schema";
import { cn } from "@/lib/utils";

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
  const handleBringToFront = (id: string) => {
    // Find the highest z-index
    const highestZ = Math.max(...notes.map(note => note.zIndex), 0);
    onUpdateNote(id, { zIndex: highestZ + 1 });
  };
  
  return (
    <div 
      id="canvas" 
      className="absolute inset-0 mt-14 touch-none overflow-auto transition-colors duration-200 bg-gray-50 dark:bg-gray-900"
    >
      {/* Grid overlay */}
      <div 
        id="gridOverlay" 
        className={cn("pointer-events-none absolute inset-0", isGridVisible ? "" : "hidden")}
        style={{
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
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
  );
}
