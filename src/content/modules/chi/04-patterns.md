# Chi: Patterns & Testing

## RESTful Resource Pattern

A clean pattern for organising CRUD operations around a resource:

```go
// userResource implements the http.Handler methods for /users
type userResource struct {
    repo UserRepository
}

func (ur userResource) Routes() chi.Router {
    r := chi.NewRouter()
    r.Get("/",      ur.List)
    r.Post("/",     ur.Create)
    r.Route("/{id}", func(r chi.Router) {
        r.Use(ur.UserCtx)        // load user into context
        r.Get("/",    ur.Get)
        r.Put("/",    ur.Update)
        r.Delete("/", ur.Delete)
    })
    return r
}

func (ur userResource) UserCtx(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        id := chi.URLParam(r, "id")
        user, err := ur.repo.Find(id)
        if err != nil {
            http.Error(w, "not found", 404)
            return
        }
        ctx := context.WithValue(r.Context(), "user", user)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

func (ur userResource) Get(w http.ResponseWriter, r *http.Request) {
    user := r.Context().Value("user").(*User)
    json.NewEncoder(w).Encode(user)
}

// Wire up
r.Mount("/users", userResource{repo: db}.Routes())
```

This keeps route definitions, middleware, and handlers for a resource in one struct — highly testable and cohesive.

## Middleware Composition Patterns

### Conditional Middleware

```go
func ConditionalMiddleware(predicate func(*http.Request) bool, mw func(http.Handler) http.Handler) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if predicate(r) {
                mw(next).ServeHTTP(w, r)
            } else {
                next.ServeHTTP(w, r)
            }
        })
    }
}

// Skip auth for OPTIONS requests (CORS preflight)
r.Use(ConditionalMiddleware(
    func(r *http.Request) bool { return r.Method != http.MethodOptions },
    JWTAuth("secret"),
))
```

### Response Wrapper (capture status code)

```go
type responseWriter struct {
    http.ResponseWriter
    status int
}

func (rw *responseWriter) WriteHeader(status int) {
    rw.status = status
    rw.ResponseWriter.WriteHeader(status)
}

func AuditLog(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        rw := &responseWriter{w, http.StatusOK}
        next.ServeHTTP(rw, r)
        log.Printf("AUDIT: %s %s → %d", r.Method, r.URL.Path, rw.status)
    })
}
```

## Error Handling Pattern

```go
type HandlerFunc func(w http.ResponseWriter, r *http.Request) error

func (h HandlerFunc) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    if err := h(w, r); err != nil {
        // centralised error handling
        var appErr *AppError
        if errors.As(err, &appErr) {
            writeJSON(w, appErr.Code, map[string]string{"error": appErr.Message})
        } else {
            writeJSON(w, 500, map[string]string{"error": "internal server error"})
        }
    }
}

// Use like a normal handler
r.Get("/users/{id}", HandlerFunc(getUser))
```

This pattern eliminates repetitive `if err != nil { http.Error(...); return }` blocks.

## Testing Chi Routes

Because Chi handlers are standard `http.Handler`, testing is straightforward:

```go
func TestGetUser(t *testing.T) {
    r := chi.NewRouter()
    r.Get("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
        id := chi.URLParam(r, "id")
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{"id": id})
    })

    req  := httptest.NewRequest("GET", "/users/42", nil)
    rec  := httptest.NewRecorder()
    r.ServeHTTP(rec, req)

    if rec.Code != 200 {
        t.Errorf("status = %d, want 200", rec.Code)
    }

    var body map[string]string
    json.NewDecoder(rec.Body).Decode(&body)
    if body["id"] != "42" {
        t.Errorf("id = %q, want \"42\"", body["id"])
    }
}
```

## Choosing the Right Framework

| Criterion | Gin | Echo | Fiber | Chi |
|-----------|-----|------|-------|-----|
| net/http compat | Adapter | Adapter | ❌ | ✅ Native |
| Binding / Validation | Built-in | Plug-in | Plug-in | Manual |
| Error handling | Manual | Return error | Return error | Manual |
| Ecosystem | Large | Large | Growing | All net/http libs |
| Learning curve | Low | Low | Lowest (Express) | Very low |
| Best for | General APIs | Return-style | Express migrants | Stdlib fans |

Chi is ideal when you value standard library compatibility above all else, or when you need to integrate with an existing `net/http` codebase.

## Summary

- Use `r.Route` for inline sub-trees and `r.Mount` for independently-defined sub-routers
- Use `r.With(...)` to apply per-route middleware without creating a group
- Implement `userResource.Routes()` pattern for cohesive REST resources
- Wrap `http.Handler` to capture status codes and implement error patterns
- Tests are plain `httptest` — no framework-specific test utilities required
