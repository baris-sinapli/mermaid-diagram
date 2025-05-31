import * as monaco from 'monaco-editor'

export function registerMermaidLanguage() {
  monaco.languages.register({ id: 'mermaid' })
  
  monaco.languages.setMonarchTokensProvider('mermaid', {
    tokenizer: {
      root: [
        [/graph|flowchart|sequenceDiagram|classDiagram|pie|gitgraph/, 'keyword'],
        [/TD|TB|BT|RL|LR/, 'type'],
        [/\-\-\>|\-\.\>|\=\=\>/, 'operator'],
        [/\[.*?\]/, 'string'],
        [/\{.*?\}/, 'variable'],
        [/\(.*?\)/, 'number'],
        [/%%.*$/, 'comment']
      ]
    }
  })
  
  monaco.languages.setLanguageConfiguration('mermaid', {
    comments: {
      lineComment: '%%'
    },
    brackets: [
      ['[', ']'],
      ['(', ')'],
      ['{', '}']
    ],
    autoClosingPairs: [
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '"', close: '"' }
    ]
  })
}