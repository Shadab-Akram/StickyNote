import { useState, useEffect } from 'react';

export const useSelection = () => {
  const [selection, setSelection] = useState<{
    position: DOMRect | null;
    text: string;
  }>({ position: null, text: '' });

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        setSelection({
          position: range.getBoundingClientRect(),
          text: selection.toString(),
        });
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  return selection;
}; 