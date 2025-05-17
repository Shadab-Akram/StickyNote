import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialDialog({ isOpen, onClose }: TutorialDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Welcome to Sticky Notes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 text-gray-600 dark:text-gray-400">
          <p>Get started with your digital sticky notes board:</p>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <i className="ri-add-line"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Create Notes</h3>
              <p className="text-sm">Click the "Add Note" button to create a new sticky note anywhere on the board.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <i className="ri-drag-move-2-line"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Move & Resize</h3>
              <p className="text-sm">Drag notes by their header to reposition them. Resize from the bottom-right corner.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <i className="ri-palette-line"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Customize</h3>
              <p className="text-sm">Click the color circle on any note to change its background color.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <i className="ri-save-line"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Automatic Saving</h3>
              <p className="text-sm">Your notes are automatically saved to your browser's local storage.</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
