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

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialDialog({ isOpen, onClose }: TutorialDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] w-[95%] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-2 sm:mb-0">
          <DialogTitle className="text-lg sm:text-xl">Sticky Canvas Board Guide</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            A comprehensive guide to help you use all features of the app
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="canvas">
          <TabsList className="flex flex-col sm:grid sm:grid-cols-3 mb-4 w-full">
            <TabsTrigger value="canvas" className="py-2 text-sm font-medium">Canvas Navigation</TabsTrigger>
            <TabsTrigger value="notes" className="py-2 text-sm font-medium">Working with Notes</TabsTrigger>
            <TabsTrigger value="tips" className="py-2 text-sm font-medium">Tips & Shortcuts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="canvas" className="space-y-3">
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Move className="h-5 w-5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Navigate the Canvas</h3>
                  <p className="text-sm sm:text-xs mt-1">Click and drag anywhere on the empty canvas to move around. The canvas is infinite, allowing you to organize your notes across a large space.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <ZoomIn className="h-5 w-5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Zoom In/Out</h3>
                  <p className="text-sm sm:text-xs mt-1">Pinch to zoom on mobile. On desktop, use your mouse wheel while holding Ctrl/Cmd. The zoom level is displayed in the bottom right corner.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Maximize className="h-5 w-5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Fullscreen Mode</h3>
                  <p className="text-sm sm:text-xs mt-1">Toggle fullscreen mode using the button in the bottom right corner for an immersive experience.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <MousePointer className="h-5 w-5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Mini Map</h3>
                  <p className="text-sm sm:text-xs mt-1">Use the mini map in the bottom left corner to see an overview of your notes. Tap anywhere on the map to navigate directly to that area.</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-3">
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <FilePlus className="h-5 w-5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Creating Notes</h3>
                  <p className="text-sm sm:text-xs mt-1">Tap the "Add Note" button to create a new note. Notes are automatically saved to your browser's local storage.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <GripHorizontal className="h-5 w-5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Moving Notes</h3>
                  <p className="text-sm sm:text-xs mt-1">Drag notes by their header to reposition them. If grid snapping is enabled in settings, notes will snap to the grid.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <svg width="18" height="18" viewBox="0 0 10 10" fill="currentColor" className="text-amber-600 sm:w-4 sm:h-4">
                    <path d="M0 8.5L1.5 10L10 1.5L8.5 0L0 8.5Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Resizing Notes</h3>
                  <p className="text-sm sm:text-xs mt-1">Use the resize handle in the bottom-right corner of any note to adjust its size. The size is automatically saved.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Palette className="h-5 w-5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Customizing Colors</h3>
                  <p className="text-sm sm:text-xs mt-1">Tap the color circle in the top-right of any note to change its color. Choose from 6 different colors to organize your notes.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Deleting Notes</h3>
                  <p className="text-sm sm:text-xs mt-1">Use the trash icon in the top-right corner of a note to delete it. Deleted notes cannot be recovered.</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-3">
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <span className="font-bold text-base">⌨️</span>
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Keyboard Shortcuts</h3>
                  <ul className="text-sm sm:text-xs space-y-2 sm:space-y-1 mt-2 sm:mt-1">
                    <li><span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">Ctrl +</span> or <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">Cmd +</span>: Zoom in</li>
                    <li><span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">Ctrl -</span> or <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">Cmd -</span>: Zoom out</li>
                    <li><span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">Ctrl 0</span> or <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">Cmd 0</span>: Reset zoom</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <span className="font-bold text-base">💡</span>
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Organization Tips</h3>
                  <ul className="text-sm sm:text-xs space-y-2 sm:space-y-1 mt-2 sm:mt-1">
                    <li>Use different colors for different categories</li>
                    <li>Group related notes together</li>
                    <li>Use the grid for precise alignment</li>
                    <li>The mini-map helps navigate large collections</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <span className="font-bold text-base">💾</span>
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-sm text-gray-800 dark:text-gray-200">Data Storage</h3>
                  <p className="text-sm sm:text-xs mt-1">Notes are saved to your browser's local storage and only available on this device. Consider taking screenshots of important notes.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4 sm:mt-2">
          <Button onClick={onClose} className="w-full sm:w-auto text-base sm:text-sm py-2">
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
