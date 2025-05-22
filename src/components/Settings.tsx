import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTheme } from "./ThemeProvider";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: {
    gridSize: number;
    defaultNoteColor: string;
    defaultNoteSize: string;
  }) => void;
  gridSize: number;
  defaultNoteColor: string;
  defaultNoteSize: string;
  isGridVisible: boolean;
  onToggleGrid: (value: boolean) => void;
}

export function Settings({
  isOpen,
  onClose,
  onSave,
  gridSize: initialGridSize,
  defaultNoteColor: initialColor,
  defaultNoteSize: initialSize,
  isGridVisible,
  onToggleGrid
}: SettingsProps) {
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [defaultNoteColor, setDefaultNoteColor] = useState(initialColor);
  const [defaultNoteSize, setDefaultNoteSize] = useState(initialSize);
  const { theme, setTheme } = useTheme();

  // Update state when props change
  useEffect(() => {
    setGridSize(initialGridSize);
    setDefaultNoteColor(initialColor);
    setDefaultNoteSize(initialSize);
  }, [initialGridSize, initialColor, initialSize]);

  const handleSave = () => {
    onSave({
      gridSize,
      defaultNoteColor,
      defaultNoteSize
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Settings</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="darkModeSwitch" className="text-sm text-gray-600 dark:text-gray-400">
                Enable Dark Mode
              </Label>
              <Switch 
                id="darkModeSwitch" 
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="gridSwitch" className="text-sm text-gray-600 dark:text-gray-400">
                Show Grid
              </Label>
              <Switch 
                id="gridSwitch" 
                checked={isGridVisible}
                onCheckedChange={onToggleGrid}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gridSizeSelect" className="text-sm text-gray-600 dark:text-gray-400">
                Grid Size
              </Label>
              <Select
                value={String(gridSize)}
                onValueChange={(value) => setGridSize(Number(value))}
              >
                <SelectTrigger id="gridSizeSelect">
                  <SelectValue placeholder="Select grid size" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="20">Small (20px)</SelectItem>
                  <SelectItem value="40">Medium (40px)</SelectItem>
                  <SelectItem value="80">Large (80px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Note Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="defaultColorSelect" className="text-sm text-gray-600 dark:text-gray-400">
                Default Note Color
              </Label>
              <Select
                value={defaultNoteColor}
                onValueChange={setDefaultNoteColor}
              >
                <SelectTrigger id="defaultColorSelect">
                  <SelectValue placeholder="Select default color" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="random">Random Color</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultSizeSelect" className="text-sm text-gray-600 dark:text-gray-400">
                Default Note Size
              </Label>
              <Select
                value={defaultNoteSize}
                onValueChange={setDefaultNoteSize}
              >
                <SelectTrigger id="defaultSizeSelect">
                  <SelectValue placeholder="Select default size" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="small">Small (180x160px)</SelectItem>
                  <SelectItem value="medium">Medium (220x200px)</SelectItem>
                  <SelectItem value="large">Large (280x260px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
