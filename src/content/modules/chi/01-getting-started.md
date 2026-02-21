# Chi: Getting Started

Chi is a lightweight, idiomatic router for Go's `net/http` standard library. Unlike Gin, Echo, and Fiber, Chi adds **only** routing and middleware composition — it does not include any response helpers, binding utilities, or validation. Every handler is a plain `http.Handler`.

## Why Chi?

| Feature | Chi | Gin / Echo / Fiber |
|---------|-----|-------------------|
| Base | `net/http` compatible | Custom context |
| Handler type | `http.HandlerFunc` | Framework-specific |
| Dependencies | Minimal | Larger ecosystem |
| Learning curve | Very low | Low–medium |
| Middleware ecosystem | Any `net/http` middleware | Framework-specific |

Chi's biggest advantage: because it speaks standard `http.Handler`, **any** `net/http` middleware from the entire Go ecosystem works out of the box — no adapters needed.

## Installation

```bash
go mod init myapp
go get github.com/go-chi/chi/v5
```

## First Server

```go
package main

import (
    "encoding/json"
    "net/http"
    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func main() {
    r := chi.NewRouter()

    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)

    r.Get("/hello", func(w http.ResponseWriter, r *http.Request) {
        json.NewEncoder(w).Encode(map[string]string{"message": "hello"})
    })

    http.ListenAndServe(":3000", r)
}
```

Because Chi returns an `http.Handler`, you pass it directly to `http.ListenAndServe` — no framework-specific server call.

## HTTP Methods

```go
r.Get("/users",        listUsers)
r.Post("/users",       createUser)
r.Put("/users/{id}",   updateUser)
r.Delete("/users/{id}", deleteUser)
r.Patch("/users/{id}", patchUser)
r.Head("/users",       headUsers)
r.Options("/users",    optionsUsers)
```

Note: Chi uses `{param}` syntax (curly braces) for path parameters, not `:param`.

## URL Parameters

```go
r.Get("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    json.NewEncoder(w).Encode(map[string]string{"id": id})
})
```

`chi.URLParam(r, key)` extracts the value from the chi-populated context.

## Query Parameters

Chi doesn't add any query helpers — use the standard library:

```go
r.Get("/search", func(w http.ResponseWriter, r *http.Request) {
    q     := r.URL.Query().Get("q")
    page  := r.URL.Query().Get("page")
    if page == "" { page = "1" }

    json.NewEncoder(w).Encode(map[string]string{
        "q": q, "page": page,
    })
})
```

## Writing Responses

Chi handlers write responses directly to `http.ResponseWriter`:

```go
func writeJSON(w http.ResponseWriter, status int, v any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(v)
}

r.Post("/users", func(w http.ResponseWriter, r *http.Request) {
    // decode request body
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        writeJSON(w, 400, map[string]string{"error": err.Error()})
        return
    }
    writeJSON(w, 201, user)
})
```

Because there are no response helpers, teams typically create their own small utility functions (or use a package like `render` from chi's companion library).

## chi/render

The `chi/render` package provides response helpers:

```go
import "github.com/go-chi/render"

r.Get("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
    user := fetchUser(chi.URLParam(r, "id"))
    render.JSON(w, r, user)
})

r.Post("/users", func(w http.ResponseWriter, r *http.Request) {
    var user User
    if err := render.Bind(r, &user); err != nil {
        render.Status(r, 400)
        render.JSON(w, r, map[string]string{"error": err.Error()})
        return
    }
    render.Status(r, 201)
    render.JSON(w, r, user)
})
```

## TypeScript Comparison

```typescript
// Express
app.get('/users/:id', (req, res) => {
    res.json({ id: req.params.id })
})
```

```go
// Chi — standard library types
r.Get("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    json.NewEncoder(w).Encode(map[string]string{"id": id})
})
```

Chi requires more boilerplate per handler than Express or Gin, but the handlers are pure Go standard library — easier to understand, test, and compose.
