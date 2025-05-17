import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "./ThemeProvider";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "./auth/AuthDialog";

interface ToolbarProps {
  onAddNote: () => void;
  onToggleGrid: () => void;
  isGridVisible: boolean;
  onOpenSettings: () => void;
  onClearAll: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function Toolbar({
  onAddNote,
  onToggleGrid,
  isGridVisible,
  onOpenSettings,
  onClearAll,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}: ToolbarProps) {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  
  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const openAuthDialog = () => {
    setIsAuthDialogOpen(true);
  };
  
  const closeAuthDialog = () => {
    setIsAuthDialogOpen(false);
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <>
      <div className="toolbar fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onAddNote} 
                className="flex items-center"
              >
                <i className="ri-sticky-note-add-line mr-1.5"></i>
                <span className="hidden sm:inline">Add Note</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create a new note</TooltipContent>
          </Tooltip>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onUndo} 
                disabled={!canUndo}
                className="text-gray-500 disabled:opacity-50 dark:text-gray-400"
              >
                <i className="ri-arrow-go-back-line"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onRedo} 
                disabled={!canRedo}
                className="text-gray-500 disabled:opacity-50 dark:text-gray-400"
              >
                <i className="ri-arrow-go-forward-line"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
          
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearAll}
                className="hidden text-gray-700 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 sm:flex"
              >
                <i className="ri-delete-bin-line mr-1.5"></i>
                <span>Clear All</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete all notes</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleGrid}
                className="mr-2 text-gray-500 dark:text-gray-400 hidden sm:flex"
              >
                <i className={`ri-layout-grid-line ${isGridVisible ? "text-primary" : ""}`}></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle grid</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDarkMode}
                className="text-gray-500 dark:text-gray-400"
              >
                <i className="ri-moon-line dark:hidden"></i>
                <i className="ri-sun-line hidden dark:block"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle dark mode</TooltipContent>
          </Tooltip>
          
          <Separator orientation="vertical" className="mx-2 h-6" />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <i className="ri-user-line"></i>
                  <span className="hidden sm:inline">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <i className="ri-logout-box-line mr-2"></i>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={openAuthDialog} className="gap-2">
              <i className="ri-login-box-line"></i>
              <span className="hidden sm:inline">Log in</span>
            </Button>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onOpenSettings}
                className="ml-2 text-gray-500 dark:text-gray-400"
              >
                <i className="ri-settings-3-line"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <AuthDialog isOpen={isAuthDialogOpen} onClose={closeAuthDialog} />
    </>
  );
}
