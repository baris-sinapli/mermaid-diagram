export interface DiagramOptions {
  format: 'png' | 'svg' | 'pdf' | 'jpg';
  width?: number;
  height?: number;
  background: string;
  theme?: string;
}

export interface DiagramResult {
  success: boolean;
  output_path?: string;
  error_message?: string;
  generation_time: number;
  file_size?: number;
}

export interface MermaidFile {
  path: string;
  content: string;
  name?: string;
  last_modified?: string;
  size?: number;
}

export interface RecentFile {
  path: string;
  name: string;
  last_opened: string;
}

export interface FileOperationResult {
  success: boolean;
  message: string;
  path?: string;
}

// Tauri command wrapper types
export type TauriCommand<T = any> = (...args: any[]) => Promise<T>;

export interface TauriCommands {
  generate_diagram: (code: string, options: DiagramOptions) => Promise<DiagramResult>;
  read_mermaid_file: (path: string) => Promise<MermaidFile>;
  write_mermaid_file: (path: string, content: string) => Promise<FileOperationResult>;
  get_recent_files: () => Promise<RecentFile[]>;
  check_mmdc: () => Promise<string>;
  greet: (name: string) => Promise<string>;
}
