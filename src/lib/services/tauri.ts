import { invoke } from '@tauri-apps/api/core';
import type {
  TauriCommands,
  DiagramOptions,
  DiagramResult,
  MermaidFile,
  RecentFile,
  FileOperationResult,
} from '$lib/types';

class TauriService implements TauriCommands {
  async generate_preview_svg(code: string): Promise<string> {
    try {
      return await invoke('generate_preview_svg', { code })
    } catch (error) {
      throw new Error(`Failed to generate preview: ${error}`)
    }
  }
  
  async generate_diagram(code: string, options: DiagramOptions): Promise<DiagramResult> {
    try {
      return await invoke('generate_diagram', { code, options });
    } catch (error) {
      throw new Error(`Failed to generate diagram: ${error}`);
    }
  }

  async read_mermaid_file(path: string): Promise<MermaidFile> {
    try {
      return await invoke('read_mermaid_file', { path });
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  async write_mermaid_file(path: string, content: string): Promise<FileOperationResult> {
    try {
      return await invoke('write_mermaid_file', { path, content });
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  async get_recent_files(): Promise<RecentFile[]> {
    try {
      return await invoke('get_recent_files');
    } catch (error) {
      throw new Error(`Failed to get recent files: ${error}`);
    }
  }

  async check_mmdc(): Promise<string> {
    try {
      return await invoke('check_mmdc');
    } catch (error) {
      throw new Error(`Failed to check mmdc: ${error}`);
    }
  }

  async greet(name: string): Promise<string> {
    try {
      return await invoke('greet', { name });
    } catch (error) {
      throw new Error(`Failed to greet: ${error}`);
    }
  }
}

export const tauriService = new TauriService();
