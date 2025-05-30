#!/bin/bash

# 🚀 Mermaid GUI v2.0 - Refactoring Setup Script
# Run this script from your project root directory

echo "🏗️  Starting Mermaid GUI v2.0 Refactoring Setup..."

# 1. Install TypeScript dependencies
echo "📦 Installing TypeScript dependencies..."
npm install -D typescript @tsconfig/svelte @types/node
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier-plugin-svelte

# 2. Create main directory structure
echo "📁 Creating directory structure..."
mkdir -p src/lib/{components,stores,services,types,utils,styles}
mkdir -p src/lib/components/{ui,editor,file,layout}
mkdir -p src/routes

# 3. Create TypeScript configuration
echo "⚙️  Creating TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "extends": "@tsconfig/svelte",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "$lib/*": ["./src/lib/*"],
      "$lib": ["./src/lib"]
    }
  },
  "include": ["src/**/*.d.ts", "src/**/*.ts", "src/**/*.js", "src/**/*.svelte"],
  "exclude": ["node_modules/**", ".svelte-kit/**"]
}
EOF

# 4. Update jsconfig.json for better IDE support
cat > jsconfig.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
  }
}
EOF

# 5. Create Prettier configuration
cat > .prettierrc << 'EOF'
{
  "useTabs": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }]
}
EOF

# 6. Create ESLint configuration
cat > .eslintrc.json << 'EOF'
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2020,
    "extraFileExtensions": [".svelte"]
  },
  "env": {
    "browser": true,
    "es2017": true,
    "node": true
  },
  "overrides": [
    {
      "files": ["*.svelte"],
      "parser": "svelte-eslint-parser",
      "parserOptions": {
        "parser": "@typescript-eslint/parser"
      }
    }
  ]
}
EOF

# 7. Create type definitions
echo "📝 Creating type definitions..."

# Main types
cat > src/lib/types/index.ts << 'EOF'
// Re-export all types
export * from './tauri'
export * from './app'
EOF

# Tauri types
cat > src/lib/types/tauri.ts << 'EOF'
export interface DiagramOptions {
  format: 'png' | 'svg' | 'pdf' | 'jpg'
  width?: number
  height?: number
  background: string
  theme?: string
}

export interface DiagramResult {
  success: boolean
  output_path?: string
  error_message?: string
  generation_time: number
  file_size?: number
}

export interface MermaidFile {
  path: string
  content: string
  name?: string
  last_modified?: string
  size?: number
}

export interface RecentFile {
  path: string
  name: string
  last_opened: string
}

export interface FileOperationResult {
  success: boolean
  message: string
  path?: string
}

// Tauri command wrapper types
export type TauriCommand<T = any> = (...args: any[]) => Promise<T>

export interface TauriCommands {
  generate_diagram: (code: string, options: DiagramOptions) => Promise<DiagramResult>
  read_mermaid_file: (path: string) => Promise<MermaidFile>
  write_mermaid_file: (path: string, content: string) => Promise<FileOperationResult>
  get_recent_files: () => Promise<RecentFile[]>
  check_mmdc: () => Promise<string>
  greet: (name: string) => Promise<string>
}
EOF

# App types
cat > src/lib/types/app.ts << 'EOF'
export interface AppState {
  isLoading: boolean
  mmdcStatus: 'checking' | 'available' | 'unavailable'
  currentTheme: 'dark' | 'light'
}

export interface EditorState {
  code: string
  hasUnsavedChanges: boolean
  currentFile: string | null
  previewSvg: string
  isGenerating: boolean
  lastError: string | null
}

export interface FileState {
  recentFiles: RecentFile[]
  currentDirectory: string | null
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: Array<{ label: string; action: () => void }>
}

export interface SettingsState {
  theme: 'dark' | 'light'
  autoSave: boolean
  autoSaveInterval: number
  defaultOutputFormat: DiagramOptions['format']
  fontSize: number
}
EOF

# 8. Create utility functions
echo "🔧 Creating utility functions..."

cat > src/lib/utils/constants.ts << 'EOF'
export const APP_NAME = 'Mermaid GUI v2.0'
export const APP_VERSION = '2.0.0'

export const DEFAULT_MERMAID_CODE = `graph TD
    A[Start] --> B(World)
    B --> C{Decision?}
    C -->|Yes| D[Result1]
    C -->|No| E[Result2]`

export const SUPPORTED_FORMATS = ['png', 'svg', 'pdf', 'jpg'] as const
export const DEFAULT_FORMAT = 'png'

export const KEYBOARD_SHORTCUTS = {
  NEW_FILE: 'Ctrl+N',
  OPEN_FILE: 'Ctrl+O',
  SAVE_FILE: 'Ctrl+S',
  GENERATE: 'Ctrl+E',
  FIND: 'Ctrl+F',
} as const

export const DEBOUNCE_DELAY = 500
export const AUTO_SAVE_INTERVAL = 30000 // 30 seconds
EOF

cat > src/lib/utils/debounce.ts << 'EOF'
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}
EOF

cat > src/lib/utils/formatting.ts << 'EOF'
export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return then.toLocaleDateString()
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
EOF

# 9. Create Svelte stores
echo "🗃️  Creating Svelte stores..."

cat > src/lib/stores/app.ts << 'EOF'
import { writable } from 'svelte/store'
import type { AppState } from '$lib/types'

function createAppStore() {
  const { subscribe, set, update } = writable<AppState>({
    isLoading: false,
    mmdcStatus: 'checking',
    currentTheme: 'dark'
  })

  return {
    subscribe,
    setLoading: (loading: boolean) => update(state => ({ ...state, isLoading: loading })),
    setMmdcStatus: (status: AppState['mmdcStatus']) => 
      update(state => ({ ...state, mmdcStatus: status })),
    setTheme: (theme: AppState['currentTheme']) => {
      update(state => ({ ...state, currentTheme: theme }))
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme)
    },
    reset: () => set({ isLoading: false, mmdcStatus: 'checking', currentTheme: 'dark' })
  }
}

export const appStore = createAppStore()
EOF

cat > src/lib/stores/editor.ts << 'EOF'
import { writable } from 'svelte/store'
import { debounce } from '$lib/utils/debounce'
import { DEFAULT_MERMAID_CODE, DEBOUNCE_DELAY } from '$lib/utils/constants'
import type { EditorState } from '$lib/types'

function createEditorStore() {
  const { subscribe, set, update } = writable<EditorState>({
    code: DEFAULT_MERMAID_CODE,
    hasUnsavedChanges: false,
    currentFile: null,
    previewSvg: '',
    isGenerating: false,
    lastError: null
  })

  // Debounced code change handler
  const debouncedCodeChange = debounce(() => {
    update(state => ({ ...state, hasUnsavedChanges: true }))
    // TODO: Trigger preview generation here
  }, DEBOUNCE_DELAY)

  return {
    subscribe,
    setCode: (code: string) => {
      update(state => ({ ...state, code }))
      debouncedCodeChange()
    },
    setFile: (filePath: string | null) => 
      update(state => ({ ...state, currentFile: filePath, hasUnsavedChanges: false })),
    setPreview: (svg: string) => 
      update(state => ({ ...state, previewSvg: svg, isGenerating: false })),
    setGenerating: (generating: boolean) => 
      update(state => ({ ...state, isGenerating: generating })),
    setError: (error: string | null) => 
      update(state => ({ ...state, lastError: error })),
    markSaved: () => 
      update(state => ({ ...state, hasUnsavedChanges: false })),
    reset: () => set({
      code: DEFAULT_MERMAID_CODE,
      hasUnsavedChanges: false,
      currentFile: null,
      previewSvg: '',
      isGenerating: false,
      lastError: null
    })
  }
}

export const editorStore = createEditorStore()
EOF

cat > src/lib/stores/files.ts << 'EOF'
import { writable } from 'svelte/store'
import type { FileState, RecentFile } from '$lib/types'

function createFileStore() {
  const { subscribe, set, update } = writable<FileState>({
    recentFiles: [],
    currentDirectory: null
  })

  return {
    subscribe,
    setRecentFiles: (files: RecentFile[]) => 
      update(state => ({ ...state, recentFiles: files })),
    addRecentFile: (file: RecentFile) => 
      update(state => ({
        ...state,
        recentFiles: [file, ...state.recentFiles.filter(f => f.path !== file.path)].slice(0, 10)
      })),
    setCurrentDirectory: (directory: string | null) =>
      update(state => ({ ...state, currentDirectory: directory })),
    clearRecentFiles: () =>
      update(state => ({ ...state, recentFiles: [] }))
  }
}

export const fileStore = createFileStore()
EOF

cat > src/lib/stores/notifications.ts << 'EOF'
import { writable } from 'svelte/store'
import type { Notification } from '$lib/types'

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([])

  return {
    subscribe,
    add: (notification: Omit<Notification, 'id'>) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const newNotification: Notification = { id, ...notification }
      
      update(notifications => [...notifications, newNotification])
      
      // Auto-remove after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          update(notifications => notifications.filter(n => n.id !== id))
        }, notification.duration || 5000)
      }
      
      return id
    },
    remove: (id: string) => 
      update(notifications => notifications.filter(n => n.id !== id)),
    clear: () => update(() => [])
  }
}

export const notificationStore = createNotificationStore()

// Helper functions
export const showSuccess = (message: string, title = 'Success') =>
  notificationStore.add({ type: 'success', title, message })

export const showError = (message: string, title = 'Error') =>
  notificationStore.add({ type: 'error', title, message, duration: 0 })

export const showWarning = (message: string, title = 'Warning') =>
  notificationStore.add({ type: 'warning', title, message })

export const showInfo = (message: string, title = 'Info') =>
  notificationStore.add({ type: 'info', title, message })
EOF

cat > src/lib/stores/settings.ts << 'EOF'
import { writable } from 'svelte/store'
import type { SettingsState } from '$lib/types'

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'dark',
  autoSave: true,
  autoSaveInterval: 30000,
  defaultOutputFormat: 'png',
  fontSize: 14
}

function createSettingsStore() {
  // Load from localStorage if available
  const stored = typeof window !== 'undefined' ? localStorage.getItem('mermaid-gui-settings') : null
  const initial = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS

  const { subscribe, set, update } = writable<SettingsState>(initial)

  return {
    subscribe,
    update: (updater: (settings: SettingsState) => SettingsState) => {
      update(settings => {
        const newSettings = updater(settings)
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('mermaid-gui-settings', JSON.stringify(newSettings))
        }
        return newSettings
      })
    },
    set: (settings: SettingsState) => {
      set(settings)
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mermaid-gui-settings', JSON.stringify(settings))
      }
    },
    reset: () => {
      set(DEFAULT_SETTINGS)
      if (typeof window !== 'undefined') {
        localStorage.setItem('mermaid-gui-settings', JSON.stringify(DEFAULT_SETTINGS))
      }
    }
  }
}

export const settingsStore = createSettingsStore()
EOF

# 10. Create service layer
echo "🔧 Creating service layer..."

cat > src/lib/services/tauri.ts << 'EOF'
import { invoke } from '@tauri-apps/api/core'
import type { TauriCommands, DiagramOptions, DiagramResult, MermaidFile, RecentFile, FileOperationResult } from '$lib/types'

class TauriService implements TauriCommands {
  async generate_diagram(code: string, options: DiagramOptions): Promise<DiagramResult> {
    try {
      return await invoke('generate_diagram', { code, options })
    } catch (error) {
      throw new Error(`Failed to generate diagram: ${error}`)
    }
  }

  async read_mermaid_file(path: string): Promise<MermaidFile> {
    try {
      return await invoke('read_mermaid_file', { path })
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`)
    }
  }

  async write_mermaid_file(path: string, content: string): Promise<FileOperationResult> {
    try {
      return await invoke('write_mermaid_file', { path, content })
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`)
    }
  }

  async get_recent_files(): Promise<RecentFile[]> {
    try {
      return await invoke('get_recent_files')
    } catch (error) {
      throw new Error(`Failed to get recent files: ${error}`)
    }
  }

  async check_mmdc(): Promise<string> {
    try {
      return await invoke('check_mmdc')
    } catch (error) {
      throw new Error(`Failed to check mmdc: ${error}`)
    }
  }

  async greet(name: string): Promise<string> {
    try {
      return await invoke('greet', { name })
    } catch (error) {
      throw new Error(`Failed to greet: ${error}`)
    }
  }
}

export const tauriService = new TauriService()
EOF

cat > src/lib/services/error-service.ts << 'EOF'
import { notificationStore } from '$lib/stores/notifications'

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ErrorService {
  static handle(error: unknown, context?: string) {
    console.error('Error in', context, error)
    
    if (error instanceof AppError) {
      notificationStore.add({
        type: 'error',
        title: 'Application Error',
        message: error.message,
        duration: 0
      })
    } else if (error instanceof Error) {
      notificationStore.add({
        type: 'error',
        title: 'Unexpected Error',
        message: error.message,
        duration: 0
      })
    } else {
      notificationStore.add({
        type: 'error',
        title: 'Unknown Error',
        message: 'An unexpected error occurred',
        duration: 0
      })
    }
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      this.handle(error, context)
      return null
    }
  }

  static wrapSync<T>(operation: () => T, context?: string): T | null {
    try {
      return operation()
    } catch (error) {
      this.handle(error, context)
      return null
    }
  }
}
EOF

cat > src/lib/services/file-service.ts << 'EOF'
import { open, save } from '@tauri-apps/plugin-dialog'
import { tauriService } from './tauri'
import { editorStore } from '$lib/stores/editor'
import { fileStore } from '$lib/stores/files'
import { showSuccess, showError } from '$lib/stores/notifications'
import { get } from 'svelte/store'
import type { MermaidFile } from '$lib/types'

export class FileService {
  async initialize() {
    // Load recent files on startup
    const recentFiles = await tauriService.get_recent_files()
    fileStore.setRecentFiles(recentFiles)
  }

  async newFile() {
    const { hasUnsavedChanges } = get(editorStore)
    
    if (hasUnsavedChanges) {
      const shouldContinue = confirm('You have unsaved changes. Continue without saving?')
      if (!shouldContinue) return
    }
    
    editorStore.reset()
    showSuccess('New file created')
  }

  async openFile() {
    const filePath = await open({
      filters: [
        {
          name: 'Mermaid Files',
          extensions: ['mmd', 'mermaid', 'md']
        },
        {
          name: 'All Files',
          extensions: ['*']
        }
      ],
      multiple: false
    })
    
    if (!filePath) return
    
    const fileData = await tauriService.read_mermaid_file(filePath as string)
    
    editorStore.setCode(fileData.content)
    editorStore.setFile(filePath as string)
    
    // Add to recent files
    fileStore.addRecentFile({
      path: filePath as string,
      name: this.getFileName(filePath as string),
      last_opened: new Date().toISOString()
    })
    
    showSuccess(`File opened: ${this.getFileName(filePath as string)}`)
  }

  async saveFile() {
    const { currentFile, code } = get(editorStore)
    
    if (currentFile) {
      // Save to existing file
      const result = await tauriService.write_mermaid_file(currentFile, code)
      
      if (result.success) {
        editorStore.markSaved()
        showSuccess(`File saved: ${this.getFileName(currentFile)}`)
      } else {
        showError(result.message || 'Failed to save file')
      }
    } else {
      // Save as new file
      await this.saveAsFile()
    }
  }

  async saveAsFile() {
    const { code } = get(editorStore)
    
    const filePath = await save({
      filters: [
        {
          name: 'Mermaid Files',
          extensions: ['mmd', 'mermaid']
        },
        {
          name: 'All Files',
          extensions: ['*']
        }
      ],
      defaultPath: 'diagram.mmd'
    })
    
    if (!filePath) return
    
    const result = await tauriService.write_mermaid_file(filePath, code)
    
    if (result.success) {
      editorStore.setFile(filePath)
      editorStore.markSaved()
      
      // Add to recent files
      fileStore.addRecentFile({
        path: filePath,
        name: this.getFileName(filePath),
        last_opened: new Date().toISOString()
      })
      
      showSuccess(`File saved: ${this.getFileName(filePath)}`)
    } else {
      showError(result.message || 'Failed to save file')
    }
  }

  async openRecentFile(filePath: string) {
    try {
      const fileData = await tauriService.read_mermaid_file(filePath)
      
      editorStore.setCode(fileData.content)
      editorStore.setFile(filePath)
      
      // Update recent files
      fileStore.addRecentFile({
        path: filePath,
        name: this.getFileName(filePath),
        last_opened: new Date().toISOString()
      })
      
      showSuccess(`File opened: ${this.getFileName(filePath)}`)
    } catch (error) {
      showError(`Failed to open recent file: ${error}`)
      // TODO: Remove from recent files if it doesn't exist
    }
  }

  private getFileName(path: string): string {
    return path.split('/').pop() || path.split('\\').pop() || path
  }
}

export const fileService = new FileService()
EOF

cat > src/lib/services/diagram-service.ts << 'EOF'
import { tauriService } from './tauri'
import { appStore } from '$lib/stores/app'
import { editorStore } from '$lib/stores/editor'
import { settingsStore } from '$lib/stores/settings'
import { showSuccess, showError } from '$lib/stores/notifications'
import { get } from 'svelte/store'

export class DiagramService {
  async checkMmdc() {
    try {
      appStore.setMmdcStatus('checking')
      const result = await tauriService.check_mmdc()
      
      if (result.includes('✅')) {
        appStore.setMmdcStatus('available')
      } else {
        appStore.setMmdcStatus('unavailable')
        showError('mmdc is not available. Please install Mermaid CLI.')
      }
    } catch (error) {
      appStore.setMmdcStatus('unavailable')
      showError(`Failed to check mmdc: ${error}`)
    }
  }

  async generateDiagram() {
    const { code } = get(editorStore)
    const { defaultOutputFormat } = get(settingsStore)
    
    if (!code.trim()) {
      showError('Please enter Mermaid code!')
      return
    }
    
    editorStore.setGenerating(true)
    
    try {
      const result = await tauriService.generate_diagram(code, {
        format: defaultOutputFormat,
        width: 800,
        height: 600,
        background: 'transparent'
      })
      
      if (result.success) {
        showSuccess(
          `Diagram generated successfully!\nTime: ${result.generation_time}ms\nPath: ${result.output_path}`,
          'Generation Complete'
        )
      } else {
        showError(result.error_message || 'Failed to generate diagram')
      }
    } catch (error) {
      showError(`Unexpected error: ${error}`)
    } finally {
      editorStore.setGenerating(false)
    }
  }

  async generatePreview(code: string) {
    // TODO: Implement preview generation
    // This will be used for live preview functionality
    try {
      const result = await tauriService.generate_diagram(code, {
        format: 'svg',
        width: 400,
        height: 300,
        background: 'transparent'
      })
      
      if (result.success && result.output_path) {
        // TODO: Read SVG content and set to preview
        editorStore.setPreview('<!-- SVG preview -->')
      }
    } catch (error) {
      console.error('Preview generation failed:', error)
    }
  }
}

export const diagramService = new DiagramService()
EOF

# 11. Create basic UI components
echo "🎨 Creating basic UI components..."

cat > src/lib/components/ui/Button.svelte << 'EOF'
<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary'
  export let size: 'sm' | 'md' | 'lg' = 'md'
  export let disabled = false
  export let loading = false
  export let type: 'button' | 'submit' | 'reset' = 'button'
  
  let className = ''
  export { className as class }
</script>

<button
  class="btn btn-{variant} btn-{size} {className}"
  class:loading
  {disabled}
  {type}
  on:click
>
  {#if loading}
    <span class="spinner" />
  {/if}
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: all 0.2s;
    border: 1px solid transparent;
    cursor: pointer;
  }
  
  .btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  .btn:disabled {
    pointer-events: none;
    opacity: 0.5;
  }
  
  .btn-primary {
    background: var(--primary);
    color: var(--primary-foreground);
  }
  
  .btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
  }
  
  .btn-secondary {
    background: var(--secondary);
    color: var(--secondary-foreground);
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: var(--secondary-hover);
  }
  
  .btn-danger {
    background: var(--destructive);
    color: var(--destructive-foreground);
  }
  
  .btn-danger:hover:not(:disabled) {
    background: var(--destructive-hover);
  }
  
  .btn-ghost {
    background: transparent;
    color: var(--foreground);
  }
  
  .btn-ghost:hover:not(:disabled) {
    background: var(--accent);
    color: var(--accent-foreground);
  }
  
  .btn-sm {
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;
  }
  
  .btn-md {
    height: 2.5rem;
    padding: 0 1rem;
  }
  
  .btn-lg {
    height: 3rem;
    padding: 0 1.5rem;
    font-size: 1.125rem;
  }
  
  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
EOF

cat > src/lib/components/ui/Input.svelte << 'EOF'
<script lang="ts">
  export let value = ''
  export let placeholder = ''
  export let type = 'text'
  export let disabled = false
  export let readonly = false
  export let required = false
  
  let className = ''
  export { className as class }
</script>

<input
  class="input {className}"
  bind:value
  {placeholder}
  {type}
  {disabled}
  {readonly}
  {required}
  on:input
  on:change
  on:focus
  on:blur
  on:keydown
/>

<style>
  .input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    color: var(--foreground);
    font-size: 0.875rem;
    transition: border-color 0.2s;
  }
  
  .input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-alpha);
  }
  
  .input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .input::placeholder {
    color: var(--muted-foreground);
  }
</style>
EOF

cat > src/lib/components/ui/Dialog.svelte << 'EOF'
<script lang="ts">
  export let open = false
  export let title = ''
  export let description = ''
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      open = false
    }
  }
  
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      open = false
    }
  }
</script>

{#if open}
  <div 
    class="dialog-overlay" 
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <div class="dialog-content">
      {#if title}
        <div class="dialog-header">
          <h2 id="dialog-title" class="dialog-title">{title}</h2>
          {#if description}
            <p id="dialog-description" class="dialog-description">{description}</p>
          {/if}
        </div>
      {/if}
      
      <div class="dialog-body">
        <slot />
      </div>
      
      <div class="dialog-footer">
        <slot name="actions" />
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
  }
  
  .dialog-content {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    max-width: 32rem;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
  }
  
  .dialog-header {
    padding: 1.5rem 1.5rem 0;
  }
  
  .dialog-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--foreground);
  }
  
  .dialog-description {
    margin: 0.5rem 0 0;
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }
  
  .dialog-body {
    padding: 1.5rem;
  }
  
  .dialog-footer {
    padding: 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
</style>
EOF

cat > src/lib/components/ui/ToastContainer.svelte << 'EOF'
<script lang="ts">
  import { notificationStore } from '$lib/stores/notifications'
  import { fly } from 'svelte/transition'
  
  function getIcon(type: string) {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📝'
    }
  }
</script>

<div class="toast-container">
  {#each $notificationStore as notification (notification.id)}
    <div 
      class="toast toast-{notification.type}"
      transition:fly="{{ y: -50, duration: 300 }}"
    >
      <div class="toast-header">
        <span class="toast-icon">{getIcon(notification.type)}</span>
        <h4 class="toast-title">{notification.title}</h4>
        <button 
          class="toast-close"
          on:click={() => notificationStore.remove(notification.id)}
          aria-label="Close notification"
        >×</button>
      </div>
      
      <div class="toast-content">
        <p class="toast-message">{notification.message}</p>
        
        {#if notification.actions && notification.actions.length > 0}
          <div class="toast-actions">
            {#each notification.actions as action}
              <button class="toast-action" on:click={action.action}>
                {action.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 24rem;
  }
  
  .toast {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .toast-success {
    border-left: 4px solid var(--success);
  }
  
  .toast-error {
    border-left: 4px solid var(--destructive);
  }
  
  .toast-warning {
    border-left: 4px solid var(--warning);
  }
  
  .toast-info {
    border-left: 4px solid var(--primary);
  }
  
  .toast-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem 0.5rem;
  }
  
  .toast-icon {
    flex-shrink: 0;
  }
  
  .toast-title {
    flex: 1;
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--foreground);
  }
  
  .toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: var(--muted-foreground);
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .toast-close:hover {
    color: var(--foreground);
  }
  
  .toast-content {
    padding: 0 1rem 0.75rem;
  }
  
  .toast-message {
    margin: 0;
    font-size: 0.875rem;
    color: var(--muted-foreground);
    white-space: pre-line;
  }
  
  .toast-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  
  .toast-action {
    padding: 0.25rem 0.75rem;
    background: var(--primary);
    color: var(--primary-foreground);
    border: none;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .toast-action:hover {
    background: var(--primary-hover);
  }
</style>
EOF

cat > src/lib/components/ui/index.ts << 'EOF'
export { default as Button } from './Button.svelte'
export { default as Input } from './Input.svelte'
export { default as Dialog } from './Dialog.svelte'
export { default as ToastContainer } from './ToastContainer.svelte'
EOF

# 12. Create layout components
echo "🏗️  Creating layout components..."

cat > src/lib/components/layout/Header.svelte << 'EOF'
<script lang="ts">
  import { appStore } from '$lib/stores/app'
  import { editorStore } from '$lib/stores/editor'
  import { APP_NAME } from '$lib/utils/constants'
  
  $: ({ currentTheme } = $appStore)
  $: ({ currentFile, hasUnsavedChanges } = $editorStore)
  
  function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    appStore.setTheme(newTheme)
  }
  
  function getFileName(path: string | null): string {
    if (!path) return 'Untitled'
    return path.split('/').pop() || path.split('\\').pop() || path
  }
</script>

<header class="header">
  <div class="header-left">
    <h1 class="app-title">{APP_NAME}</h1>
  </div>
  
  <div class="header-center">
    <div class="file-info">
      <span class="file-name">
        📄 {getFileName(currentFile)}
        {#if hasUnsavedChanges}
          <span class="unsaved-indicator">*</span>
        {/if}
      </span>
      {#if currentFile}
        <span class="file-path" title={currentFile}>{currentFile}</span>
      {/if}
    </div>
  </div>
  
  <div class="header-right">
    <button class="theme-toggle" on:click={toggleTheme} title="Toggle theme">
      {currentTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--background);
    border-bottom: 1px solid var(--border);
    min-height: 3rem;
  }
  
  .header-left,
  .header-right {
    flex: 0 0 auto;
    min-width: 200px;
  }
  
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  
  .app-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--foreground);
  }
  
  .file-info {
    text-align: center;
  }
  
  .file-name {
    display: block;
    font-weight: 500;
    color: var(--foreground);
  }
  
  .unsaved-indicator {
    color: var(--warning);
    font-weight: bold;
  }
  
  .file-path {
    display: block;
    font-size: 0.75rem;
    color: var(--muted-foreground);
    font-family: monospace;
    margin-top: 0.25rem;
  }
  
  .header-right {
    display: flex;
    justify-content: flex-end;
  }
  
  .theme-toggle {
    background: none;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
  }
  
  .theme-toggle:hover {
    background: var(--accent);
  }
</style>
EOF

cat > src/lib/components/layout/SplitPane.svelte << 'EOF'
<script lang="ts">
  export let split: 'horizontal' | 'vertical' = 'vertical'
  export let minSize = 200
  export let defaultSize = 50 // percentage
  
  let container: HTMLDivElement
  let isDragging = false
  let currentSize = defaultSize
  
  function startDrag(event: MouseEvent) {
    isDragging = true
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', stopDrag)
    event.preventDefault()
  }
  
  function handleDrag(event: MouseEvent) {
    if (!isDragging || !container) return
    
    const rect = container.getBoundingClientRect()
    let percentage: number
    
    if (split === 'vertical') {
      const x = event.clientX - rect.left
      percentage = (x / rect.width) * 100
    } else {
      const y = event.clientY - rect.top
      percentage = (y / rect.height) * 100
    }
    
    // Apply min/max constraints
    const minPercentage = (minSize / (split === 'vertical' ? rect.width : rect.height)) * 100
    const maxPercentage = 100 - minPercentage
    
    currentSize = Math.max(minPercentage, Math.min(maxPercentage, percentage))
  }
  
  function stopDrag() {
    isDragging = false
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', stopDrag)
  }
</script>

<div 
  class="split-pane split-{split}"
  class:dragging={isDragging}
  bind:this={container}
>
  <div 
    class="split-pane-left"
    style="{split === 'vertical' ? 'width' : 'height'}: {currentSize}%"
  >
    <slot name="left" />
  </div>
  
  <div 
    class="split-pane-divider"
    on:mousedown={startDrag}
    role="separator"
    tabindex="0"
  />
  
  <div 
    class="split-pane-right"
    style="{split === 'vertical' ? 'width' : 'height'}: {100 - currentSize}%"
  >
    <slot name="right" />
  </div>
</div>

<style>
  .split-pane {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  
  .split-vertical {
    flex-direction: row;
  }
  
  .split-horizontal {
    flex-direction: column;
  }
  
  .split-pane-left,
  .split-pane-right {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .split-pane-divider {
    background: var(--border);
    flex-shrink: 0;
    transition: background 0.2s;
  }
  
  .split-vertical .split-pane-divider {
    width: 1px;
    cursor: ew-resize;
  }
  
  .split-horizontal .split-pane-divider {
    height: 1px;
    cursor: ns-resize;
  }
  
  .split-pane-divider:hover,
  .dragging .split-pane-divider {
    background: var(--primary);
  }
  
  .dragging {
    user-select: none;
  }
  
  .dragging * {
    cursor: inherit !important;
  }
</style>
EOF

# 13. Create editor components
echo "✏️  Creating editor components..."

cat > src/lib/components/editor/Toolbar.svelte << 'EOF'
<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte'
  import { editorStore } from '$lib/stores/editor'
  import { appStore } from '$lib/stores/app'
  
  export let onNew: () => void
  export let onOpen: () => void
  export let onSave: () => void
  export let onGenerate: () => void
  
  $: ({ hasUnsavedChanges, isGenerating } = $editorStore)
  $: ({ mmdcStatus } = $appStore)
</script>

<div class="toolbar">
  <div class="toolbar-group">
    <Button variant="ghost" size="sm" on:click={onNew} title="New file (Ctrl+N)">
      📄 New
    </Button>
    <Button variant="ghost" size="sm" on:click={onOpen} title="Open file (Ctrl+O)">
      📂 Open
    </Button>
    <Button 
      variant="ghost" 
      size="sm" 
      class={hasUnsavedChanges ? 'unsaved' : ''}
      on:click={onSave}
      title="Save file (Ctrl+S)"
    >
      💾 Save
    </Button>
  </div>
  
  <div class="toolbar-group">
    <div class="mmdc-status status-{mmdcStatus}">
      <span class="status-indicator"></span>
      mmdc: {mmdcStatus}
    </div>
  </div>
  
  <div class="toolbar-group">
    <Button 
      variant="primary" 
      size="sm"
      disabled={mmdcStatus !== 'available' || isGenerating}
      loading={isGenerating}
      on:click={onGenerate}
      title="Generate diagram (Ctrl+E)"
    >
      🚀 Generate
    </Button>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--secondary);
    border-bottom: 1px solid var(--border);
    gap: 1rem;
  }
  
  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  :global(.toolbar .unsaved) {
    background: var(--warning) !important;
    color: var(--warning-foreground) !important;
  }
  
  .mmdc-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-family: monospace;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    background: var(--background);
  }
  
  .status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .status-checking .status-indicator {
    background: var(--warning);
    animation: pulse 2s infinite;
  }
  
  .status-available .status-indicator {
    background: var(--success);
  }
  
  .status-unavailable .status-indicator {
    background: var(--destructive);
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
EOF

cat > src/lib/components/editor/CodeEditor.svelte << 'EOF'
<script lang="ts">
  import { editorStore } from '$lib/stores/editor'
  import { onMount } from 'svelte'
  
  let textareaElement: HTMLTextAreaElement
  
  $: ({ code } = $editorStore)
  
  onMount(() => {
    // Focus the editor on mount
    textareaElement?.focus()
  })
  
  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement
    editorStore.setCode(target.value)
  }
  
  function handleKeydown(event: KeyboardEvent) {
    // Handle Tab key for indentation
    if (event.key === 'Tab') {
      event.preventDefault()
      const start = textareaElement.selectionStart
      const end = textareaElement.selectionEnd
      const value = textareaElement.value
      
      // Insert spaces instead of tab
      const newValue = value.substring(0, start) + '    ' + value.substring(end)
      textareaElement.value = newValue
      textareaElement.selectionStart = textareaElement.selectionEnd = start + 4
      
      // Update store
      editorStore.setCode(newValue)
    }
  }
</script>

<div class="editor-panel">
  <div class="editor-header">
    <h3>📝 Mermaid Code</h3>
  </div>
  
  <div class="editor-content">
    <textarea
      bind:this={textareaElement}
      value={code}
      on:input={handleInput}
      on:keydown={handleKeydown}
      placeholder="Enter your Mermaid code here..."
      spellcheck="false"
      class="code-editor"
    ></textarea>
  </div>
</div>

<style>
  .editor-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--background);
  }
  
  .editor-header {
    padding: 0.75rem 1rem;
    background: var(--secondary);
    border-bottom: 1px solid var(--border);
  }
  
  .editor-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--foreground);
  }
  
  .editor-content {
    flex: 1;
    position: relative;
  }
  
  .code-editor {
    width: 100%;
    height: 100%;
    padding: 1rem;
    border: none;
    background: var(--background);
    color: var(--foreground);
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    outline: none;
    tab-size: 4;
  }
  
  .code-editor::placeholder {
    color: var(--muted-foreground);
  }
  
  .code-editor:focus {
    background: var(--background);
  }
</style>
EOF

cat > src/lib/components/editor/Preview.svelte << 'EOF'
<script lang="ts">
  import { editorStore } from '$lib/stores/editor'
  
  $: ({ previewSvg, isGenerating, lastError } = $editorStore)
</script>

<div class="preview-panel">
  <div class="preview-header">
    <h3>👁️ Preview</h3>
    <div class="preview-controls">
      <!-- TODO: Add zoom controls -->
      <button class="control-btn" title="Zoom in">🔍+</button>
      <button class="control-btn" title="Zoom out">🔍-</button>
      <button class="control-btn" title="Reset zoom">↺</button>
    </div>
  </div>
  
  <div class="preview-content">
    {#if isGenerating}
      <div class="preview-loading">
        <div class="spinner"></div>
        <p>Generating preview...</p>
      </div>
    {:else if lastError}
      <div class="preview-error">
        <h4>❌ Preview Error</h4>
        <p>{lastError}</p>
      </div>
    {:else if previewSvg}
      <div class="preview-svg">
        {@html previewSvg}
      </div>
    {:else}
      <div class="preview-empty">
        <p>Enter Mermaid code to see preview</p>
        <p class="hint">Live preview will appear here</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .preview-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--background);
  }
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--secondary);
    border-bottom: 1px solid var(--border);
  }
  
  .preview-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--foreground);
  }
  
  .preview-controls {
    display: flex;
    gap: 0.25rem;
  }
  
  .control-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.75rem;
  }
  
  .control-btn:hover {
    background: var(--accent);
  }
  
  .preview-content {
    flex: 1;
    overflow: auto;
    padding: 1rem;
  }
  
  .preview-loading,
  .preview-error,
  .preview-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: var(--muted-foreground);
  }
  
  .preview-loading .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  .preview-error {
    color: var(--destructive);
  }
  
  .preview-error h4 {
    margin: 0 0 0.5rem;
  }
  
  .preview-error p {
    margin: 0;
    font-family: monospace;
    font-size: 0.875rem;
  }
  
  .preview-empty .hint {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
  
  .preview-svg {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
  }
  
  .preview-svg :global(svg) {
    max-width: 100%;
    height: auto;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
EOF

cat > src/lib/components/editor/StatusBar.svelte << 'EOF'
<script lang="ts">
  import { editorStore } from '$lib/stores/editor'
  import { appStore } from '$lib/stores/app'
  import { formatTimeAgo } from '$lib/utils/formatting'
  
  $: ({ code, currentFile } = $editorStore)
  $: ({ mmdcStatus } = $appStore)
  
  // Calculate document stats
  $: lines = code.split('\n').length
  $: characters = code.length
  $: words = code.trim().split(/\s+/).filter(word => word.length > 0).length
</script>

<div class="status-bar">
  <div class="status-section">
    <span class="status-item">
      <span class="status-indicator status-{mmdcStatus}"></span>
      mmdc: {mmdcStatus}
    </span>
  </div>
  
  <div class="status-section">
    <span class="status-item">📊 Ln {lines}, Ch {characters}</span>
    <span class="status-item">📝 {words} words</span>
  </div>
  
  <div class="status-section">
    </div>
</div>

<style>
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 0.875rem;
    border-top: 1px solid var(--border);
  }
  
  .status-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
  }
  
  .status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .status-checking {
    background: var(--warning);
    animation: pulse 2s infinite;
  }
  
  .status-available {
    background: var(--success);
  }
  
  .status-unavailable {
    background: var(--destructive);
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
EOF

# 14. Create CSS variables and themes
echo "🎨 Creating CSS theme system..."

cat > src/lib/styles/variables.css << 'EOF'
:root {
  /* Base colors */
  --background: #ffffff;
  --foreground: #0f0f23;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --border: #e2e8f0;
  --input: #ffffff;
  --card: #ffffff;
  --card-foreground: #0f0f23;
  --popover: #ffffff;
  --popover-foreground: #0f0f23;
  
  /* Primary colors */
  --primary: #0078d4;
  --primary-foreground: #ffffff;
  --primary-hover: #106ebe;
  --primary-alpha: rgba(0, 120, 212, 0.1);
  
  /* Secondary colors */
  --secondary: #f1f5f9;
  --secondary-foreground: #475569;
  --secondary-hover: #e2e8f0;
  
  /* Accent colors */
  --accent: #f1f5f9;
  --accent-foreground: #475569;
  
  /* Status colors */
  --success: #22c55e;
  --success-foreground: #ffffff;
  --warning: #f59e0b;
  --warning-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --destructive-hover: #dc2626;
  
  /* Radius */
  --radius: 0.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] {
  --background: #0f0f23;
  --foreground: #ffffff;
  --muted: #1e1e3f;
  --muted-foreground: #a1a1aa;
  --border: #3e3e42;
  --input: #1e1e3f;
  --card: #1e1e3f;
  --card-foreground: #ffffff;
  --popover: #1e1e3f;
  --popover-foreground: #ffffff;
  
  --primary: #0078d4;
  --primary-foreground: #ffffff;
  --primary-hover: #1177bb;
  --primary-alpha: rgba(0, 120, 212, 0.2);
  
  --secondary: #1e1e3f;
  --secondary-foreground: #a1a1aa;
  --secondary-hover: #2d2d50;
  
  --accent: #2d2d50;
  --accent-foreground: #ffffff;
  
  --success: #22c55e;
  --success-foreground: #000000;
  --warning: #f59e0b;
  --warning-foreground: #000000;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --destructive-hover: #f87171;
}
EOF

cat > src/lib/styles/components.css << 'EOF'
/* Reset and base styles */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--background);
  color: var(--foreground);
  line-height: 1.5;
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--muted);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--muted-foreground);
}

/* Focus styles */
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Selection styles */
::selection {
  background: var(--primary-alpha);
  color: var(--foreground);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: 600;
  line-height: 1.25;
}

p {
  margin: 0;
}

/* Code elements */
code, pre {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  background: var(--muted);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

pre {
  padding: 1rem;
  overflow: auto;
  border: 1px solid var(--border);
}

/* Buttons */
button {
  font-family: inherit;
}

/* Form elements */
input, textarea, select {
  font-family: inherit;
}

/* Utility classes */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Animation classes */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
EOF

# 15. Update main layout and page
echo "🖼️  Creating main layout and page..."

cat > src/routes/+layout.svelte << 'EOF'
<script>
  import '../lib/styles/variables.css'
  import '../lib/styles/components.css'
  import { onMount } from 'svelte'
  import { appStore } from '$lib/stores/app'
  
  onMount(() => {
    // Apply initial theme
    const { currentTheme } = $appStore
    document.documentElement.setAttribute('data-theme', currentTheme)
  })
</script>

<slot />
EOF

cat > src/routes/+page.svelte << 'EOF'
<script lang="ts">
  import { onMount } from 'svelte'
  
  // Components
  import Header from '$lib/components/layout/Header.svelte'
  import Toolbar from '$lib/components/editor/Toolbar.svelte'
  import CodeEditor from '$lib/components/editor/CodeEditor.svelte'
  import Preview from '$lib/components/editor/Preview.svelte'
  import StatusBar from '$lib/components/editor/StatusBar.svelte'
  import SplitPane from '$lib/components/layout/SplitPane.svelte'
  import ToastContainer from '$lib/components/ui/ToastContainer.svelte'
  
  // Services
  import { fileService } from '$lib/services/file-service'
  import { diagramService } from '$lib/services/diagram-service'
  import { ErrorService } from '$lib/services/error-service'
  
  onMount(async () => {
    // Initialize services
    await ErrorService.withErrorHandling(
      () => fileService.initialize(),
      'File service initialization'
    )
    
    await ErrorService.withErrorHandling(
      () => diagramService.checkMmdc(),
      'MMDC check'
    )
  })

  // Event handlers
  async function handleNew() {
    await ErrorService.withErrorHandling(
      () => fileService.newFile(),
      'Creating new file'
    )
  }

  async function handleOpen() {
    await ErrorService.withErrorHandling(
      () => fileService.openFile(),
      'Opening file'
    )
  }

  async function handleSave() {
    await ErrorService.withErrorHandling(
      () => fileService.saveFile(),
      'Saving file'
    )
  }

  async function handleGenerate() {
    await ErrorService.withErrorHandling(
      () => diagramService.generateDiagram(),
      'Generating diagram'
    )
  }
  
  // Keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'n':
          event.preventDefault()
          handleNew()
          break
        case 'o':
          event.preventDefault()
          handleOpen()
          break
        case 's':
          event.preventDefault()
          handleSave()
          break
        case 'e':
          event.preventDefault()
          handleGenerate()
          break
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app">
  <Header />
  
  <Toolbar 
    {onNew: handleNew}
    {onOpen: handleOpen}
    {onSave: handleSave}
    {onGenerate: handleGenerate}
  />
  
  <main class="main-content">
    <SplitPane>
      <CodeEditor slot="left" />
      <Preview slot="right" />
    </SplitPane>
  </main>
  
  <StatusBar />
  <ToastContainer />
</div>

<style>
  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--background);
    color: var(--foreground);
  }
  
  .main-content {
    flex: 1;
    min-height: 0;
  }
</style>
EOF

# 16. Update package.json scripts
echo "📦 Updating package.json scripts..."

# Create a temporary script to update package.json
cat > update_package.js << 'EOF'
const fs = require('fs');
const path = require('path');

const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Add new scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "type-check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
  "type-check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
};

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('✅ Package.json updated with new scripts');
EOF

node update_package.js
rm update_package.js

# 17. Create .gitignore additions
echo "📝 Updating .gitignore..."

cat >> .gitignore << 'EOF'

# TypeScript
*.tsbuildinfo

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime
pids
*.pid
*.seed
*.pid.lock

# Temporary
*.tmp
*.temp
EOF

# 18. Create development helper script
cat > dev-setup.sh << 'EOF'
#!/bin/bash

echo "🔧 Development Setup Helper"
echo "=========================="

echo "📦 Installing additional dev dependencies..."
npm install -D eslint-config-prettier svelte-eslint-parser

echo "🔍 Running type check..."
npm run type-check

echo "🎨 Running formatter..."
npm run format

echo "✅ Development setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run type-check   - Check TypeScript types"
echo "  npm run lint         - Lint code"
echo "  npm run format       - Format code"
echo "  npm run tauri dev    - Start Tauri development"
EOF

chmod +x dev-setup.sh

# 19. Final message
echo ""
echo "🎉 Refactoring setup complete!"
echo "================================"
echo ""
echo "📁 Project structure created:"
echo "   ✅ TypeScript configuration"
echo "   ✅ Component architecture"
echo "   ✅ State management stores"
echo "   ✅ Service layer"
echo "   ✅ Type definitions"
echo "   ✅ CSS theme system"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: ./dev-setup.sh"
echo "   2. Run: npm run tauri dev"
echo "   3. Test the refactored application"
echo ""
echo "📚 What changed:"
echo "   • Modular component structure"
echo "   • TypeScript for type safety"
echo "   • Centralized state management"
echo "   • Professional error handling"
echo "   • Consistent styling system"
echo "   • Better separation of concerns"
echo ""
echo "⚠️  Note: You may need to update import paths in existing files"
echo "   The old +page.svelte will need to be replaced with the new structure"