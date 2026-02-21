# Fiber: Middleware

Fiber middleware has the same signature as a handler: `func(*fiber.Ctx) error`. It calls `c.Next()` to pass to the next handler.

## How Fiber Middleware Works

```go
func TimingMiddleware(c *fiber.Ctx) error {
    start := time.Now()
    err := c.Next()             // pass control downstream
    elapsed := time.Since(start)
    c.Set("X-Response-Time", elapsed.String())
    return err
}

app.Use(TimingMiddleware)
```

This is simpler than Gin's (no wrapper function) but achieves the same result. The key difference from Gin: middleware **returns** the error from `c.Next()` rather than the chain being managed by the engine.

## Attaching Middleware

### Global

```go
app.Use(middleware.Logger())
app.Use(middleware.Recover())
```

### Path-specific

```go
// Only applies to /api/* routes
app.Use("/api", JWTMiddleware)
```

### Route-level

```go
app.Get("/admin", AdminOnly, adminHandler)
```

## Built-in Middleware (`fiber/middleware`)

### Logger

```go
import "github.com/gofiber/fiber/v2/middleware/logger"

app.Use(logger.New())

// Custom format
app.Use(logger.New(logger.Config{
    Format:     "${time} ${method} ${path} ${status} ${latency}\n",
    TimeFormat: "15:04:05",
}))
```

### Recover

Catches panics:

```go
import "github.com/gofiber/fiber/v2/middleware/recover"

app.Use(recover.New())
```

### CORS

```go
import "github.com/gofiber/fiber/v2/middleware/cors"

app.Use(cors.New(cors.Config{
    AllowOrigins: "https://example.com, https://api.example.com",
    AllowMethods: "GET,POST,PUT,DELETE",
    AllowHeaders: "Content-Type, Authorization",
}))
```

### Rate Limiter

```go
import "github.com/gofiber/fiber/v2/middleware/limiter"

app.Use(limiter.New(limiter.Config{
    Max:        100,                // max requests
    Expiration: 1 * time.Minute,   // per window
    KeyGenerator: func(c *fiber.Ctx) string {
        return c.IP() // rate-limit per IP
    },
}))
```

### Compress

Automatically gzip/deflate responses:

```go
import "github.com/gofiber/fiber/v2/middleware/compress"

app.Use(compress.New(compress.Config{
    Level: compress.LevelBestSpeed,
}))
```

### Helmet

Sets security headers:

```go
import "github.com/gofiber/fiber/v2/middleware/helmet"

app.Use(helmet.New())
// Sets: X-XSS-Protection, X-Content-Type-Options, X-Frame-Options,
//        Strict-Transport-Security, etc.
```

### ETag

Automatic ETag generation for caching:

```go
import "github.com/gofiber/fiber/v2/middleware/etag"

app.Use(etag.New())
```

### Cache

```go
import "github.com/gofiber/fiber/v2/middleware/cache"

app.Use(cache.New(cache.Config{
    Expiration:   30 * time.Minute,
    CacheControl: true,
}))
```

## Writing Custom Middleware

### Request ID

```go
func RequestID() fiber.Handler {
    return func(c *fiber.Ctx) error {
        id := uuid.New().String()
        c.Locals("requestID", id)
        c.Set("X-Request-ID", id)
        return c.Next()
    }
}

// Retrieve in a handler
func handler(c *fiber.Ctx) error {
    id := c.Locals("requestID").(string)
    return c.JSON(fiber.Map{"id": id})
}
```

`c.Locals` is Fiber's key-value store for the request lifecycle (equivalent to Gin's `c.Set/Get` and Echo's `c.Set/Get`).

### JWT Authentication

```go
func JWTAuth(secret string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        header := c.Get("Authorization")
        if header == "" {
            return fiber.ErrUnauthorized
        }
        token := strings.TrimPrefix(header, "Bearer ")
        claims, err := parseJWT(token, secret)
        if err != nil {
            return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
        }
        c.Locals("userID", claims.UserID)
        return c.Next()
    }
}
```

### Conditional Skip

```go
func SkipForHealthCheck(middleware fiber.Handler) fiber.Handler {
    return func(c *fiber.Ctx) error {
        if c.Path() == "/health" {
            return c.Next()
        }
        return middleware(c)
    }
}
```

## TypeScript Comparison

```typescript
// Express middleware
app.use((req, res, next) => {
    req.startTime = Date.now()
    next()
})
```

```go
// Fiber middleware
app.Use(func(c *fiber.Ctx) error {
    c.Locals("startTime", time.Now())
    return c.Next()
})
```

Nearly identical structure — `next()` → `c.Next()`, `req.startTime` → `c.Locals("startTime", ...)`. Fiber was designed to make this migration as seamless as possible.
