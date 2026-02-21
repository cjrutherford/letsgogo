export interface CompileResult {
  output: string
  errors: string[]
  success: boolean
}

const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : '/api'

export async function compileGo(code: string, testCode?: string): Promise<CompileResult> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000)

    const response = await fetch(`${API_URL}/api/compile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, ...(testCode ? { testCode } : {}) }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        output: '',
        errors: [`Server error: ${response.status}`],
        success: false
      }
    }

    const data = await response.json()

    if (data.errors && data.errors.length > 0) {
      return {
        output: '',
        errors: data.errors,
        success: false
      }
    }

    return {
      output: data.output || '',
      errors: [],
      success: true
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    if (message.includes('abort')) {
      return {
        output: '',
        errors: ['Request timed out. Make sure the Go compiler server is running.'],
        success: false
      }
    }

    return {
      output: '',
      errors: [`Failed to compile: ${message}. Is the Go compiler server running?`],
      success: false
    }
  }
}
