# Sticky Note

An infinite canvas sticky notes application that lets you organize your thoughts, ideas, and tasks visually. The app features a responsive design that works on desktop, tablet, and mobile devices.


## Features

- 📝 Create, edit, and delete sticky notes
- 🌈 Customize note colors
- 📱 Fully responsive design (desktop, tablet, mobile)
- 🔄 Infinite canvas with pan and zoom
- ⏪ Undo/redo functionality
- 📊 Optional grid for alignment
- 🖱️ Drag and resize notes
- 🌓 Light/dark mode support
- 💾 Local storage persistence

## Mobile View

Sticky Canvas Board is optimized for mobile devices with touch controls for panning, zooming, and note manipulation.


## Tablet View

The application adapts seamlessly to tablet devices, providing an optimal experience between desktop and mobile.



## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/sticky-canvas-board.git
   cd sticky-canvas-board
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage Instructions

### Creating Notes

Click the "Add Note" button in the toolbar to create a new sticky note. Notes are automatically saved to your browser's local storage.

### Moving Notes

Drag notes by their header to reposition them anywhere on the infinite canvas.

### Resizing Notes

Use the resize handle in the bottom-right corner of any note to adjust its size.

### Customizing Colors

Click the color circle in the note to change its color. Choose from 6 different colors to organize your notes.

### Canvas Navigation

- **Pan**: Click and drag on empty canvas areas
- **Zoom**: 
  - Desktop: Use mouse wheel or trackpad pinch gesture
  - Mobile: Use pinch gesture to zoom in/out
- **Reset View**: Click the reset button or use keyboard shortcut

## Keyboard Shortcuts

- `Ctrl +` / `Cmd +`: Zoom in
- `Ctrl -` / `Cmd -`: Zoom out
- `Ctrl 0` / `Cmd 0`: Reset zoom
- `Ctrl Z` / `Cmd Z`: Undo
- `Ctrl Y` / `Cmd Y` or `Ctrl Shift Z` / `Cmd Shift Z`: Redo

## Mobile-Specific Tips

- Use two fingers to pan the canvas
- Pinch to zoom in and out
- Tap and hold the note header to drag
- Tap the tutorial button for a mobile-optimized guide

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Vite
- Shadcn UI Components

## License

[MIT License](LICENSE)


---
 