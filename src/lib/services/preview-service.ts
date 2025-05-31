import { debounce } from '$lib/utils/debounce'
import { tauriService } from './tauri'
import { editorStore } from '$lib/stores/editor'
import { appStore } from '$lib/stores/app'
import { get } from 'svelte/store'

export class PreviewService {
  private previewCache = new Map<string, string>()
  private currentRequest: AbortController | null = null
  private isGenerating = false
  
  constructor() {
    editorStore.subscribe(({ code }) => {
      this.debouncedPreview(code)
    })
  }
  
  private debouncedPreview = debounce(async (code: string) => {
    await this.generatePreview(code)
  }, 1000) // 1 saniyelik debounce süresi
  
  async generatePreview(code: string): Promise<void> {
    if (!this.isValidForPreview(code)) {
      return
    }
    
    if (this.currentRequest) {
      this.currentRequest.abort()
    }
    this.currentRequest = new AbortController()
    
    if (this.isGenerating) {
      return
    }
    
    if (!code.trim()) {
      editorStore.setPreview('')
      editorStore.setError(null)
      return
    }
    
    const cacheKey = this.getCacheKey(code)
    if (this.previewCache.has(cacheKey)) {
      editorStore.setPreview(this.previewCache.get(cacheKey)!)
      editorStore.setError(null)
      return
    }
    
    this.isGenerating = true
    editorStore.setGenerating(true)
    editorStore.setError(null)
    
    try {
      const { currentTheme } = get(appStore) 
      const svgContent = await tauriService.generate_preview_svg(code, currentTheme)
      
      if (this.currentRequest?.signal.aborted) {
        return
      }
      
      this.previewCache.set(cacheKey, svgContent)
      editorStore.setPreview(svgContent)
      editorStore.setError(null)
      
    } catch (error) {
      if (!this.currentRequest?.signal.aborted) {
        editorStore.setError(`${error}`)
      }
    } finally {
      this.isGenerating = false
      editorStore.setGenerating(false)
    }
  }

  private getCacheKey(code: string): string {
    return code.trim()
  }

  private isValidForPreview(code: string): boolean {
    const trimmed = code.trim()
    
    const hasValidStart = /^(graph|flowchart|sequenceDiagram|classDiagram|pie|gitgraph|gantt)/m.test(trimmed)
    if (!hasValidStart) return false
    
    const lines = trimmed.split('\n').filter(line => line.trim().length > 0)
    if (lines.length < 2) return false
    
    const incompletePatterns = [
      /--$/,           // Arrow yarıda
      /\w+\s*$/,       // Kelime yarıda
      /\[\s*$/,        // Bracket açık
      /\(\s*$/,        // Paren açık
      /\{\s*$/,        // Brace açık
    ]
    
    for (const pattern of incompletePatterns) {
      if (pattern.test(trimmed)) return false
    }
    
    return true
  }
  
  triggerPreview(): void {
    const { code } = get(editorStore)
    this.generatePreview(code)
  }
}

export const previewService = new PreviewService()