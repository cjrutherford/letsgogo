# GoZeroToHero

A mobile-first PWA for learning Go from a TypeScript background. Designed for web and services developers who want to understand Go's unique approach to memory management, concurrency, and building services.

## Features

- **Mobile-First PWA**: Installable on mobile devices, works offline
- **10 Comprehensive Modules**: From TypeScript to Go, covering GC, concurrency, testing, and more
- **Interactive Code Playground**: Run Go code in-browser (WASM)
- **Progress Tracking**: Track your learning progress
- **GitHub Authentication**: Sign in with your GitHub account
- **Cloud Sync**: Progress syncs to cloud database

## Tech Stack

- React + TypeScript + Vite
- TailwindCSS for styling
- PWA with vite-plugin-pwa
- Supabase for Auth & Database

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema in `supabase/schema.sql` in the Supabase SQL editor
3. Get your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from project settings
4. Add them to your `.env` file

### Development

```bash
# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build
```

## Modules

1. **From TypeScript to Go** - Type system, zero values, error handling
2. **Go's Unique Quirks** - Pointers, slices, maps, defer/panic/recover
3. **Garbage Collection** - How GC works, escape analysis
4. **Concurrency (Async)** - Goroutines, channels, select
5. **Parallelism** - WaitGroup, Mutex, atomic, race conditions
6. **Testing in Go** - Table-driven tests, benchmarks
7. **Web Services** - net/http, REST APIs, middleware
8. **Standard Library** - Survey of Go stdlib
9. **Popular Packages** - Web frameworks, ORMs, utilities
10. **Production Polish** - Profiling, security, deployment

## Content Structure

```
src/content/modules/
├── typescript-to-go/
├── quirks/
├── gc/
├── concurrency/
├── parallelism/
├── testing/
├── webservices/
├── stdlib/
├── packages/
└── polish/
```

Each module has markdown lessons that can be rendered in the app.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Add content to `src/content/modules/`
4. Submit a PR

## License

MIT
