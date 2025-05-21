import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteContent: string;
  notePosition: { x: number; y: number };
  noteColor: string;
}

export function ShareModal({ isOpen, onClose, noteContent, notePosition, noteColor }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const generateShareableURL = () => {
    const noteData = {
      content: noteContent,
      position: notePosition,
      color: noteColor,
      createdAt: new Date().toISOString(),
    };
    
    const encodedData = encodeURIComponent(JSON.stringify(noteData));
    const url = `${window.location.origin}?share=${encodedData}`;
    return url;
  };

  const handleCopyLink = async () => {
    const url = generateShareableURL();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    const url = generateShareableURL();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared Sticky Note',
          text: noteContent,
          url: url,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>
            Share this note with others.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              value={generateShareableURL()}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button onClick={handleShare} className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 