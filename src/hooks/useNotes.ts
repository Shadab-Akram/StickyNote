import { useState, useEffect, useCallback } from 'react';
import { noteSchema, Note } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [history, setHistory] = useState<Note[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();
  
  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
    try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
        setHistory([parsedNotes]);
        setHistoryIndex(0);
          } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load saved notes",
          variant: "destructive",
      });
      }
    }
  }, [toast]);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);
  
  // Add to history
  const addToHistory = useCallback((newNotes: Note[]) => {
    // If we're not at the end of history, remove future states
    if (historyIndex < history.length - 1) {
      setHistory(prev => prev.slice(0, historyIndex + 1));
    }
    
    // Limit history to 50 states to prevent excessive memory usage
    setHistory(prev => {
      const newHistory = [...prev, newNotes];
      if (newHistory.length > 50) {
        return newHistory.slice(newHistory.length - 50);
    }
      return newHistory;
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [history, historyIndex]);
  
  const addNote = (note: {
    title: string;
    content: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    color?: string;
  }) => {
    const newNote: Note = {
      ...note,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      zIndex: notes.length + 1
    };
    
    const newNotes = [...notes, newNote];
    setNotes(newNotes);
    addToHistory(newNotes);
  };
  
  const updateNote = (id: string, updates: Partial<Note>) => {
    const noteExists = notes.some(note => note.id === id);
    
    if (!noteExists) {
      return;
    }
    
    // Special handling for position updates to prevent disappearing notes
    if (updates.position) {
      // Validate position values are valid numbers
      const { x, y } = updates.position;
      if (isNaN(x) || isNaN(y)) {
        return;
      }
      
      // Ensure values are within reasonable bounds
      if (x < 0 || y < 0 || x > 20000 || y > 20000) {
        // Allow the update to proceed anyway, but be cautious
      }
    }
    
    const newNotes = notes.map((note) =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    );
    
    setNotes(newNotes);
    addToHistory(newNotes);
  };
  
  const deleteNote = (id: string) => {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    addToHistory(newNotes);
  };
  
  const moveNote = (id: string, position: { x: number; y: number }) => {
    updateNote(id, { position });
  };
  
  const resizeNote = (id: string, size: { width: number; height: number }) => {
    updateNote(id, { size });
  };
  
  const bringToFront = (id: string) => {
    const maxZIndex = Math.max(...notes.map(note => note.zIndex), 0);
    updateNote(id, { zIndex: maxZIndex + 1 });
  };
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setNotes(history[newIndex]);
    }
  }, [canUndo, history, historyIndex]);
  
  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setNotes(history[newIndex]);
    }
  }, [canRedo, history, historyIndex]);
  
  // Add a special function to clear all notes without adding to history
  const clearAllNotes = () => {
    setNotes([]);
    
    // Reset history instead of adding to it
    setHistory([[]]);
    setHistoryIndex(0);
    
    // Save empty array to localStorage
    localStorage.setItem("notes", "[]");
  };
  
  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    moveNote,
    resizeNote,
    bringToFront,
    undo,
    redo,
    canUndo,
    canRedo,
    clearAllNotes
  };
}
