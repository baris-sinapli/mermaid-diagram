export interface AppState {
  isLoading: boolean;
  mmdcStatus: 'checking' | 'available' | 'unavailable';
  currentTheme: 'dark' | 'light';
}

export interface EditorState {
  code: string;
  hasUnsavedChanges: boolean;
  currentFile: string | null;
  previewSvg: string;
  isGenerating: boolean;
  lastError: string | null;
}

export interface FileState {
  recentFiles: RecentFile[];
  currentDirectory: string | null;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{ label: string; action: () => void }>;
}

export interface SettingsState {
  theme: 'dark' | 'light';
  autoSave: boolean;
  autoSaveInterval: number;
  defaultOutputFormat: DiagramOptions['format'];
  fontSize: number;
}
