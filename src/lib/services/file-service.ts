import { open, save } from '@tauri-apps/plugin-dialog';
import { tauriService } from './tauri';
import { editorStore } from '$lib/stores/editor';
import { fileStore } from '$lib/stores/files';
import { showSuccess, showError } from '$lib/stores/notifications';
import { get } from 'svelte/store';
import type { MermaidFile } from '$lib/types';

export class FileService {
  async initialize() {
    // Load recent files on startup
    const recentFiles = await tauriService.get_recent_files();
    fileStore.setRecentFiles(recentFiles);
  }

  async newFile() {
    const { hasUnsavedChanges } = get(editorStore);

    if (hasUnsavedChanges) {
      const shouldContinue = confirm('You have unsaved changes. Continue without saving?');
      if (!shouldContinue) return;
    }

    editorStore.reset();
    showSuccess('New file created');
  }

  async openFile() {
    const filePath = await open({
      filters: [
        {
          name: 'Mermaid Files',
          extensions: ['mmd', 'mermaid', 'md'],
        },
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
      multiple: false,
    });

    if (!filePath) return;

    const fileData = await tauriService.read_mermaid_file(filePath as string);

    editorStore.setCode(fileData.content);
    editorStore.setFile(filePath as string);

    // Add to recent files
    fileStore.addRecentFile({
      path: filePath as string,
      name: this.getFileName(filePath as string),
      last_opened: new Date().toISOString(),
    });

    showSuccess(`File opened: ${this.getFileName(filePath as string)}`);
  }

  async saveFile() {
    const { currentFile, code } = get(editorStore);

    if (currentFile) {
      // Save to existing file
      const result = await tauriService.write_mermaid_file(currentFile, code);

      if (result.success) {
        editorStore.markSaved();
        showSuccess(`File saved: ${this.getFileName(currentFile)}`);
      } else {
        showError(result.message || 'Failed to save file');
      }
    } else {
      // Save as new file
      await this.saveAsFile();
    }
  }

  async saveAsFile() {
    const { code } = get(editorStore);

    const filePath = await save({
      filters: [
        {
          name: 'Mermaid Files',
          extensions: ['mmd', 'mermaid'],
        },
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
      defaultPath: 'diagram.mmd',
    });

    if (!filePath) return;

    const result = await tauriService.write_mermaid_file(filePath, code);

    if (result.success) {
      editorStore.setFile(filePath);
      editorStore.markSaved();

      // Add to recent files
      fileStore.addRecentFile({
        path: filePath,
        name: this.getFileName(filePath),
        last_opened: new Date().toISOString(),
      });

      showSuccess(`File saved: ${this.getFileName(filePath)}`);
    } else {
      showError(result.message || 'Failed to save file');
    }
  }

  async openRecentFile(filePath: string) {
    try {
      const fileData = await tauriService.read_mermaid_file(filePath);

      editorStore.setCode(fileData.content);
      editorStore.setFile(filePath);

      // Update recent files
      fileStore.addRecentFile({
        path: filePath,
        name: this.getFileName(filePath),
        last_opened: new Date().toISOString(),
      });

      showSuccess(`File opened: ${this.getFileName(filePath)}`);
    } catch (error) {
      showError(`Failed to open recent file: ${error}`);
      // TODO: Remove from recent files if it doesn't exist
    }
  }

  private getFileName(path: string): string {
    return path.split('/').pop() || path.split('\\').pop() || path;
  }
}

export const fileService = new FileService();
