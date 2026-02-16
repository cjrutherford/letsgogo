import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-go'

interface SyntaxHighlightProps {
  code: string
  language?: string
  className?: string
}

export function SyntaxHighlight({ code, language = 'go', className = '' }: SyntaxHighlightProps) {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code, language])

  return (
    <pre className={`language-${language} ${className}`}>
      <code ref={codeRef} className={`language-${language}`}>
        {code}
      </code>
    </pre>
  )
}

export function highlightCode(code: string, language = 'go'): string {
  return Prism.highlight(code, Prism.languages[language], language)
}
