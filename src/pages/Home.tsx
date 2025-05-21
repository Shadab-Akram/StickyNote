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

  const handleAddNote = () => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 },
      color: defaultNoteColor === 'random' ? getRandomColor() : defaultNoteColor,
      createdAt: now,
      updatedAt: now,
      zIndex: notes.length + 1
    };
    addNote(newNote);
  };

  const handleClearAll = () => {
    setIsConfirmOpen(true);
  };

  const confirmClearAll = () => {
    clearAllNotes();
    setIsConfirmOpen(false);
  };

  const getRandomColor = () => {
    const colors = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'];
    return colors[Math.floor(Math.random() * colors.length)];
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
        description="Are you sure you want to clear all notes? This action cannot be undone."
      />
      
      <TutorialDialog
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
