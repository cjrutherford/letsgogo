import express from 'express'
import cors from 'cors'
import { exec } from 'child_process'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFile, unlink, mkdir, rm } from 'fs/promises'
import { createHash } from 'crypto'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

interface CompileRequest {
  code: string
  testCode?: string
}

interface CompileResponse {
  output: string
  errors: string[]
  success: boolean
}

/** Returns true when the code contains Go test or benchmark functions. */
function isTestCode(code: string): boolean {
  return (
    code.includes('"testing"') &&
    (/\nfunc Test[A-Z]/.test(code) || /\nfunc Benchmark[A-Z]/.test(code))
  )
}

/** Replaces `package main` with `package challenge` so that `go test` can
 *  compile the code alongside a generated test-binary entry point without a
 *  duplicate-symbol error for `func main`. */
function toTestPackage(code: string): string {
  return code.replace(/^package main$/m, 'package challenge')
}

/** Runs user code (and optional hidden testCode) with `go test -v`. */
async function runGoTest(userCode: string, testCode?: string): Promise<CompileResponse> {
  const hash = createHash('sha256')
    .update(userCode + (testCode ?? ''))
    .digest('hex')
    .slice(0, 8)
  const tmpDir = join(tmpdir(), `go_test_${hash}`)

  try {
    await mkdir(tmpDir, { recursive: true })

    const userPkg = toTestPackage(userCode)

    if (testCode) {
      // Implementation challenge: user's code in solution.go, hidden tests in solution_test.go
      await writeFile(join(tmpDir, 'solution.go'), userPkg, 'utf-8')
      await writeFile(join(tmpDir, 'solution_test.go'), toTestPackage(testCode), 'utf-8')
    } else {
      // Self-contained test file: user wrote both the implementation and the tests.
      // Place everything in solution_test.go; go test requires at least one non-test
      // source file in the package, so create a minimal one.
      await writeFile(join(tmpDir, 'solution.go'), 'package challenge\n', 'utf-8')
      await writeFile(join(tmpDir, 'solution_test.go'), userPkg, 'utf-8')
    }

    await writeFile(join(tmpDir, 'go.mod'), 'module challenge\n\ngo 1.21\n', 'utf-8')

    const hasBenchmark =
      /\nfunc Benchmark[A-Z]/.test(userCode) ||
      (testCode !== undefined && /\nfunc Benchmark[A-Z]/.test(testCode))
    const benchFlag = hasBenchmark ? ' -bench=. -benchtime=100ms' : ''
    const cmd = `go test -v${benchFlag} ./...`

    return new Promise((resolve) => {
      exec(
        cmd,
        { cwd: tmpDir, timeout: 15000, maxBuffer: 1024 * 1024 },
        async (error, stdout, stderr) => {
          try {
            await rm(tmpDir, { recursive: true, force: true })
          } catch {}

          // Distinguish a build/compilation error (no test output) from a test
          // failure (go test produced output but exited non-zero).
          const hasTestOutput =
            stdout &&
            (stdout.includes('=== RUN') ||
              stdout.includes('--- PASS') ||
              stdout.includes('--- FAIL') ||
              stdout.includes('PASS\n') ||
              stdout.includes('FAIL\n') ||
              stdout.includes('ok  \t') ||
              stdout.includes('FAIL\t'))

          if (error && !hasTestOutput) {
            const errorMsg = stderr || error.message
            const errors = errorMsg
              .split('\n')
              .filter((l) => l.trim())
              .map((l) =>
                l
                  .replace(tmpDir + '/', '')
                  .replace(tmpDir, 'solution.go')
              )
            resolve({ output: '', errors, success: false })
            return
          }

          // Tests ran (pass or fail) – always return the output so the learner
          // can see which assertions failed.
          resolve({ output: stdout || stderr, errors: [], success: true })
        }
      )
    })
  } catch (err) {
    try {
      await rm(tmpDir, { recursive: true, force: true })
    } catch {}
    return {
      output: '',
      errors: [
        `Failed to run tests: ${err instanceof Error ? err.message : 'Unknown error'}`
      ],
      success: false
    }
  }
}

async function compileGo(code: string, testCode?: string): Promise<CompileResponse> {
  // Route to the test runner when hidden tests are supplied or when the user's
  // own code contains test/benchmark functions.
  if (testCode || isTestCode(code)) {
    return runGoTest(code, testCode)
  }

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
  const { code, testCode } = req.body as CompileRequest

  if (!code) {
    res.status(400).json({ error: 'No code provided' })
    return
  }

  const result = await compileGo(code, testCode)
  res.json(result)
})

app.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Go compiler server running on http://localhost:${PORT}`)
})
