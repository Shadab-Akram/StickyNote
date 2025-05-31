import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, ZoomIn, ZoomOut, RotateCcw, Grid, Hand, Maximize, Minimize, Undo, Redo, HelpCircle, Settings, Trash2, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect, useCallback } from "react";

interface FloatingNavbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  isGridVisible: boolean;
  onToggleGrid: () => void;
  onAddNote: () => void;
  isDragMode: boolean;
  onToggleDragMode: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenSettings: () => void;
  onClearAll: () => void;
  onOpenHelp: () => void;
}

export function FloatingNavbar({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  isGridVisible,
  onToggleGrid,
  onAddNote,
  isDragMode,
  onToggleDragMode,
  isFullscreen,
  onToggleFullscreen,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenSettings,
  onClearAll,
  onOpenHelp
}: FloatingNavbarProps) {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Define menu items for vertical menu in logical order
  const menuItems = [
    { icon: <Grid className="h-5 w-5" />, label: "Grid", onClick: onToggleGrid, active: isGridVisible },
    { icon: theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />, label: "Theme", onClick: toggleDarkMode },
    { icon: isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />, label: isFullscreen ? "Exit Fullscreen" : "Fullscreen", onClick: onToggleFullscreen },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", onClick: onOpenSettings },
    { icon: <HelpCircle className="h-5 w-5" />, label: "Help", onClick: onOpenHelp },
    { icon: <RotateCcw className="h-5 w-5" />, label: "Reset View", onClick: onReset },
    { icon: <Trash2 className="h-5 w-5" />, label: "Clear All", onClick: onClearAll }
  ];

  // Handle click outside with improved touch support
  const handleClickOutside = useCallback((e: MouseEvent | TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      isMobileMenuOpen && 
      !target.closest('.mobile-menu') && 
      !target.closest('.mobile-menu-toggle')
    ) {
      e.stopPropagation();
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [isMobileMenuOpen, handleClickOutside]);

  const handleMenuToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  if (isMobile) {
    return (
      <>
        {/* Mobile floating navbar - minimal version */}
        <div className="fixed top-4 left-0 right-0 flex justify-center" style={{ zIndex: 40 }}>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg py-2 px-3 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            {onUndo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); onUndo(); }}
                    disabled={!canUndo}
                    className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo</TooltipContent>
              </Tooltip>
            )}

            {onRedo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); onRedo(); }}
                    disabled={!canRedo}
                    className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Mobile bottom toolbar */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center" style={{ zIndex: 41 }}>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg py-2 px-3 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onAddNote(); }}
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  data-add-note
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Note</TooltipContent>
            </Tooltip>

            <div className="text-xs font-medium px-1 min-w-[40px] text-center">
              {Math.round(scale * 100)}%
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onToggleDragMode(); }}
                  className={`h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isDragMode ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                  data-hand-tool
                >
                  <Hand className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Hand Tool</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Mobile menu toggle button with vertical menu items */}
        <div 
          className="fixed bottom-4 right-4 mobile-menu-toggle" 
          style={{ zIndex: 50 }}
          onClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Vertical staggered menu items */}
          <div 
            className="mobile-menu"
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, index) => (
              <div 
                key={index}
                style={{ 
                  position: 'absolute',
                  transitionDelay: `${isMobileMenuOpen ? index * 40 : (menuItems.length - index - 1) * 30}ms`,
                  bottom: isMobileMenuOpen ? `${(index + 1) * 54}px` : '0px',
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: isMobileMenuOpen ? 'scale(1)' : 'scale(0.5)',
                  pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
                  right: '4px',
                  touchAction: 'none',
                  willChange: 'transform, opacity'
                }}
                className="transition-all duration-300 ease-out mb-2"
                onClick={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        item.onClick(); 
                        setIsMobileMenuOpen(false);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        item.onClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`h-12 w-12 rounded-full shadow-md ${
                        item.active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white text-gray-800 dark:bg-slate-700/90 dark:text-white'
                      } hover:bg-primary/90 dark:hover:bg-primary/90`}
                      style={{ touchAction: 'none' }}
                    >
                      {item.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>

          {/* Main menu button */}
          <Button
            variant="default"
            size="icon"
            onClick={handleMenuToggle}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMenuToggle(e);
            }}
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 relative"
            style={{ 
              touchAction: 'none',
              willChange: 'transform'
            }}
            data-menu-button
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </Button>
        </div>
      </>
    );
  }

  // Desktop version
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg py-2 px-3 z-[9999] backdrop-blur-sm border border-gray-200 dark:border-gray-700">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onAddNote(); }}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            data-add-note
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Note</TooltipContent>
      </Tooltip>

      {onUndo && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
      )}

      {onRedo && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>
      )}

      <div className="h-4 border-r border-gray-300 dark:border-gray-600 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDragMode}
            className={`h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isDragMode ? "bg-gray-200 dark:bg-gray-700" : ""}`}
            data-hand-tool
          >
            <Hand className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Hand</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleGrid}
            className={`h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isGridVisible ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Grid</TooltipContent>
      </Tooltip>

      <div className="h-4 border-r border-gray-300 dark:border-gray-600 mx-1" />

      <div data-zoom-controls className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomOut}
              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={scale <= 0.25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>

        <div className="text-xs font-medium px-1 min-w-[40px] text-center">
          {Math.round(scale * 100)}%
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomIn}
              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={scale >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reset</TooltipContent>
      </Tooltip>
      
      <div className="h-4 border-r border-gray-300 dark:border-gray-600 mx-1" />
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</TooltipContent>
      </Tooltip>
      
      <div className="h-4 border-r border-gray-300 dark:border-gray-600 mx-1" />
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearAll}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Clear All</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Theme</TooltipContent>
      </Tooltip>
    </div>
  );
}

// Helper component for mobile tool buttons
function ToolButton({ 
  onClick, 
  icon, 
  label, 
  disabled = false, 
  active = false 
}: { 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  disabled?: boolean; 
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        disabled={disabled}
        className={`h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${active ? "bg-gray-200 dark:bg-gray-700" : ""}`}
      >
        {icon}
      </Button>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
} 