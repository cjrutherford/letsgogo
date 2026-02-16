# Contributing to GoZeroToHero

Thank you for your interest in contributing to GoZeroToHero! This guide will help you get started with adding lessons, challenges, and other improvements to the project.

## 🎯 What Can You Contribute?

### High Priority Needs

1. **New Lessons** - Expand existing modules with more detailed content
2. **Coding Challenges** - Create interactive exercises for learners
3. **Module Expansion** - Add entirely new modules on advanced topics
4. **Documentation** - Improve README, guides, and code comments
5. **Bug Fixes** - Fix issues in existing lessons or code
6. **Code Examples** - Add or improve code snippets in lessons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Git for version control
- Basic understanding of Go (for content contributions)
- Basic understanding of React/TypeScript (for code contributions)

### Setup Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/letsgogo.git
   cd letsgogo
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/cjrutherford/letsgogo.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser** to `http://localhost:5173` (default Vite port; actual port may vary if 5173 is already in use)

## 📝 Adding New Lessons

### Lesson File Structure

Lessons are markdown files located in `src/content/modules/{module-name}/`. Each lesson should follow this naming convention:

```
{number}-{lesson-slug}.md
```

For example:
- `01-hello-world.md`
- `02-variables-types.md`
- `03a-function-declarations.md` (sub-lesson)

### Lesson Template

Create a new markdown file with this structure:

```markdown
# Lesson Title

Brief introduction explaining what this lesson covers and why it matters.

## Section 1: Main Concept

Explanation of the concept with TypeScript comparison where applicable.

### TypeScript Way

\`\`\`typescript
// TypeScript example
interface User {
  id: number;
  name: string;
}

const user: User = { id: 1, name: "Alice" };
\`\`\`

### Go Way

\`\`\`go
// Go example
type User struct {
    ID   int
    Name string
}

user := User{ID: 1, Name: "Alice"}
\`\`\`

## Key Differences

- Point 1: Explanation
- Point 2: Explanation
- Point 3: Explanation

## Best Practices

- ✅ Do this
- ❌ Don't do this

## Common Pitfalls

Explain common mistakes beginners make and how to avoid them.

## Next Steps

- Link to related lesson
- Suggest a challenge to practice
```

### Lesson Writing Guidelines

1. **Start with Context**: Explain why this topic matters
2. **Compare with TypeScript**: Help readers bridge their existing knowledge
3. **Use Clear Examples**: Every concept needs a working code example
4. **Highlight Differences**: Call out Go-specific behavior explicitly
5. **Keep it Focused**: One main concept per lesson
6. **Add Code Comments**: Explain what each line does
7. **Test Your Code**: All examples should compile and run
8. **Progressive Complexity**: Start simple, add complexity gradually

### Code Style in Lessons

**TypeScript blocks:**
```markdown
\`\`\`typescript
// Your TypeScript code
\`\`\`
```

**Go blocks:**
```markdown
\`\`\`go
// Your Go code
\`\`\`
```

**Shell/Terminal:**
```markdown
\`\`\`bash
$ go run main.go
\`\`\`
```

## 💪 Adding New Challenges

Challenges are defined in `src/lib/challenges.ts`. Each challenge is a TypeScript object in the `challenges` array.

### Challenge Template

```typescript
{
  id: 'module-##',  // e.g., 'basics-05', 'concur-03'
  lessonSlug: 'lesson-name',  // Must match a lesson file
  title: 'Clear, Action-Oriented Title',
  description: 'Detailed description of what the user needs to accomplish. Be specific about expected behavior and output.',
  starterCode: `package main

import "fmt"

// Starter code here - give them a framework
func main() {
    // TODO: Complete this function
}`,
  expectedOutput: 'Exact expected console output',  // Optional
  validationPattern: 'regex-pattern',  // Optional, for flexible validation
  hints: [
    'First hint - nudge in the right direction',
    'Second hint - more specific guidance',
    'Third hint - almost give it away'
  ],
  points: 10,  // 10=easy, 20=medium, 30=hard
  difficulty: 'easy'  // 'easy' | 'medium' | 'hard'
}
```

### Challenge Guidelines

1. **Clear Objective**: User should know exactly what success looks like
2. **Starter Code**: Provide a helpful framework, not too much or too little
3. **Incremental Hints**: Each hint should be progressively more helpful
4. **Testable Output**: Use `expectedOutput` or `validationPattern` for validation
5. **Appropriate Difficulty**:
   - **Easy (10 pts)**: Basic syntax, single concept
   - **Medium (20 pts)**: Combine multiple concepts, practical application
   - **Hard (30 pts)**: Complex logic, optimization, edge cases

### Example Challenge

```typescript
{
  id: 'basics-03',
  lessonSlug: 'functions',
  title: 'Sum with Multiple Return Values',
  description: 'Create a function `Calculate` that takes two integers and returns both their sum and their product. Call it with 5 and 3, print both results.',
  starterCode: `package main

import "fmt"

// TODO: Define Calculate function here
// func Calculate(a, b int) (???, ???) {
// }

func main() {
    // TODO: Call Calculate and print results
}`,
  expectedOutput: 'Sum: 8\nProduct: 15',
  hints: [
    'Go functions can return multiple values: func name() (int, int)',
    'Use fmt.Printf to format output: fmt.Printf("Sum: %d\\n", sum)',
    'Return values with: return a+b, a*b'
  ],
  points: 10,
  difficulty: 'easy'
}
```

### Testing Your Challenge

1. Add your challenge to `src/lib/challenges.ts`
2. Restart the dev server: `npm run dev`
3. Navigate to the challenge in the app
4. Verify the starter code loads correctly
5. Test that the solution produces the expected output
6. Ensure hints are helpful and progressive

## 🏗️ Creating New Modules

To add an entirely new module:

1. **Create module directory**:
   ```bash
   mkdir src/content/modules/your-module-name
   ```

2. **Add lessons**: Create markdown files following the lesson template

3. **Update module metadata** in `src/components/LessonView.tsx`:
   ```typescript
   export const modulesData = [
     // ... existing modules
     {
       id: 'your-module-name',
       title: 'Your Module Title',
       description: 'Brief description of what this module covers',
       lessons: [
         { slug: 'lesson-1', title: 'Lesson 1 Title' },
         { slug: 'lesson-2', title: 'Lesson 2 Title' },
       ]
     }
   ]
   ```

4. **Add challenges** in `src/lib/challenges.ts` for the new module

5. **Test thoroughly**: Navigate through all lessons, test all challenges

## 🎨 Code Style Guidelines

### Markdown Files

- Use ATX-style headers (`#`, `##`, `###`)
- Use fenced code blocks with language identifiers
- Keep lines under 120 characters where possible
- Use emphasis (`**bold**`, `*italic*`, `` `code` ``) appropriately

### TypeScript/JavaScript Code

- Follow the existing ESLint configuration
- Use TypeScript types explicitly
- Prefer functional components for React
- Use meaningful variable names

### Go Code Examples

- Follow standard Go formatting (gofmt)
- Include package and import statements
- Add comments explaining non-obvious code
- Use idiomatic Go patterns

## 📋 Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b add-channel-patterns-lesson
   ```

3. **Make your changes**: Add lessons, challenges, or fixes

4. **Test your changes**:
   ```bash
   npm run dev
   # Navigate to your new content and verify it works
   ```

5. **Lint your code**:
   ```bash
   npm run lint
   ```

6. **Commit with clear messages**:
   ```bash
   git add .
   git commit -m "Add lesson on channel patterns in concurrency module"
   ```

### Submitting Your PR

1. **Push to your fork**:
   ```bash
   git push origin add-channel-patterns-lesson
   ```

2. **Open a Pull Request** on GitHub with:
   - **Clear title**: "Add channel patterns lesson to concurrency module"
   - **Description**: Explain what you're adding and why
   - **Related issues**: Link any related issue numbers
   - **Screenshots**: If relevant, show the new content in the app

3. **Respond to feedback**: Maintainers may request changes

### PR Title Conventions

- `Add: [What you're adding]` - e.g., "Add: Worker pool pattern lesson"
- `Fix: [What you're fixing]` - e.g., "Fix: Typo in goroutines lesson"
- `Update: [What you're updating]` - e.g., "Update: Improve channel examples"
- `Docs: [Documentation changes]` - e.g., "Docs: Add contribution guidelines"

## ✅ Content Quality Checklist

Before submitting, ensure:

- [ ] All code examples compile and run correctly
- [ ] TypeScript comparisons are accurate where included
- [ ] Lessons are well-structured with clear sections
- [ ] Challenges have clear objectives and helpful hints
- [ ] No typos or grammatical errors
- [ ] Code follows Go best practices
- [ ] Examples are practical and relevant
- [ ] Content is beginner-friendly but accurate
- [ ] All links work correctly
- [ ] Images/diagrams have alt text if included

## 🐛 Reporting Issues

Found a bug or have a suggestion?

1. **Search existing issues** first to avoid duplicates
2. **Use issue templates** when available
3. **Be specific**: Include steps to reproduce, expected vs actual behavior
4. **Add context**: Browser version, OS, screenshots if relevant

## 💡 Content Ideas & Roadmap

### Needed Lessons

- **Basics**: More examples of structs, methods, interfaces
- **Concurrency**: Worker pools, pipelines, context package
- **Testing**: Mocking, test fixtures, integration tests
- **Web Services**: gRPC, WebSockets, authentication
- **Packages**: Popular libraries (sqlx, cobra, viper, etc.)
- **Production**: CI/CD, monitoring, containerization

### Needed Challenges

- More hard-level challenges across all modules
- Real-world scenario challenges (e.g., build a mini REST API)
- Performance optimization challenges
- Debugging challenges (fix broken code)

## 🤝 Community Guidelines

- **Be respectful**: We welcome contributors of all skill levels
- **Be constructive**: Provide helpful feedback
- **Be patient**: Maintainers are volunteers
- **Be collaborative**: Work together to improve content
- **Ask questions**: No question is too basic

## 📞 Getting Help

- **Questions about contributing?** Open an issue with the `question` label
- **Need clarification?** Comment on an existing issue or PR
- **Want to discuss a big change?** Open an issue first before investing time

## 🙏 Recognition

All contributors will be recognized in the project! Significant contributions may be highlighted in release notes.

---

**Thank you for helping make Go education accessible to everyone!** 🚀

Every lesson, every challenge, every fix makes a difference. Happy contributing!
