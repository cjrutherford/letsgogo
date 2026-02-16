import express from 'express'
import cors from 'cors'
import { exec } from 'child_process'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFile, unlink } from 'fs/promises'
import { createHash } from 'crypto'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

interface CompileRequest {
  code: string
}

interface CompileResponse {
  output: string
  errors: string[]
  success: boolean
}

async function compileGo(code: string): Promise<CompileResponse> {
  const tmpFileName = `go_run_${createHash('sha256').update(code).digest('hex').slice(0, 8)}.go`
  const tmpPath = join(tmpdir(), tmpFileName)

  try {
    await writeFile(tmpPath, code, 'utf-8')

    return new Promise((resolve) => {
      exec(
        `go run ${tmpPath}`,
        { timeout: 15000, maxBuffer: 1024 * 1024 },
        async (error, stdout, stderr) => {
          try {
            await unlink(tmpPath)
          } catch {}

          if (error) {
            if (error.killed) {
              resolve({
                output: '',
                errors: ['Execution timed out. Your code took too long to run.'],
                success: false
              })
              return
            }

            const errorMsg = stderr || error.message
            const errors = errorMsg
              .split('\n')
              .filter(line => line.trim())
              .map(line => line.replace(tmpPath, 'main.go'))

            resolve({
              output: '',
              errors,
              success: false
            })
            return
          }

          resolve({
            output: stdout,
            errors: [],
            success: true
          })
        }
      )
    })
  } catch (err) {
    try {
      await unlink(tmpPath)
    } catch {}

    return {
      output: '',
      errors: [`Failed to write code: ${err instanceof Error ? err.message : 'Unknown error'}`],
      success: false
    }
  }
}

app.post('/api/compile', async (req, res) => {
  const { code } = req.body as CompileRequest

  if (!code) {
    res.status(400).json({ error: 'No code provided' })
    return
  }

  const result = await compileGo(code)
  res.json(result)
})

app.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Go compiler server running on http://localhost:${PORT}`)
})
