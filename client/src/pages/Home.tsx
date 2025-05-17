import { useState, useEffect } from "react";
import { Canvas } from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { Settings } from "@/components/Settings";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TutorialDialog } from "@/components/TutorialDialog";
import { useNotes } from "@/hooks/useNotes";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isGridVisible, setIsGridVisible] = useLocalStorage('isGridVisible', false);
  const [gridSize, setGridSize] = useLocalStorage('gridSize', 40);
  const [defaultNoteColor, setDefaultNoteColor] = useLocalStorage('defaultNoteColor', 'random');
  const [defaultNoteSize, setDefaultNoteSize] = useLocalStorage('defaultNoteSize', 'medium');
  
  const { 
    notes, 
    addNote, 
    deleteNote, 
    updateNote, 
    clearAllNotes,
    canUndo,
    canRedo,
    undo,
    redo
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
    // Calculate position in the center of the visible canvas
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scrollLeft = canvas.scrollLeft;
    const scrollTop = canvas.scrollTop;
    
    let width = 220;
    let height = 200;
    
    // Set note size based on default setting
    if (defaultNoteSize === 'small') {
      width = 180;
      height = 160;
    } else if (defaultNoteSize === 'large') {
      width = 280;
      height = 260;
    }
    
    // Calculate center position
    let x = scrollLeft + rect.width / 2 - width / 2;
    let y = scrollTop + rect.height / 2 - height / 2;
    
    // Apply grid snapping if enabled
    if (isGridVisible) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    
    // Determine color
    let color;
    if (defaultNoteColor === 'random') {
      const colors = ['yellow', 'green', 'blue', 'purple', 'pink', 'orange'];
      color = colors[Math.floor(Math.random() * colors.length)];
    } else {
      color = defaultNoteColor;
    }
    
    addNote({
      x,
      y,
      width,
      height,
      color
    });
  };

  const handleClearAll = () => {
    setIsConfirmOpen(true);
  };

  const confirmClearAll = () => {
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

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Toolbar 
        onAddNote={handleAddNote}
        onToggleGrid={() => setIsGridVisible(!isGridVisible)}
        isGridVisible={isGridVisible}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearAll={handleClearAll}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
      
      <Canvas 
        notes={notes}
        isGridVisible={isGridVisible}
        gridSize={gridSize}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
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
