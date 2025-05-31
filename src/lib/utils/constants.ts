export const APP_NAME = 'Mermaid GUI v2.0';
export const APP_VERSION = '2.0.0';

export const DEFAULT_MERMAID_CODE = `graph TD
    A[Start] --> B(World)
    B --> C{Decision?}
    C -->|Yes| D[Result1]
    C -->|No| E[Result2]`;

export const SUPPORTED_FORMATS = ['png', 'svg', 'pdf', 'jpg'] as const;
export const DEFAULT_FORMAT = 'png';

export const KEYBOARD_SHORTCUTS = {
  NEW_FILE: 'Ctrl+N',
  OPEN_FILE: 'Ctrl+O',
  SAVE_FILE: 'Ctrl+S',
  GENERATE: 'Ctrl+E',
  FIND: 'Ctrl+F',
} as const;

export const DEBOUNCE_DELAY = 500;
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
