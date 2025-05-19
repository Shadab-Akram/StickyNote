import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MousePointer, Move, ZoomIn, ZoomOut, Maximize, FilePlus, Palette, Trash2, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialDialog({ isOpen, onClose }: TutorialDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg sm:text-xl">Sticky Canvas Board Guide</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            A comprehensive guide to help you use all features of the app
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="canvas">
          <TabsList className="grid w-full grid-cols-3 h-auto mb-3">
            <TabsTrigger value="canvas" className="text-xs sm:text-sm py-1.5 px-1 sm:py-2 sm:px-2">Canvas</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs sm:text-sm py-1.5 px-1 sm:py-2 sm:px-2">Notes</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs sm:text-sm py-1.5 px-1 sm:py-2 sm:px-2">Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="canvas" className="space-y-3">
            <div className="space-y-3 pt-1">
              {/* Canvas Navigation Items */}
              {[
                {
                  icon: <Move className="h-3 w-3 sm:h-4 sm:w-4" />,
                  title: "Navigate the Canvas",
                  description: "Click and drag anywhere on the empty canvas to move around. The canvas is infinite."
                },
                {
                  icon: <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />,
                  title: "Zoom In/Out",
                  description: "Use your mouse wheel or pinch gesture while holding Ctrl/Cmd to zoom in and out."
                },
                {
                  icon: <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />,
                  title: "Fullscreen Mode",
                  description: "Toggle fullscreen mode using the button in the bottom right corner."
                },
                {
                  icon: <MousePointer className="h-3 w-3 sm:h-4 sm:w-4" />,
                  title: "Mini Map",
                  description: "Use the mini map to see an overview of your notes. Click to navigate to that area."
                }
              ].map((item, index) => (
                <div key={`canvas-${index}`} className={cn(
                  "flex items-start gap-2 sm:gap-3 pb-2",
                  index < 3 && "border-b"
                )}>
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200">{item.title}</h3>
                    <p className="text-xs sm:text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-3">
            <div className="space-y-3 pt-1">
              {/* Notes Items */}
              {[
                {
                  icon: <FilePlus className="h-3 w-3 sm:h-4 sm:w-4" />,
                  title: "Creating Notes",
                  description: "Click the \"Add Note\" button to create a new note. Notes are auto-saved."
                },
                {
                  icon: <GripHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />,
                  title: "Moving Notes",
                  description: "Drag notes by their header to reposition them."
                },
                {
                  icon: <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor" className="text-amber-600 sm:w-4 sm:h-4">
                    <path d="M0 8.5L1.5 10L10 1.5L8.5 0L0 8.5Z" />
                  </svg>,
                  title: "Resizing Notes",
                  description: "Use the resize handle in the bottom-right corner to adjust size."
                },
                {
                  icon: <Palette className="h-3 w-3 sm:h-4 sm:w-4" />,
                  title: "Customizing Colors",
                  description: "Click the color circle to change a note's color."
                },
                {
                  icon: <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />,
                  title: "Deleting Notes",
                  description: "Use the trash icon to delete a note."
                }
              ].map((item, index, arr) => (
                <div key={`notes-${index}`} className={cn(
                  "flex items-start gap-2 sm:gap-3 pb-2",
                  index < arr.length - 1 && "border-b"
                )}>
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200">{item.title}</h3>
                    <p className="text-xs sm:text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-3">
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-2 sm:gap-3 pb-2 border-b">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <span className="text-xs sm:text-sm font-bold">⌨️</span>
                </div>
                <div>
                  <h3 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200">Keyboard Shortcuts</h3>
                  <ul className="text-xs space-y-1 mt-1">
                    <li><span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">Ctrl +</span> Zoom in</li>
                    <li><span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">Ctrl -</span> Zoom out</li>
                    <li><span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">Ctrl 0</span> Reset zoom</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-2 sm:gap-3 pb-2 border-b">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <span className="text-xs sm:text-sm font-bold">💡</span>
                </div>
                <div>
                  <h3 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200">Organization Tips</h3>
                  <ul className="text-xs space-y-1 mt-1">
                    <li>Use colors for different categories</li>
                    <li>Group related notes in clusters</li>
                    <li>Use grid for alignment</li>
                    <li>Mini-map helps with navigation</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <span className="text-xs sm:text-sm font-bold">💾</span>
                </div>
                <div>
                  <h3 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200">Data Storage</h3>
                  <p className="text-xs sm:text-sm">Notes are saved to your browser's local storage, available only on this device.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-3 sm:mt-4">
          <Button className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10" onClick={onClose}>
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
