import { useState, useEffect, useRef } from "react";
import { Canvas } from "@/components/Canvas";
import { Settings } from "@/components/Settings";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TutorialDialog } from "@/components/TutorialDialog";
import { useNotes } from "@/hooks/useNotes";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Note } from "@/lib/schema";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isGridVisible, setIsGridVisible] = useLocalStorage('isGridVisible', false);
  const [gridSize, setGridSize] = useLocalStorage('gridSize', 40);
  const [defaultNoteColor, setDefaultNoteColor] = useLocalStorage('defaultNoteColor', 'random');
  const [defaultNoteSize, setDefaultNoteSize] = useLocalStorage('defaultNoteSize', 'medium');
  const [scale, setScale] = useState(1);
  
  const { 
    notes, 
    addNote, 
    deleteNote, 
    updateNote,
    undo,
    redo,
    canUndo,
    canRedo,
    clearAllNotes
  } = useNotes();

  useEffect(() => {
    // Check if first visit and show tutorial
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setIsTutorialOpen(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  const handleAddNote = () => {
    // Set note dimensions based on default setting
    let width = 220;
    let height = 200;
    
    if (defaultNoteSize === 'small') {
      width = 180;
      height = 160;
    } else if (defaultNoteSize === 'large') {
      width = 280;
      height = 260;
    }
    
    // Determine color
    let color;
    if (defaultNoteColor === 'random') {
      const colors = ['yellow', 'green', 'blue', 'purple', 'pink', 'orange'];
      color = colors[Math.floor(Math.random() * colors.length)];
    } else {
      color = defaultNoteColor;
    }
    
    // Get the current viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate a position within the visible viewport,
    // but we need to use canvas coordinates (which are centered at 5000,5000)
    const CANVAS_CENTER_X = 5000;
    const CANVAS_CENTER_Y = 5000;
    
    // Add randomization to spread notes out
    const randomOffsetX = Math.floor(Math.random() * 400) - 200; // -200 to 200
    const randomOffsetY = Math.floor(Math.random() * 400) - 200; // -200 to 200
    
    // Create note at the canvas center point plus a small random offset
    addNote({
      title: "New Note",
      content: "",
      position: { 
        x: CANVAS_CENTER_X + randomOffsetX, 
        y: CANVAS_CENTER_Y + randomOffsetY 
      },
      size: { width, height },
      color
    });
  };

  const handleClearAll = () => {
    setIsConfirmOpen(true);
  };

  const confirmClearAll = () => {
    // Use clearAllNotes instead of deleting notes individually
    clearAllNotes();
    setIsConfirmOpen(false);
  };
  
  const handleSaveSettings = (settings: {
    gridSize: number;
    defaultNoteColor: string;
    defaultNoteSize: string;
  }) => {
    setGridSize(settings.gridSize);
    setDefaultNoteColor(settings.defaultNoteColor);
    setDefaultNoteSize(settings.defaultNoteSize);
    setIsSettingsOpen(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.25));
  };

  const handleZoomReset = () => {
    setScale(1);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleZoomReset();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset, undo, redo]);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Canvas 
        notes={notes}
        isGridVisible={isGridVisible}
        gridSize={gridSize}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        scale={scale}
        onScaleChange={setScale}
        onAddNote={handleAddNote}
        onToggleGrid={() => setIsGridVisible(!isGridVisible)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearAll={handleClearAll}
        onOpenHelp={() => setIsTutorialOpen(true)}
      />
      
      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        gridSize={gridSize}
        defaultNoteColor={defaultNoteColor}
        defaultNoteSize={defaultNoteSize}
        isGridVisible={isGridVisible}
        onToggleGrid={setIsGridVisible}
      />
      
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmClearAll}
        title="Confirm Action"
        message="Are you sure you want to clear all notes? This action cannot be undone."
      />
      
      <TutorialDialog
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
