# Chi: Advanced Routing

## Route Groups & Sub-routers

Groups share a URL prefix and a middleware stack. They are the building block for large, well-organised APIs.

```go
r := chi.NewRouter()
r.Use(middleware.Logger)

// /api/* — authenticated routes
r.Route("/api", func(r chi.Router) {
    r.Use(AuthMiddleware)

    r.Route("/users", func(r chi.Router) {
        r.Get("/",      listUsers)
        r.Post("/",     createUser)
        r.Get("/{id}",  getUser)
        r.Put("/{id}",  updateUser)
        r.Delete("/{id}", deleteUser)
    })

    r.Route("/posts", func(r chi.Router) {
        r.Get("/",  listPosts)
        r.Post("/", createPost)
    })
})

// /health — no auth required
r.Get("/health", healthCheck)
```

### Mount (Sub-router)

`Mount` attaches a **separate** router as a sub-tree, useful for composing independent modules:

```go
// users module
usersRouter := chi.NewRouter()
usersRouter.Get("/",     listUsers)
usersRouter.Post("/",    createUser)
usersRouter.Get("/{id}", getUser)

// main router
r := chi.NewRouter()
r.Mount("/api/users", usersRouter)
```

`Mount` is different from `Route`: `Route` defines routes inline, `Mount` attaches an already-built router.

## URL Parameter Patterns

### Named Parameters

```go
r.Get("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    // ...
})
```

### Regex-Constrained Parameters

```go
// Only match numeric IDs
r.Get("/users/{id:[0-9]+}", handler)

// Match slug (letters, numbers, hyphens)
r.Get("/posts/{slug:[a-z0-9-]+}", handler)
```

### Wildcard Routes

```go
// /files/images/2024/photo.jpg
r.Get("/files/*", func(w http.ResponseWriter, r *http.Request) {
    // chi.URLParam(r, "*") returns the matched portion after /files/
    filePath := chi.URLParam(r, "*")
    http.ServeFile(w, r, "./storage/"+filePath)
})
```

### Catch-all (404 fallback)

```go
r.NotFound(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(404)
    json.NewEncoder(w).Encode(map[string]string{"error": "not found"})
})

r.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(405)
    json.NewEncoder(w).Encode(map[string]string{"error": "method not allowed"})
})
```

## URL Parameter Helpers

Access multiple params at once:

```go
r.Get("/orgs/{orgID}/repos/{repoID}/issues/{issueID}", func(w http.ResponseWriter, r *http.Request) {
    params := chi.RouteContext(r.Context()).URLParams
    // params.Keys: ["orgID", "repoID", "issueID"]
    // params.Values: ["acme", "api", "42"]

    orgID   := chi.URLParam(r, "orgID")
    repoID  := chi.URLParam(r, "repoID")
    issueID := chi.URLParam(r, "issueID")

    json.NewEncoder(w).Encode(map[string]string{
        "org":   orgID,
        "repo":  repoID,
        "issue": issueID,
    })
})
```

## Inline Middleware on a Route

```go
// Apply multiple middleware to a single route without a group
r.With(
    middleware.Timeout(5*time.Second),
    RateLimiter(10),
).Get("/expensive", expensiveHandler)
```

## Route Inspection (Debugging)

Walk all registered routes:

```go
chi.Walk(r, func(method, route string, handler http.Handler, middlewares ...func(http.Handler) http.Handler) error {
    fmt.Printf("[%s] %s — %d middleware\n", method, route, len(middlewares))
    return nil
})
```

## Serving a Single-Page Application

```go
r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
    http.ServeFile(w, r, "./dist/index.html")
})
```

## TypeScript Comparison

```typescript
// Express nested routers
const usersRouter = express.Router()
usersRouter.get('/', listUsers)
usersRouter.post('/', createUser)
app.use('/api/users', usersRouter)
```

```go
// Chi sub-router
usersRouter := chi.NewRouter()
usersRouter.Get("/", listUsers)
usersRouter.Post("/", createUser)
r.Mount("/api/users", usersRouter)
```

The pattern is almost identical — Chi's `Mount` corresponds directly to Express's `app.use(path, router)`.
