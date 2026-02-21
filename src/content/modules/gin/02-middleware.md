# Gin: Middleware

Middleware in Gin is any function with the signature `func(*gin.Context)` that calls `c.Next()` to pass control downstream — or `c.Abort()` to stop the chain. This is conceptually identical to Express middleware but with Go's type system.

## How the Middleware Chain Works

```
Request → [Logger] → [Auth] → [Handler] → [Logger (post)] → Response
              ↑                                    ↓
           c.Next()                           code after c.Next()
```

Every `Use()`-registered function runs *before* the handler on the way in, and any code **after** `c.Next()` runs on the way out (like `defer` but for HTTP).

```go
func TimingMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()                               // execute the next handler
        elapsed := time.Since(start)
        log.Printf("%s %s took %v", c.Request.Method, c.Request.URL.Path, elapsed)
    }
}
```

## Global Middleware

Applied to every route on the engine:

```go
r := gin.New()
r.Use(gin.Logger())
r.Use(gin.Recovery())
r.Use(TimingMiddleware())
```

## Built-in Middleware

### Logger

Prints a colored log line for each request:

```
[GIN] 2024/01/15 - 09:32:01 | 200 |  312.456µs |  127.0.0.1 | GET  /ping
```

```go
r.Use(gin.Logger())

// Customise the log format:
r.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
    return fmt.Sprintf("[%s] %s %d %v\n",
        param.TimeStamp.Format(time.RFC3339),
        param.Method,
        param.StatusCode,
        param.Latency,
    )
}))
```

### Recovery

Catches any `panic` and returns a 500 response instead of crashing:

```go
r.Use(gin.Recovery())

// With custom handler:
r.Use(gin.RecoveryWithWriter(os.Stderr, func(c *gin.Context, err any) {
    c.JSON(500, gin.H{"error": "internal server error"})
}))
```

## Group Middleware

Middleware attached to a route group only affects routes in that group:

```go
api := r.Group("/api")
api.Use(AuthMiddleware())  // only /api/* routes require auth
{
    api.GET("/users", getUsers)
    api.POST("/users", createUser)
}

// Public routes are unaffected
r.GET("/health", healthCheck)
```

## Writing Custom Middleware

### Request ID

A common pattern: add a unique ID to every request and store it in the context.

```go
func RequestIDMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        id := uuid.New().String()
        c.Set("requestID", id)
        c.Header("X-Request-ID", id)
        c.Next()
    }
}

// Retrieve in a handler:
func handler(c *gin.Context) {
    id, _ := c.Get("requestID")
    c.JSON(200, gin.H{"request_id": id})
}
```

### Authentication Middleware

```go
func JWTAuthMiddleware(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.AbortWithStatusJSON(401, gin.H{"error": "missing token"})
            return
        }

        // validate token…
        claims, err := validateJWT(token, secret)
        if err != nil {
            c.AbortWithStatusJSON(401, gin.H{"error": "invalid token"})
            return
        }

        // Store claims in context for downstream handlers
        c.Set("userID", claims.UserID)
        c.Next()
    }
}
```

### CORS Middleware

```go
func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if c.Request.Method == http.MethodOptions {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    }
}
```

## Middleware Order Matters

```go
r := gin.New()
r.Use(RequestIDMiddleware()) // runs first
r.Use(gin.Logger())          // runs second (can log the request ID)
r.Use(gin.Recovery())        // runs third
```

Middleware executes in the order it is registered. Put `Recovery` after `Logger` so panics are caught after being logged.

## Aborting the Chain

```go
func IPWhitelistMiddleware(allowed []string) gin.HandlerFunc {
    allowedSet := make(map[string]bool)
    for _, ip := range allowed { allowedSet[ip] = true }

    return func(c *gin.Context) {
        ip := c.ClientIP()
        if !allowedSet[ip] {
            c.AbortWithStatusJSON(403, gin.H{"error": "forbidden"})
            return  // c.Abort() stops further handlers, return exits this function
        }
        c.Next()
    }
}
```

`c.Abort()` sets an internal flag; `return` exits the middleware function. You need **both** if you want to stop the chain and exit the function.

## TypeScript Comparison

```typescript
// Express
app.use((req, res, next) => {
    req.requestId = uuid()
    next()
})
```

```go
// Gin
r.Use(func(c *gin.Context) {
    c.Set("requestID", uuid.New().String())
    c.Next()
})
```

The pattern maps exactly: `next()` in Express = `c.Next()` in Gin. The main difference is that Gin middleware must call `c.Next()` or `c.Abort()` explicitly — there is no implicit `next()` call.
