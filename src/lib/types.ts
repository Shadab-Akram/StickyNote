export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface AppSettings {
  isGridVisible: boolean;
  gridSize: number;
  defaultNoteColor: string;
  defaultNoteSize: string;
  isDarkMode: boolean;
}
