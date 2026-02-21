# Chi: Middleware

Because Chi is built on standard `net/http`, its middleware type is:

```go
type Middleware func(http.Handler) http.Handler
```

This is the same interface used by every `net/http`-compatible middleware library in the Go ecosystem — no adapters needed.

## How Chi Middleware Works

```go
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)   // call the next handler
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}
```

The pattern is: wrap `http.Handler` in a new `http.HandlerFunc`. Call `next.ServeHTTP` to continue the chain.

## Attaching Middleware

### Global

```go
r := chi.NewRouter()
r.Use(middleware.Logger)
r.Use(middleware.Recoverer)
r.Use(LoggingMiddleware)
```

### Inline (route-specific)

```go
r.With(AuthMiddleware).Get("/profile", getProfile)
r.With(RateLimiter, AdminOnly).Delete("/users/{id}", deleteUser)
```

`r.With(...)` creates an inline middleware stack for a single route without creating a named group.

## Built-in Middleware (`chi/middleware`)

### Logger

```go
r.Use(middleware.Logger)
```

Logs: `GET /users 200 1.23ms`.

### Recoverer

Catches panics:

```go
r.Use(middleware.Recoverer)
```

### RequestID

Generates or propagates a unique request ID:

```go
r.Use(middleware.RequestID)

func handler(w http.ResponseWriter, r *http.Request) {
    id := middleware.GetReqID(r.Context())
    w.Header().Set("X-Request-ID", id)
}
```

### RealIP

Extracts client IP from `X-Forwarded-For` / `X-Real-IP`:

```go
r.Use(middleware.RealIP)
```

### Timeout

Applies a request deadline:

```go
r.Use(middleware.Timeout(60 * time.Second))
```

### StripSlashes

```go
r.Use(middleware.StripSlashes)
// /users/ → /users
```

### Redirect Slashes

```go
r.Use(middleware.RedirectSlashes)
// /users/ → 301 → /users
```

### Throttle

```go
r.Use(middleware.Throttle(100)) // max 100 in-flight requests
```

### Compress

```go
r.Use(middleware.Compress(5)) // gzip level 5
```

### NoCache

```go
r.Use(middleware.NoCache)
// Sets Cache-Control: no-cache
```

## Writing Custom Middleware

### Authentication

```go
func JWTAuth(secret string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            header := r.Header.Get("Authorization")
            if header == "" {
                http.Error(w, "Unauthorized", 401)
                return
            }
            claims, err := parseJWT(strings.TrimPrefix(header, "Bearer "), secret)
            if err != nil {
                http.Error(w, "Invalid token", 401)
                return
            }
            // Store in context
            ctx := context.WithValue(r.Context(), claimsKey{}, claims)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}
```

### Context Value Storage

Since Chi uses standard library context, pass values via `context.WithValue`:

```go
type contextKey string
const userIDKey contextKey = "userID"

func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        userID := authenticateRequest(r)
        ctx := context.WithValue(r.Context(), userIDKey, userID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

func getProfile(w http.ResponseWriter, r *http.Request) {
    userID, _ := r.Context().Value(userIDKey).(int)
    json.NewEncoder(w).Encode(map[string]int{"user_id": userID})
}
```

Always use unexported custom types as context keys to avoid collisions across packages.

## Using Third-Party `net/http` Middleware

Any middleware that accepts `func(http.Handler) http.Handler` works with Chi:

```go
import "github.com/rs/cors"

c := cors.New(cors.Options{
    AllowedOrigins:   []string{"https://example.com"},
    AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
    AllowCredentials: true,
})

r.Use(c.Handler) // cors middleware, not chi-specific
```

This portability is Chi's defining advantage.

## TypeScript Comparison

```typescript
// Express middleware
app.use((req, res, next) => {
    req.requestId = uuid()
    next()
})
```

```go
// Chi middleware — passes context via r.WithContext
func RequestIDMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ctx := context.WithValue(r.Context(), "requestID", uuid.New().String())
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

The chi idiom for passing data between middleware is `context.WithValue` + `r.WithContext`, while frameworks like Gin/Echo use their own context store (`c.Set`/`c.Locals`).
