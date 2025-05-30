import { tauriService } from './tauri';
import { appStore } from '$lib/stores/app';
import { editorStore } from '$lib/stores/editor';
import { settingsStore } from '$lib/stores/settings';
import { showSuccess, showError } from '$lib/stores/notifications';
import { get } from 'svelte/store';

export class DiagramService {
  async checkMmdc() {
    try {
      appStore.setMmdcStatus('checking');
      const result = await tauriService.check_mmdc();

      if (result.includes('✅')) {
        appStore.setMmdcStatus('available');
      } else {
        appStore.setMmdcStatus('unavailable');
        showError('mmdc is not available. Please install Mermaid CLI.');
      }
    } catch (error) {
      appStore.setMmdcStatus('unavailable');
      showError(`Failed to check mmdc: ${error}`);
    }
  }

  async generateDiagram() {
    const { code } = get(editorStore);
    const { defaultOutputFormat } = get(settingsStore);

    if (!code.trim()) {
      showError('Please enter Mermaid code!');
      return;
    }

    editorStore.setGenerating(true);

    try {
      const result = await tauriService.generate_diagram(code, {
        format: defaultOutputFormat,
        width: 800,
        height: 600,
        background: 'transparent',
      });

      if (result.success) {
        showSuccess(
          `Diagram generated successfully!\nTime: ${result.generation_time}ms\nPath: ${result.output_path}`,
          'Generation Complete'
        );
      } else {
        showError(result.error_message || 'Failed to generate diagram');
      }
    } catch (error) {
      showError(`Unexpected error: ${error}`);
    } finally {
      editorStore.setGenerating(false);
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
        background: 'transparent',
      });

      if (result.success && result.output_path) {
        // TODO: Read SVG content and set to preview
        editorStore.setPreview('<!-- SVG preview -->');
      }
    } catch (error) {
      console.error('Preview generation failed:', error);
    }
  }
}

export const diagramService = new DiagramService();
