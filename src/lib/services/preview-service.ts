import { debounce } from '$lib/utils/debounce'
import { tauriService } from './tauri'
import { editorStore } from '$lib/stores/editor'
import { get } from 'svelte/store'

export class PreviewService {
  private previewCache = new Map<string, string>()
  
  constructor() {
    // Monaco'dan kod değişikliklerini dinle
    editorStore.subscribe(({ code }) => {
      this.debouncedPreview(code)
    })
  }
  
  private debouncedPreview = debounce(async (code: string) => {
    await this.generatePreview(code)
  }, 500)
  
  async generatePreview(code: string): Promise<void> {
    if (!code.trim()) {
      editorStore.setPreview('')
      editorStore.setError(null)
      return
    }
    
    // Cache check
    const cacheKey = this.getCacheKey(code)
    if (this.previewCache.has(cacheKey)) {
      editorStore.setPreview(this.previewCache.get(cacheKey)!)
      return
    }
    
    editorStore.setGenerating(true)
    editorStore.setError(null)
    
    try {
        const svgContent = await tauriService.generate_preview_svg(code)
        this.previewCache.set(cacheKey, svgContent)
        editorStore.setPreview(svgContent)
    } catch (error) {
        editorStore.setError(`Preview error: ${error}`)
    } finally {
        editorStore.setGenerating(false)
    }
  }
  
  private async readSvgFile(path: string): Promise<string> {
    return await tauriService.generate_preview_svg(get(editorStore).code)
  }
  
  private getCacheKey(code: string): string {
    // Simple hash for caching
    let hash = 0
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }
  
  clearCache(): void {
    this.previewCache.clear()
  }
}

export const previewService = new PreviewService()