import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { ThemeProvider } from "./components/ThemeProvider";
import { useEffect, useState, useCallback } from 'react';
import { Nuxpad } from '@/components/Nuxpad';
import { FloatingNavbar } from '@/components/FloatingNavbar';
import { Note } from '@/lib/schema';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { LoadingScreen } from './components/LoadingScreen';
import { OnboardingGuide } from './components/OnboardingGuide';
import { TutorialDialog } from './components/TutorialDialog';
import { Button } from './components/ui/button';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SharedNoteData {
  content: string;
  position: { x: number; y: number };
  color?: string;
  title?: string;
}

export default function App() {
  // State management
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('onboardingComplete') === 'true';
  });

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle loading sequence
  const handleLoadingComplete = useCallback(() => {
    // First, mark loading as complete
    setIsLoading(false);
    
    // After a short delay, show the app
    setTimeout(() => {
      setIsAppReady(true);
      
      // Show onboarding only if user hasn't completed it
      if (!hasCompletedOnboarding) {
        setTimeout(() => {
          setShowOnboarding(true);
        }, 500);
      }
    }, 300);
  }, [hasCompletedOnboarding]);

  // Handle shared note from URL
  useEffect(() => {
    const handleSharedNote = () => {
      const params = new URLSearchParams(window.location.search);
      const sharedNoteData = params.get('share');
      
      if (sharedNoteData) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(sharedNoteData)) as SharedNoteData;
          const now = new Date().toISOString();
          
          const sharedNote: Note = {
            id: nanoid(),
            title: decodedData.title || "Shared Note",
            content: decodedData.content,
            position: decodedData.position,
            size: { width: 300, height: 200 },
            color: decodedData.color,
            createdAt: now,
            updatedAt: now,
            zIndex: notes.length + 1
          };
          
          setNotes(prev => [...prev, sharedNote]);
          window.history.replaceState({}, '', window.location.pathname);
          toast.success('Shared note added to canvas!');
        } catch (err) {
          console.error('Error parsing shared note:', err);
          toast.error('Failed to load shared note');
        }
      }
    };

    if (isAppReady) {
      handleSharedNote();
    }
  }, [isAppReady, notes.length]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem('onboardingComplete', 'true');
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem('onboardingComplete', 'true');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="Nuxpads-theme">
        <TooltipProvider>
          {/* Loading Screen */}
          {isLoading && (
            <LoadingScreen onLoadingComplete={handleLoadingComplete} />
          )}
          
          {/* Main App Content */}
          <div 
            className={cn(
              "h-screen w-full overflow-hidden flex flex-col bg-background text-foreground",
              "transition-opacity duration-300",
              isAppReady ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Help Button - Show only on desktop and when not in onboarding */}
            {!isMobile && !showOnboarding && isAppReady && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="fixed bottom-4 right-4 z-[60] rounded-full w-10 h-10 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800"
                    onClick={() => setShowTutorial(true)}
                  >
                    <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>Need help?</p>
                  <p className="text-xs text-muted-foreground">Click for tutorial guide</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Switch>
              <Route path="/" component={Home} />
              <Route component={NotFound} />
            </Switch>
          </div>

          {/* Onboarding Guide - Shows after app is ready for new users */}
          {showOnboarding && isAppReady && (
            <OnboardingGuide
              onComplete={handleOnboardingComplete}
              onSkip={handleOnboardingSkip}
              isMobile={isMobile}
            />
          )}

          {/* Tutorial Dialog - Only shows when help button is clicked */}
          <TutorialDialog
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
          />

          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
