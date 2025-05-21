import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { ThemeProvider } from "./components/ThemeProvider";
import { useEffect, useState, useCallback } from 'react';
import { StickyNote } from '@/components/StickyNote';
import { FloatingNavbar } from '@/components/FloatingNavbar';
import { Note } from '@/lib/schema';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

interface SharedNoteData {
  content: string;
  position: { x: number; y: number };
  color?: string;
  title?: string;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);

  // Handle shared note from URL
  useEffect(() => {
    const handleSharedNote = () => {
      const params = new URLSearchParams(window.location.search);
      const sharedNoteData = params.get('share');
      
      if (sharedNoteData) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(sharedNoteData)) as SharedNoteData;
          const now = new Date().toISOString();
          
          // Create a new note from the shared data
          const sharedNote: Note = {
            id: nanoid(),
            title: decodedData.title || "Shared Note",
            content: decodedData.content,
            position: decodedData.position,
            size: { width: 300, height: 200 }, // Default size
            color: decodedData.color,
            createdAt: now,
            updatedAt: now,
            zIndex: notes.length + 1
          };
          
          // Add the shared note to the canvas
          setNotes(prev => [...prev, sharedNote]);
          
          // Clear the URL parameter
          window.history.replaceState({}, '', window.location.pathname);
          
          // Show success message
          toast.success('Shared note added to canvas!');
        } catch (err) {
          console.error('Error parsing shared note:', err);
          toast.error('Failed to load shared note');
        }
      }
    };

    handleSharedNote();
  }, []); // Run once on mount

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="sticky-notes-theme">
        <TooltipProvider>
          <div className="h-screen w-full overflow-hidden flex flex-col bg-background text-foreground">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
