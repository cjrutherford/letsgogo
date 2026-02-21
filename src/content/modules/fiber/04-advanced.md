# Fiber: Advanced Patterns

## Route Groups

```go
app := fiber.New()

api := app.Group("/api")
api.Use(LoggerMiddleware)

v1 := api.Group("/v1")
v1.Get("/users", listUsers)
v1.Post("/users", createUser)

v2 := api.Group("/v2", NewAuthMiddleware())
v2.Get("/users", listUsersV2)
```

## Error Handling

### Built-in Error Types

Fiber provides `*fiber.Error` with status + message:

```go
return fiber.NewError(fiber.StatusNotFound, "user not found")
return fiber.ErrUnauthorized    // 401
return fiber.ErrForbidden       // 403
return fiber.ErrNotFound        // 404
```

### Global Error Handler

Configure via `fiber.Config`:

```go
app := fiber.New(fiber.Config{
    ErrorHandler: func(c *fiber.Ctx, err error) error {
        code := fiber.StatusInternalServerError
        msg  := "Internal Server Error"

        if e, ok := err.(*fiber.Error); ok {
            code = e.Code
            msg  = e.Message
        }

        return c.Status(code).JSON(fiber.Map{
            "error": msg,
            "path":  c.Path(),
        })
    },
})
```

## Hooks

Fiber provides lifecycle hooks. Unlike middleware, hooks run at specific application lifecycle events:

```go
// Before a request is processed
app.Hooks().OnRequest(func(c *fiber.Ctx) error {
    c.Locals("start", time.Now())
    return nil
})

// After the response is sent
app.Hooks().OnResponse(func(c *fiber.Ctx) error {
    start, _ := c.Locals("start").(time.Time)
    log.Printf("%s %s %d %v", c.Method(), c.Path(), c.Response().StatusCode(), time.Since(start))
    return nil
})
```

Other hooks: `OnShutdown`, `OnMount`, `OnFork`.

## Graceful Shutdown

```go
app := fiber.New()

go func() {
    if err := app.Listen(":3000"); err != nil {
        log.Fatal(err)
    }
}()

quit := make(chan os.Signal, 1)
signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
<-quit

if err := app.ShutdownWithTimeout(5 * time.Second); err != nil {
    log.Fatal(err)
}
```

## WebSocket

```go
import "github.com/gofiber/websocket/v2"

app.Use("/ws", func(c *fiber.Ctx) error {
    if websocket.IsWebSocketUpgrade(c) {
        return c.Next()
    }
    return fiber.ErrUpgradeRequired
})

app.Get("/ws/:id", websocket.New(func(c *websocket.Conn) {
    userID := c.Params("id")
    for {
        mt, msg, err := c.ReadMessage()
        if err != nil { break }
        c.WriteMessage(mt, append([]byte(userID+": "), msg...))
    }
}))
```

## Server-Sent Events

```go
app.Get("/events", func(c *fiber.Ctx) error {
    c.Set("Content-Type", "text/event-stream")
    c.Set("Cache-Control", "no-cache")
    c.Set("Transfer-Encoding", "chunked")

    c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {
        for i := 0; i < 5; i++ {
            fmt.Fprintf(w, "data: event %d\n\n", i)
            w.Flush()
            time.Sleep(time.Second)
        }
    })
    return nil
})
```

## Testing Fiber Apps

```go
func TestHelloRoute(t *testing.T) {
    app := fiber.New()
    app.Get("/hello", func(c *fiber.Ctx) error {
        return c.SendString("Hello!")
    })

    req := httptest.NewRequest("GET", "/hello", nil)
    resp, err := app.Test(req, -1) // -1 = no timeout
    if err != nil {
        t.Fatal(err)
    }
    if resp.StatusCode != 200 {
        t.Errorf("status = %d, want 200", resp.StatusCode)
    }
    body, _ := io.ReadAll(resp.Body)
    if string(body) != "Hello!" {
        t.Errorf("body = %q, want \"Hello!\"", string(body))
    }
}
```

`app.Test(req)` sends a request directly to the app without starting a real HTTP server — ideal for unit tests.

## Performance Tips

| Tip | Why |
|-----|-----|
| Don't store `*fiber.Ctx` | Context objects are pooled and reused |
| Copy params/body before goroutines | `c.Params("id")` returns a reference into pooled memory |
| Use `c.SendFile` for large files | Zero-copy sendfile syscall |
| Set `BodyLimit` | Prevent memory exhaustion |
| Use `compress` middleware | Transparent gzip without manual encoding |

## Summary

Fiber is the closest Go equivalent to Express.js, backed by the ultra-fast Fasthttp engine. Its pooling model gives exceptional performance but requires discipline about context lifetimes. For teams migrating from Node.js, it minimises the learning curve while delivering Go's concurrency model.
