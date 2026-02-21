# Fiber: Getting Started

Fiber is an Express-inspired web framework built on top of **Fasthttp** instead of Go's standard `net/http`. Fasthttp avoids allocations in the hot path by pooling byte slices and context objects, making Fiber one of the fastest HTTP frameworks in any language.

## Why Fiber?

| Feature | Express.js | Fiber |
|---------|-----------|-------|
| API feel | `(req, res)` | `*fiber.Ctx` |
| Performance | V8 + Node | Fasthttp (near bare-metal) |
| Middleware | `app.use()` | `app.Use()` |
| Static files | `express.static` | `app.Static()` |

Fiber is the best choice when you're coming directly from Express.js and want the most familiar API with Go's performance.

> **Important**: Because Fiber is built on Fasthttp, you **cannot** use standard `net/http` handlers or middleware with it directly. There are adapters available (`fiber/adaptor`) but native Fiber code is recommended.

## Installation

```bash
go mod init myapp
go get github.com/gofiber/fiber/v2
```

## First Server

```go
package main

import (
    "log"
    "github.com/gofiber/fiber/v2"
)

func main() {
    app := fiber.New()

    app.Get("/hello", func(c *fiber.Ctx) error {
        return c.SendString("Hello, Fiber!")
    })

    log.Fatal(app.Listen(":3000"))
}
```

## HTTP Methods

```go
app.Get("/users",        getUsers)
app.Post("/users",       createUser)
app.Put("/users/:id",    updateUser)
app.Delete("/users/:id", deleteUser)
app.Patch("/users/:id",  patchUser)
app.All("/webhook",      handleWebhook)  // all methods
```

## The `*fiber.Ctx` Object

`*fiber.Ctx` is your single interface to the request and response:

```go
func handler(c *fiber.Ctx) error {
    // Request
    method := c.Method()     // "GET"
    path   := c.Path()       // "/users/42"
    host   := c.Hostname()   // "localhost"
    ip     := c.IP()         // "127.0.0.1"

    // Response
    c.Status(200)
    c.Set("X-Custom", "value")
    return c.JSON(fiber.Map{"ok": true})
}
```

## Path Parameters

```go
app.Get("/users/:id", func(c *fiber.Ctx) error {
    id := c.Params("id")
    return c.JSON(fiber.Map{"id": id})
})

// Optional param (:name?)
app.Get("/greet/:name?", func(c *fiber.Ctx) error {
    name := c.Params("name", "World") // default value
    return c.SendString("Hello, " + name + "!")
})
```

## Query Parameters

```go
// GET /search?q=golang&page=2
app.Get("/search", func(c *fiber.Ctx) error {
    q    := c.Query("q")
    page := c.Query("page", "1") // default
    return c.JSON(fiber.Map{"q": q, "page": page})
})
```

## `fiber.Map`

Just like `gin.H` / `echo.Map`, `fiber.Map` is `map[string]any`:

```go
return c.JSON(fiber.Map{
    "status":  "ok",
    "message": "created",
})
```

## App Configuration

```go
app := fiber.New(fiber.Config{
    AppName:               "MyAPI v1.0",
    ReadTimeout:           5 * time.Second,
    WriteTimeout:          10 * time.Second,
    IdleTimeout:           60 * time.Second,
    BodyLimit:             4 * 1024 * 1024, // 4 MB
    DisableStartupMessage: false,
    ErrorHandler: func(c *fiber.Ctx, err error) error {
        code := fiber.StatusInternalServerError
        if e, ok := err.(*fiber.Error); ok {
            code = e.Code
        }
        return c.Status(code).JSON(fiber.Map{"error": err.Error()})
    },
})
```

## TypeScript / Express Comparison

```typescript
// Express
const app = express()
app.get('/hello', (req, res) => res.send('Hello'))
app.listen(3000)
```

```go
// Fiber — almost identical API
app := fiber.New()
app.Get("/hello", func(c *fiber.Ctx) error {
    return c.SendString("Hello")
})
app.Listen(":3000")
```

Fiber intentionally mirrors Express's API. `c.Params` = `req.params`, `c.Query` = `req.query`, `c.Body()` = `req.body`, `c.JSON` = `res.json`.

## Under the Hood: Why Fasthttp is Fast

Go's standard `net/http` allocates a new `http.Request` and `http.ResponseWriter` for every request. Fasthttp uses **object pools** — it reuses context objects across requests, dramatically reducing GC pressure under load.

This means you **must not** store `*fiber.Ctx` beyond the lifetime of the handler. For async operations, copy the values you need:

```go
app.Get("/async", func(c *fiber.Ctx) error {
    id := c.Params("id") // copy the value
    go func() {
        process(id) // safe: id is a string copy
    }()
    return c.SendString("processing")
})
```
