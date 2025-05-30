# 1. Mevcut tsconfig.json'ı düzelt
cat > tsconfig.json << 'EOF'
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "$lib/*": ["./src/lib/*"],
      "$lib": ["./src/lib"]
    }
  },
  "include": [
    "src/**/*.d.ts", 
    "src/**/*.ts", 
    "src/**/*.js", 
    "src/**/*.svelte"
  ],
  "exclude": [
    "node_modules/**", 
    ".svelte-kit/**"
  ]
}
EOF

# 2. +page.svelte'i düzelt (syntax error var)
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
    onNew={handleNew}
    onOpen={handleOpen}
    onSave={handleSave}
    onGenerate={handleGenerate}
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

# 3. Test the app again
echo "✅ Files fixed! Testing..."
npm run tauri dev