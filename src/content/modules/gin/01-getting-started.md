# Gin: Getting Started

Gin is the most widely-used HTTP web framework in Go. It wraps Go's `net/http` standard library with a fast router (based on httprouter), request-binding helpers, and middleware support — while staying close to the standard library's idioms.

## Why Gin?

| Feature | net/http (stdlib) | Gin |
|---------|------------------|-----|
| Routing | Manual mux | Pattern-based, path params |
| Middleware | Adapter pattern | `.Use()` chain |
| JSON response | `json.Marshal` + `w.Write` | `c.JSON(status, data)` |
| Request binding | Manual decode | `ShouldBindJSON`, `ShouldBindQuery` |
| Validation | Manual | Struct tags |

Coming from TypeScript/Express, Gin will feel familiar: you register handlers on a router and each handler receives a context object (`*gin.Context`) analogous to Express's `(req, res)` pair.

## Installation

```bash
go mod init myapp
go get github.com/gin-gonic/gin
```

## First Server

```go
package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func main() {
    // gin.Default() includes Logger + Recovery middleware
    r := gin.Default()

    r.GET("/ping", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "pong",
        })
    })

    // Listens on :8080 by default
    r.Run()
}
```

`gin.H` is just `map[string]any` — a convenience shorthand for building JSON objects inline.

### `gin.Default()` vs `gin.New()`

```go
// Default: Logger + Recovery middleware pre-attached
r := gin.Default()

// New: bare engine, attach middleware manually
r := gin.New()
r.Use(gin.Logger())
r.Use(gin.Recovery())
```

Use `gin.New()` in production when you want full control over which middleware runs.

## HTTP Methods

Gin exposes a method for every HTTP verb:

```go
r.GET("/users",        getUsers)
r.POST("/users",       createUser)
r.PUT("/users/:id",    updateUser)
r.DELETE("/users/:id", deleteUser)
r.PATCH("/users/:id",  patchUser)
r.HEAD("/healthz",     healthCheck)
r.OPTIONS("/users",    optionsUsers)
```

### Any Method

```go
r.Any("/webhook", handleWebhook) // matches all HTTP methods
```

## Path Parameters

Named segments start with `:`. Wildcard segments start with `*`.

```go
// Named: /users/42
r.GET("/users/:id", func(c *gin.Context) {
    id := c.Param("id")
    c.JSON(200, gin.H{"id": id})
})

// Wildcard: /files/images/avatar.png  → path = "images/avatar.png"
r.GET("/files/*path", func(c *gin.Context) {
    filePath := c.Param("path")
    c.String(200, "File: %s", filePath)
})
```

## Query Parameters

```go
// GET /search?q=golang&page=2
r.GET("/search", func(c *gin.Context) {
    q    := c.Query("q")
    page := c.DefaultQuery("page", "1") // default value
    c.JSON(200, gin.H{"q": q, "page": page})
})
```

## Handler Functions

Handlers can be regular named functions — you don't have to use inline closures:

```go
func getUser(c *gin.Context) {
    id := c.Param("id")
    // fetch from DB…
    c.JSON(200, gin.H{"id": id})
}

func main() {
    r := gin.Default()
    r.GET("/users/:id", getUser)
    r.Run(":8080")
}
```

## Multiple Handlers (Handler Chain)

A route can accept multiple handler functions. They are executed in order and you call `c.Next()` to pass control to the next one. This is how middleware is composed:

```go
func authGuard(c *gin.Context) {
    token := c.GetHeader("Authorization")
    if token == "" {
        c.AbortWithStatusJSON(401, gin.H{"error": "unauthorized"})
        return
    }
    c.Next() // proceed to the actual handler
}

func getProfile(c *gin.Context) {
    c.JSON(200, gin.H{"user": "alice"})
}

r.GET("/profile", authGuard, getProfile)
```

`c.Abort()` stops the chain — subsequent handlers and middleware are skipped.

## TypeScript Comparison

```typescript
// Express.js
app.get('/users/:id', (req, res) => {
    const { id } = req.params
    res.json({ id })
})
```

```go
// Gin
r.GET("/users/:id", func(c *gin.Context) {
    id := c.Param("id")
    c.JSON(200, gin.H{"id": id})
})
```

The key differences:
- **Static types** — Go's compiler catches type mismatches at compile time
- **No `res.send`/`res.json` ambiguity** — explicit `c.JSON`, `c.String`, `c.HTML`
- **Context carries everything** — request, response, params, and key-value store in one `*gin.Context`
