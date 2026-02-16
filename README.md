# GoZeroToHero 🚀

A comprehensive, mobile-first Progressive Web App (PWA) for learning Go from a TypeScript background. Designed specifically for web and services developers who want to master Go's unique approach to memory management, concurrency, and building production-ready services.

## 🌟 Features

- **📱 Mobile-First PWA**: Installable on mobile devices, works offline, learn anywhere
- **📚 11 Comprehensive Modules**: 44+ interactive lessons covering everything from basics to production
- **💪 63+ Interactive Challenges**: Hands-on coding exercises with instant feedback
- **🎮 Interactive Code Playground**: Run and experiment with Go code directly in your browser (powered by WASM)
- **📊 Progress Tracking**: Track your learning journey with detailed progress metrics
- **☁️ Cloud Sync**: Your progress syncs automatically to Turso/LibSQL database
- **🎯 Difficulty Levels**: Challenges rated as Easy, Medium, or Hard to match your skill level

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS v4
- **Code Editor**: Monaco Editor (same as VS Code)
- **Database**: Turso/LibSQL (local-first, cloud-sync SQLite)
- **PWA**: vite-plugin-pwa with offline support
- **Go Runtime**: WebAssembly (WASM) for in-browser execution

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or pnpm package manager

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Turso/LibSQL credentials (optional for local dev)
```

### Turso/LibSQL Setup

This project uses Turso (LibSQL) for cloud-synced progress tracking. You can run it locally or use Turso cloud:

**Option 1: Local Development (Recommended for Getting Started)**
```bash
# The app will use a local SQLite database file
# No additional setup needed - just use the default .env.example
```

**Option 2: Turso Cloud (For production deployment)**
1. Create a free account at [turso.tech](https://turso.tech)
2. Install the Turso CLI using one of these methods:
   
   **Via Homebrew (recommended for macOS/Linux):**
   ```bash
   brew install tursodatabase/tap/turso
   ```
   
   **Via Go (if you have Go installed):**
   ```bash
   go install github.com/tursodatabase/turso-cli/cmd/turso@latest
   ```
   
   **Via installation script** (review the [script](https://get.tur.so/install.sh) first):
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
3. Create a database:
   ```bash
   turso db create gozerohero
   ```
4. Get your database URL and auth token:
   ```bash
   turso db show gozerohero
   ```
5. Run the schema:
   ```bash
   turso db shell gozerohero < turso/schema.sql
   ```
6. Update your `.env` file with the connection details

### Development

```bash
# Start development server - Vite + React
npm run dev

# The app will be available at http://localhost:5173
```

### Running with Backend (Code Compilation Server)

```bash
# Start both frontend and backend server
npm start

# Or run them separately:
# Terminal 1 - Backend (Go code compilation)
npm run server

# Terminal 2 - Frontend
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## 📚 Learning Modules

GoZeroToHero contains **11 comprehensive modules** with **44+ interactive lessons** covering everything from Go basics to production deployment:

### 1. Go Basics (17 lessons)
Core Go fundamentals: Hello World, variables, types, functions, control flow, packages, and imports.

### 2. TypeScript to Go (3 lessons)
- Type system comparison and mental models
- Zero values vs undefined/null
- Error handling: Go's way vs try/catch

### 3. Go's Unique Quirks (3 lessons)
- Values vs pointers: when to use each
- Slices, arrays, and maps: the tricky parts
- defer/panic/recover patterns

### 4. Garbage Collection (3 lessons)
- How Go's GC works under the hood
- Escape analysis and stack vs heap
- Writing GC-friendly code for performance

### 5. Concurrency (Async) (3 lessons)
- Goroutines 101: lightweight threads
- Channels: communicating between goroutines
- Select statement for multiplexing

### 6. Parallelism (3 lessons)
- WaitGroup and Mutex patterns
- sync/atomic for lock-free operations
- Understanding and preventing race conditions

### 7. Testing in Go (3 lessons)
- The testing package and conventions
- Table-driven tests: the Go way
- Benchmarks and performance testing

### 8. Web Services (3 lessons)
- net/http basics and HTTP servers
- Building REST APIs
- Middleware patterns and chaining

### 9. Standard Library (3 lessons)
- fmt, strings, and strconv for formatting
- io and file handling
- Essential stdlib packages

### 10. Popular Packages (3 lessons)
- Web frameworks (Gin, Echo, Chi)
- Database libraries and ORMs
- Essential third-party utilities

### 11. Production Polish (3 lessons)
- Profiling and optimization
- Security best practices
- Deployment strategies

## 💪 Interactive Challenges

The app includes **63+ coding challenges** across all modules with three difficulty levels:

- **🟢 Easy**: Fundamental concepts and syntax (10 points each)
- **🟡 Medium**: Practical applications and patterns (20 points each)
- **🔴 Hard**: Complex scenarios and optimization (30 points each)

Each challenge includes:
- Clear problem description
- Starter code template
- Multiple hints to guide you
- Instant validation and feedback
- Points system to track your progress

## 🎨 Content Structure

```
src/content/modules/
├── basics/              # 17 lessons - Go fundamentals
├── typescript-to-go/    # 3 lessons - TS → Go migration
├── quirks/              # 3 lessons - Go's unique features
├── gc/                  # 3 lessons - Garbage collection
├── concurrency/         # 3 lessons - Goroutines & channels
├── parallelism/         # 3 lessons - Concurrent programming
├── testing/             # 3 lessons - Testing patterns
├── webservices/         # 3 lessons - HTTP & REST
├── stdlib/              # 3 lessons - Standard library
├── packages/            # 3 lessons - Third-party packages
└── polish/              # 3 lessons - Production readiness
```

Each module contains markdown lessons with:
- Detailed explanations with TypeScript comparisons
- Code examples with syntax highlighting
- Best practices and common pitfalls
- Links to related challenges

## 🤝 Contributing

**We need YOUR help!** GoZeroToHero is a community-driven project, and we're actively looking for contributors to help expand and improve the learning content.

### 🎯 What We Need

We're especially looking for contributions in these areas:

1. **📝 More Lessons**: Expand existing modules with additional lessons
2. **💪 More Challenges**: Create new coding challenges for all difficulty levels
3. **🔍 Content Review**: Review and improve existing lessons for clarity
4. **🐛 Bug Fixes**: Fix typos, code errors, or broken examples
5. **✨ New Modules**: Suggest and create entirely new learning modules
6. **🌍 Translations**: Help make Go accessible to non-English speakers

### 🚀 How to Contribute

#### Adding New Lessons

1. Fork the repository
2. Create a new branch: `git checkout -b add-lesson-goroutine-patterns`
3. Add your lesson markdown file in the appropriate module directory:
   ```
   src/content/modules/{module-name}/{number}-{lesson-slug}.md
   ```
4. Follow the existing lesson format (see existing lessons for reference)
5. Submit a Pull Request with a clear description

#### Adding New Challenges

1. Fork the repository
2. Create a new branch: `git checkout -b add-challenge-channel-select`
3. Add your challenge to `src/lib/challenges.ts`:
   ```typescript
   {
     id: 'module-##',
     lessonSlug: 'lesson-slug',
     title: 'Challenge Title',
     description: 'What the student needs to do...',
     starterCode: `package main\n\n// Your starter code`,
     expectedOutput: 'Expected console output',
     hints: ['Hint 1', 'Hint 2'],
     points: 10, // 10=easy, 20=medium, 30=hard
     difficulty: 'easy'
   }
   ```
4. Test your challenge in the app
5. Submit a Pull Request

#### Content Guidelines

- **Keep it practical**: Focus on real-world use cases
- **TypeScript comparisons**: Help readers bridge from TS to Go
- **Code examples**: Include working, tested code snippets
- **Progressive difficulty**: Start simple, build complexity
- **Explain the "why"**: Don't just show syntax, explain reasoning
- **Be concise**: Respect the reader's time

### 📋 Pull Request Process

1. Ensure your lesson/challenge follows existing patterns
2. Test any code examples - they should run without errors
3. Update relevant documentation if needed
4. Write a clear PR description explaining what you're adding
5. Link to any related issues

### 💡 Contribution Ideas

Not sure where to start? Here are some specific needs:

- **Basics Module**: More examples of control flow patterns
- **Concurrency Module**: Real-world goroutine patterns (worker pools, pipelines)
- **Testing Module**: Examples of mocking and integration tests
- **Web Services Module**: gRPC examples, GraphQL patterns
- **Packages Module**: Coverage of popular libraries (sqlx, validator, viper)
- **Production Module**: Docker, Kubernetes, observability examples

### 🎓 First-Time Contributors

New to open source? We welcome beginners! Look for issues tagged with `good-first-issue` or start by:
- Fixing typos or improving existing documentation
- Adding hints to existing challenges
- Writing tests for code examples

### 📞 Questions?

- Open an issue for discussion
- Check existing issues and PRs first
- Be respectful and constructive

**Every contribution matters!** Whether you're adding a single challenge or an entire module, you're helping developers worldwide learn Go. 🙌

## 📄 License

MIT - feel free to use this project for learning and teaching!

## 🌟 Show Your Support

If you find GoZeroToHero helpful:
- ⭐ Star this repository
- 🔗 Share it with fellow developers
- 🤝 Contribute new content
- 🐛 Report issues or suggest improvements

**Together, let's make learning Go accessible to everyone!** 🚀
