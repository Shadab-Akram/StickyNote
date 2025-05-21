import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FilePlus, Move, ZoomIn, Palette, X, Hand, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingGuideProps {
  onComplete: () => void;
  onSkip: () => void;
  isMobile: boolean;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode | null;
  position: string;
  targetSelector?: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

const createSteps = (isMobile: boolean): Step[] => {
  if (isMobile) {
    return [
      {
        id: 'welcome',
        title: 'Welcome to Sticky Canvas!',
        description: "Let's show you how to use the app on your mobile device.",
        icon: null,
        position: 'bottom',
      },
      {
        id: 'add-note-mobile',
        title: 'Create Notes',
        description: 'Tap the + button in the toolbar to create a new note.',
        icon: <FilePlus className="w-5 h-5" />,
        position: 'bottom',
        targetSelector: '[data-add-note]',
      },
      {
        id: 'navigation-mobile',
        title: 'Navigate the Canvas',
        description: 'Use two fingers to pan around. Pinch to zoom in and out.',
        icon: <Move className="w-5 h-5" />,
        position: 'bottom',
      },
      {
        id: 'hand-tool-mobile',
        title: 'Hand Tool',
        description: 'Toggle the hand tool for easier navigation on touch screens.',
        icon: <Hand className="w-5 h-5" />,
        position: 'bottom',
        targetSelector: '[data-hand-tool]',
      },
      {
        id: 'customize-mobile',
        title: 'Work with Notes',
        description: 'Tap a note to edit. Use the color picker to change colors, and drag corners to resize.',
        icon: <Palette className="w-5 h-5" />,
        position: 'bottom',
      },
      {
        id: 'menu-mobile',
        title: 'More Options',
        description: 'Tap the menu button for settings, theme, grid, and more features.',
        icon: <Menu className="w-5 h-5" />,
        position: 'bottom',
        targetSelector: '[data-menu-button]',
      }
    ];
  }

  // Desktop steps
  return [
    {
      id: 'welcome',
      title: 'Welcome to Sticky Canvas!',
      description: "Let's quickly show you around the workspace.",
      icon: null,
      position: 'center',
    },
    {
      id: 'add-note',
      title: 'Create Notes',
      description: 'Click the "Add Note" button to create your first note.',
      icon: <FilePlus className="w-5 h-5" />,
      position: 'bottom-center',
      targetSelector: '[data-add-note]',
    },
    {
      id: 'navigation',
      title: 'Navigate the Canvas',
      description: 'Hold spacebar and drag, or use the hand tool to move around.',
      icon: <Move className="w-5 h-5" />,
      position: 'center',
    },
    {
      id: 'zoom',
      title: 'Zoom Controls',
      description: 'Use Ctrl/Cmd + scroll wheel or the zoom buttons to zoom in and out.',
      icon: <ZoomIn className="w-5 h-5" />,
      position: 'bottom-center',
      targetSelector: '[data-zoom-controls]',
    },
    {
      id: 'customize',
      title: 'Customize Your Notes',
      description: 'Click to edit, use the color picker to change colors, and drag corners to resize.',
      icon: <Palette className="w-5 h-5" />,
      position: 'center',
    }
  ];
};

const getPositionClasses = (position: string, isMobile: boolean) => {
  if (isMobile) {
    // Mobile: Always centered at bottom with proper spacing from edges
    return "fixed left-[5%] bottom-24 -translate-x-[50%]";
  }

  switch (position) {
    case 'top-left':
      return 'fixed top-4 left-4';
    case 'bottom-right':
      return 'fixed bottom-20 right-4';
    case 'bottom-center':
      return 'fixed bottom-20 left-1/2 -translate-x-1/2';
    case 'center':
      return 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    default:
      return 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
  }
};

export function OnboardingGuide({ onComplete, onSkip, isMobile }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const steps = createSteps(isMobile);
  const step = steps[currentStep];

  useEffect(() => {
    // Save onboarding progress to localStorage
    if (currentStep === steps.length) {
      localStorage.setItem('onboardingComplete', 'true');
      onComplete();
    }
  }, [currentStep, onComplete, steps.length]);

  useEffect(() => {
    // Highlight target element if specified
    if (step?.targetSelector) {
      const target = document.querySelector(step.targetSelector);
      if (target) {
        target.classList.add('ring-2', 'ring-sky-500', 'ring-offset-2');
      }
      return () => {
        if (target) {
          target.classList.remove('ring-2', 'ring-sky-500', 'ring-offset-2');
        }
      };
    }
  }, [step]);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  if (currentStep >= steps.length) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Semi-transparent overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[55]"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Guide Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "z-[56] bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4",
              "border border-sky-100 dark:border-sky-900",
              isMobile 
                ? "w-[92%] max-w-[320px] mx-auto" // Slightly wider on mobile
                : "w-[320px]",
              getPositionClasses(step.position, isMobile)
            )}
            style={{
              // Ensure the guide doesn't overflow on mobile
              maxWidth: isMobile ? 'calc(100vw - 32px)' : '320px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            {step.icon && (
              <motion.div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-2 sm:mb-3"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {step.icon}
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="px-1" // Add some horizontal padding
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                {step.description}
              </p>
            </motion.div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-1.5 mt-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-200",
                    currentStep === index 
                      ? "bg-sky-500 w-3" 
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center mt-3 sm:mt-4 gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9 flex-1"
                onClick={handleSkip}
              >
                Skip guide
              </Button>
              <Button
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9 flex-1"
                onClick={handleNext}
              >
                {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 