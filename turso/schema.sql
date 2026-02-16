-- GoZeroToHero Database Schema for Turso/LibSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  order_num INTEGER NOT NULL
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES modules(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  order_num INTEGER NOT NULL
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id),
  lesson_id TEXT REFERENCES lessons(id),
  module_id TEXT REFERENCES modules(id),
  completed INTEGER DEFAULT 0,
  score INTEGER,
  completed_at TEXT,
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- Seed modules data
INSERT OR IGNORE INTO modules (id, title, slug, description, order_num) VALUES
('typescript-to-go', 'From TypeScript to Go', 'typescript-to-go', 'Understanding Go coming from TypeScript', 1),
('quirks', 'Go''s Unique Quirks', 'quirks', 'Learn the unique aspects of Go', 2),
('gc', 'Garbage Collection', 'gc', 'Understanding Go GC and memory', 3),
('concurrency', 'Concurrency (Async)', 'concurrency', 'Goroutines and channels', 4),
('parallelism', 'Parallelism', 'parallelism', 'Synchronization and patterns', 5),
('testing', 'Testing in Go', 'testing', 'Writing tests the Go way', 6),
('webservices', 'Web Services', 'webservices', 'Building APIs with Go', 7),
('stdlib', 'Standard Library', 'stdlib', 'Survey of Go standard library', 8),
('packages', 'Popular Packages', 'packages', 'Essential third-party libraries', 9),
('polish', 'Production Polish', 'polish', 'Final touches for production', 10);

-- Seed lessons data
INSERT OR IGNORE INTO lessons (id, module_id, title, slug, order_num) VALUES
-- TypeScript to Go
('ts-go-01', 'typescript-to-go', 'Type System Comparison', 'type-system-comparison', 1),
('ts-go-02', 'typescript-to-go', 'Zero Values', 'zero-values', 2),
('ts-go-03', 'typescript-to-go', 'Error Handling', 'error-handling', 3),
-- Quirks
('quirks-01', 'quirks', 'Values vs Pointers', 'values-vs-pointers', 1),
('quirks-02', 'quirks', 'Slices, Arrays, and Maps', 'slices-arrays-maps', 2),
('quirks-03', 'quirks', 'Defer, Panic, Recover', 'defer-panic-recover', 3),
-- GC
('gc-01', 'gc', 'How GC Works', 'how-gc-works', 1),
('gc-02', 'gc', 'Escape Analysis', 'escape-analysis', 2),
('gc-03', 'gc', 'Writing GC-Friendly Code', 'gc-friendly-code', 3),
-- Concurrency
('conc-01', 'concurrency', 'Goroutines 101', 'goroutines-101', 1),
('conc-02', 'concurrency', 'Channels', 'channels', 2),
('conc-03', 'concurrency', 'Select Statement', 'select-statement', 3),
-- Parallelism
('par-01', 'parallelism', 'WaitGroup and Mutex', 'waitgroup-mutex', 1),
('par-02', 'parallelism', 'sync/atomic', 'sync-atomic', 2),
('par-03', 'parallelism', 'Race Conditions', 'race-conditions', 3),
-- Testing
('test-01', 'testing', 'Testing Package', 'testing-package', 1),
('test-02', 'testing', 'Table-Driven Tests', 'table-tests', 2),
('test-03', 'testing', 'Benchmarks', 'benchmarks', 3),
-- Web Services
('web-01', 'webservices', 'net/http Basics', 'net-http-basics', 1),
('web-02', 'webservices', 'REST APIs', 'rest-apis', 2),
('web-03', 'webservices', 'Middleware', 'middleware', 3),
-- Stdlib
('stdlib-01', 'stdlib', 'fmt, strings, strconv', 'fmt-strings-strconv', 1),
('stdlib-02', 'stdlib', 'encoding packages', 'encoding-packages', 2),
('stdlib-03', 'stdlib', 'net/http and context', 'net-http-context', 3),
-- Packages
('pkg-01', 'packages', 'Web Frameworks', 'web-frameworks', 1),
('pkg-02', 'packages', 'ORMs and DB', 'orms-db', 2),
('pkg-03', 'packages', 'Utilities', 'utilities', 3),
-- Polish
('polish-01', 'polish', 'Profiling', 'profiling', 1),
('polish-02', 'polish', 'Security', 'security', 2),
('polish-03', 'polish', 'Deployment', 'deployment', 3);
