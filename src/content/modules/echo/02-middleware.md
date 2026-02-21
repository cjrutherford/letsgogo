# Echo: Middleware

Echo's middleware system is built around `echo.MiddlewareFunc`:

```go
type MiddlewareFunc func(HandlerFunc) HandlerFunc
```

A middleware wraps a `HandlerFunc` and returns a new `HandlerFunc`. This is different from Gin's `func(*gin.Context)` approach — Echo uses explicit function wrapping, which is composable without a global chain object.

## How Echo Middleware Works

```go
func MyMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        // Before the handler
        fmt.Println("before")
        err := next(c)   // call the next middleware/handler
        // After the handler
        fmt.Println("after")
        return err
    }
}
```

The return value is `error` — middleware can short-circuit the chain by returning an error without calling `next`.

## Attaching Middleware

### Global (all routes)

```go
e := echo.New()
e.Use(middleware.Logger())
e.Use(middleware.Recover())
e.Use(MyMiddleware)
```

### Group-level

```go
api := e.Group("/api")
api.Use(JWTAuthMiddleware)
api.GET("/profile", getProfile) // requires auth
e.GET("/health", healthCheck)   // does not
```

### Route-level

```go
e.GET("/admin", adminPage, AdminOnlyMiddleware, AuditLogMiddleware)
```

## Built-in Middleware

### Logger

```go
e.Use(middleware.Logger())

// Custom format
e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
    Format: "${time_rfc3339} ${method} ${uri} ${status} ${latency_human}\n",
}))
```

### Recover

Catches panics and returns a 500:

```go
e.Use(middleware.Recover())

// With custom handler
e.Use(middleware.RecoverWithConfig(middleware.RecoverConfig{
    StackSize: 1 << 10, // 1 KB
    LogErrorFunc: func(c echo.Context, err error, stack []byte) error {
        log.Printf("PANIC: %v\n%s", err, stack)
        return nil
    },
}))
```

### CORS

```go
e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
    AllowOrigins: []string{"https://example.com"},
    AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
    AllowHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization},
}))
```

### Rate Limiter

```go
e.Use(middleware.RateLimiter(
    middleware.NewRateLimiterMemoryStore(20), // 20 req/s
))
```

### Request ID

```go
e.Use(middleware.RequestID())

// Access the ID in a handler:
func handler(c echo.Context) error {
    id := c.Response().Header().Get(echo.HeaderXRequestID)
    return c.JSON(200, echo.Map{"request_id": id})
}
```

### Body Limit

Prevents oversized request bodies:

```go
e.Use(middleware.BodyLimit("2M")) // max 2 MB
```

### Gzip

```go
e.Use(middleware.Gzip())
```

### Secure Headers

```go
e.Use(middleware.Secure())
// Sets: X-XSS-Protection, X-Content-Type-Options, X-Frame-Options, etc.
```

## Writing Custom Middleware

### JWT Authentication

```go
func JWTAuth(secret string) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            header := c.Request().Header.Get("Authorization")
            if header == "" {
                return echo.ErrUnauthorized
            }
            // validate token…
            claims, err := parseJWT(strings.TrimPrefix(header, "Bearer "), secret)
            if err != nil {
                return echo.NewHTTPError(401, "invalid token")
            }
            c.Set("claims", claims)
            return next(c)
        }
    }
}

e.Use(JWTAuth("my-secret"))
```

### Request Timing

```go
func Timing() echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            start := time.Now()
            err   := next(c)
            c.Response().Header().Set("X-Response-Time",
                time.Since(start).String())
            return err
        }
    }
}
```

## Middleware Skipper

Most built-in middleware accepts a `Skipper` function to opt specific routes out:

```go
e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
    Skipper: func(c echo.Context) bool {
        // Skip logging for health check endpoint
        return c.Path() == "/health"
    },
}))
```

## TypeScript Comparison

```typescript
// Express middleware
app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => console.log(`${Date.now() - start}ms`))
    next()
})
```

```go
// Echo middleware
func Timing() echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            start := time.Now()
            err := next(c) // errors propagate naturally
            log.Printf("%v", time.Since(start))
            return err
        }
    }
}
```

Echo's functional wrapper style (function returning function) offers strong compile-time type safety — the compiler verifies the full middleware signature.
