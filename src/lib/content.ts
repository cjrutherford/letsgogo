// Content imports - each lesson's markdown
import typeSystemComparison from '../content/modules/typescript-to-go/01-type-system-comparison.md?raw'
import zeroValues from '../content/modules/typescript-to-go/02-zero-values.md?raw'
import errorHandling from '../content/modules/typescript-to-go/03-error-handling.md?raw'

// Basics module
import basicsHelloWorld from '../content/modules/basics/01-hello-world.md?raw'
import basicsVariablesTypes from '../content/modules/basics/02-variables-types.md?raw'
import basicsFunctions from '../content/modules/basics/03-functions.md?raw'
import basicsControlFlow from '../content/modules/basics/04-control-flow.md?raw'
import basicsPackagesImports from '../content/modules/basics/05-packages-imports.md?raw'

// Basics sub-lessons - Variables & Types
import basicTypes from '../content/modules/basics/02a-basic-types.md?raw'
import typeConversion from '../content/modules/basics/02b-type-conversion.md?raw'
import customTypes from '../content/modules/basics/02c-custom-types.md?raw'

// Basics sub-lessons - Functions
import functionDeclarations from '../content/modules/basics/03a-function-declarations.md?raw'
import multipleReturns from '../content/modules/basics/03b-multiple-returns.md?raw'
import variadicFunctions from '../content/modules/basics/03c-variadic-functions.md?raw'

// Basics sub-lessons - Control Flow
import ifElse from '../content/modules/basics/04a-if-else.md?raw'
import switchStatements from '../content/modules/basics/04b-switch-statements.md?raw'
import loops from '../content/modules/basics/04c-loops.md?raw'

// Basics sub-lessons - Packages & Imports
import packageDeclaration from '../content/modules/basics/05a-package-declaration.md?raw'
import importStatements from '../content/modules/basics/05b-import-statements.md?raw'
import initFunctions from '../content/modules/basics/05c-init-functions.md?raw'

import valuesVsPointers from '../content/modules/quirks/01-values-vs-pointers.md?raw'
import slicesArraysMaps from '../content/modules/quirks/02-slices-arrays-maps.md?raw'
import deferPanicRecover from '../content/modules/quirks/03-defer-panic-recover.md?raw'

import howGCWorks from '../content/modules/gc/01-how-gc-works.md?raw'
import escapeAnalysis from '../content/modules/gc/02-escape-analysis.md?raw'
import gcFriendlyCode from '../content/modules/gc/03-gc-friendly-code.md?raw'

import goroutines101 from '../content/modules/concurrency/01-goroutines-101.md?raw'
import channels from '../content/modules/concurrency/02-channels.md?raw'
import selectStatement from '../content/modules/concurrency/03-select-statement.md?raw'

import waitgroupMutex from '../content/modules/parallelism/01-waitgroup-mutex.md?raw'
import syncAtomic from '../content/modules/parallelism/02-sync-atomic.md?raw'
import raceConditions from '../content/modules/parallelism/03-race-conditions.md?raw'

import testingPackage from '../content/modules/testing/01-testing-package.md?raw'
import tableTests from '../content/modules/testing/02-table-tests.md?raw'
import benchmarks from '../content/modules/testing/03-benchmarks.md?raw'

import netHttpBasics from '../content/modules/webservices/01-net-http-basics.md?raw'
import restApis from '../content/modules/webservices/02-rest-apis.md?raw'
import middleware from '../content/modules/webservices/03-middleware.md?raw'

import fmtStringsStrconv from '../content/modules/stdlib/01-fmt-strings-strconv.md?raw'
import encodingPackages from '../content/modules/stdlib/02-encoding-packages.md?raw'
import netHttpContext from '../content/modules/stdlib/03-net-http-context.md?raw'

import webFrameworks from '../content/modules/packages/01-web-frameworks.md?raw'
import ormsDb from '../content/modules/packages/02-orms-db.md?raw'
import utilities from '../content/modules/packages/03-utilities.md?raw'

import profiling from '../content/modules/polish/01-profiling.md?raw'
import security from '../content/modules/polish/02-security.md?raw'
import deployment from '../content/modules/polish/03-deployment.md?raw'

export const lessonContent: Record<string, string> = {
  // Basics
  'basics-hello-world': basicsHelloWorld,
  'basics-variables-types': basicsVariablesTypes,
  'basics-functions': basicsFunctions,
  'basics-control-flow': basicsControlFlow,
  'basics-packages-imports': basicsPackagesImports,

  // Basics sub-lessons - Variables & Types
  'basic-types': basicTypes,
  'type-conversion': typeConversion,
  'custom-types': customTypes,

  // Basics sub-lessons - Functions
  'function-declarations': functionDeclarations,
  'multiple-returns': multipleReturns,
  'variadic-functions': variadicFunctions,

  // Basics sub-lessons - Control Flow
  'if-else': ifElse,
  'switch-statements': switchStatements,
  'loops': loops,

  // Basics sub-lessons - Packages & Imports
  'package-declaration': packageDeclaration,
  'import-statements': importStatements,
  'init-functions': initFunctions,

  // TypeScript to Go
  'type-system-comparison': typeSystemComparison,
  'zero-values': zeroValues,
  'error-handling': errorHandling,
  
  // Quirks
  'values-vs-pointers': valuesVsPointers,
  'slices-arrays-maps': slicesArraysMaps,
  'defer-panic-recover': deferPanicRecover,
  
  // GC
  'how-gc-works': howGCWorks,
  'escape-analysis': escapeAnalysis,
  'gc-friendly-code': gcFriendlyCode,
  
  // Concurrency
  'goroutines-101': goroutines101,
  'channels': channels,
  'select-statement': selectStatement,
  
  // Parallelism
  'waitgroup-mutex': waitgroupMutex,
  'sync-atomic': syncAtomic,
  'race-conditions': raceConditions,
  
  // Testing
  'testing-package': testingPackage,
  'table-tests': tableTests,
  'benchmarks': benchmarks,
  
  // Web Services
  'net-http-basics': netHttpBasics,
  'rest-apis': restApis,
  'middleware': middleware,
  
  // Stdlib
  'fmt-strings-strconv': fmtStringsStrconv,
  'encoding-packages': encodingPackages,
  'net-http-context': netHttpContext,
  
  // Packages
  'web-frameworks': webFrameworks,
  'orms-db': ormsDb,
  'utilities': utilities,
  
  // Polish
  'profiling': profiling,
  'security': security,
  'deployment': deployment,
}

export function extractExcerpt(content: string, maxLength = 180): string {
  if (!content) return ''
  
  const lines = content.split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .slice(0, 3)
  
  let excerpt = lines.join(' ').replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/[#*_~\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  if (excerpt.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength).trim() + '...'
  }
  
  return excerpt
}
