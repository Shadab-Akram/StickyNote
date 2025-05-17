import { useState, useEffect } from 'react';
import { ClientNote, noteSchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

interface NewNoteOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [history, setHistory] = useState<ClientNote[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [highestZIndex, setHighestZIndex] = useState(10);
  const { toast } = useToast();
  
  // Load notes from localStorage on initial render
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('stickyNotes');
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        const validNotes = parsedNotes.filter(note => {
          try {
            noteSchema.parse(note);
            return true;
          } catch (error) {
            return false;
          }
        });
        
        setNotes(validNotes);
        
        // Find highest z-index
        const maxZ = validNotes.reduce((max, note) => 
          Math.max(max, note.zIndex || 0), 10);
        setHighestZIndex(maxZ);
        
        // Initialize history with current state
        setHistory([validNotes]);
        setHistoryIndex(0);
      }
    } catch (error) {
      console.error('Failed to load notes from localStorage', error);
      toast({
        title: 'Failed to load notes',
        description: 'Could not load your saved notes.',
        variant: 'destructive'
      });
    }
  }, [toast]);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('stickyNotes', JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes to localStorage', error);
      toast({
        title: 'Failed to save notes',
        description: 'Could not save your notes.',
        variant: 'destructive'
      });
    }
  }, [notes, toast]);
  
  // Add a new note
  const addNote = (options: NewNoteOptions) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    
    const newNote: ClientNote = {
      id: nanoid(),
      content: '',
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
      color: options.color,
      zIndex: newZIndex,
      createdAt: new Date().toISOString()
    };
    
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    
    // Add to history
    addToHistory(updatedNotes);
    
    return newNote;
  };
  
  // Update an existing note
  const updateNote = (id: string, updates: Partial<ClientNote>) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    );
    
    setNotes(updatedNotes);
    
    // If z-index was updated, track the new highest value
    if (updates.zIndex && updates.zIndex > highestZIndex) {
      setHighestZIndex(updates.zIndex);
    }
    
    // Debounced add to history
    if (updates.x !== undefined || updates.y !== undefined || 
        updates.width !== undefined || updates.height !== undefined || 
        updates.color !== undefined) {
      // Only add to history for position, size, or color changes
      // (not content changes which happen frequently during typing)
      addToHistory(updatedNotes);
    }
  };
  
  // Delete a note
  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    // Add to history
    addToHistory(updatedNotes);
  };
  
  // Clear all notes
  const clearAllNotes = () => {
    setNotes([]);
    
    // Add to history
    addToHistory([]);
  };
  
  // Add current state to history
  const addToHistory = (newState: ClientNote[]) => {
    // Truncate future history if we've done undo operations
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add new state to history
    const updatedHistory = [...newHistory, [...newState]];
    
    // Limit history size (to prevent memory issues)
    const limitedHistory = updatedHistory.length > 50 
      ? updatedHistory.slice(updatedHistory.length - 50) 
      : updatedHistory;
    
    setHistory(limitedHistory);
    setHistoryIndex(limitedHistory.length - 1);
  };
  
  // Undo operation
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setNotes([...history[newIndex]]);
    }
  };
  
  // Redo operation
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setNotes([...history[newIndex]]);
    }
  };
  
  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    clearAllNotes,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    undo,
    redo
  };
}
