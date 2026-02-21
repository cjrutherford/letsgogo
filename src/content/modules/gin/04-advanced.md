# Gin: Advanced Patterns

## Router Groups

Groups let you share a URL prefix and middleware across related routes without repeating yourself:

```go
r := gin.Default()

// /api/v1/...
v1 := r.Group("/api/v1")
{
    v1.GET("/users",     listUsers)
    v1.POST("/users",    createUser)
    v1.GET("/users/:id", getUser)
}

// /api/v2/... with different auth
v2 := r.Group("/api/v2")
v2.Use(NewAuthMiddleware())
{
    v2.GET("/users", listUsersV2)
}
```

Groups can be nested:

```go
admin := r.Group("/admin")
admin.Use(AdminOnlyMiddleware())
{
    users := admin.Group("/users")
    users.GET("", listAllUsers)
    users.DELETE("/:id", deleteUser)
}
```

## Error Handling

### Custom Error Handler

Gin doesn't have a built-in global error handler, but you can centralise error responses by storing errors in the context and processing them in a final middleware:

```go
type AppError struct {
    Code    int    `json:"-"`
    Message string `json:"error"`
}

func (e *AppError) Error() string { return e.Message }

// Middleware that converts errors set via c.Error() into JSON responses
func ErrorHandlerMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()
        if len(c.Errors) > 0 {
            err := c.Errors.Last().Err
            if appErr, ok := err.(*AppError); ok {
                c.JSON(appErr.Code, appErr)
                return
            }
            c.JSON(500, gin.H{"error": "internal server error"})
        }
    }
}

func getUser(c *gin.Context) {
    user, err := fetchUser(c.Param("id"))
    if err != nil {
        c.Error(&AppError{Code: 404, Message: "user not found"})
        return
    }
    c.JSON(200, user)
}
```

## Rendering Responses

### JSON

```go
c.JSON(200, gin.H{"status": "ok"})
c.IndentedJSON(200, gin.H{"status": "ok"}) // pretty-printed
c.PureJSON(200, gin.H{"html": "<b>bold</b>"}) // no HTML escaping
```

### Plain text and HTML

```go
c.String(200, "Hello, %s!", name)
c.HTML(200, "index.html", gin.H{"Title": "Home"})
```

### Redirect

```go
c.Redirect(302, "/new-path")
c.Redirect(301, "https://example.com")
```

### File download

```go
c.File("./uploads/report.pdf")
c.FileAttachment("./uploads/report.pdf", "monthly-report.pdf")
```

### Streaming

```go
r.GET("/stream", func(c *gin.Context) {
    c.Stream(func(w io.Writer) bool {
        fmt.Fprintf(w, "data: %s\n\n", time.Now().String())
        time.Sleep(time.Second)
        return true // return false to stop
    })
})
```

## Testing Gin Routes

Gin integrates well with `net/http/httptest`:

```go
import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "github.com/gin-gonic/gin"
)

func TestPingRoute(t *testing.T) {
    gin.SetMode(gin.TestMode)

    r := gin.New()
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "pong"})
    })

    w := httptest.NewRecorder()
    req, _ := http.NewRequest("GET", "/ping", nil)
    r.ServeHTTP(w, req)

    if w.Code != 200 {
        t.Errorf("status = %d, want 200", w.Code)
    }

    var body map[string]string
    json.NewDecoder(w.Body).Decode(&body)
    if body["message"] != "pong" {
        t.Errorf("message = %q, want \"pong\"", body["message"])
    }
}
```

`gin.SetMode(gin.TestMode)` suppresses debug output. Always set it in tests.

## Context Storage

Pass data between middleware and handlers using `c.Set` / `c.Get`:

```go
// Middleware
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Set("userID", 42)
        c.Next()
    }
}

// Handler
func profile(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(401, gin.H{"error": "not authenticated"})
        return
    }
    c.JSON(200, gin.H{"user_id": userID})
}
```

For type-safe values, define typed getter helpers:

```go
func GetUserID(c *gin.Context) (int, bool) {
    v, exists := c.Get("userID")
    if !exists { return 0, false }
    id, ok := v.(int)
    return id, ok
}
```

## Server Configuration

```go
srv := &http.Server{
    Addr:         ":8080",
    Handler:      r,
    ReadTimeout:  10 * time.Second,
    WriteTimeout: 10 * time.Second,
    IdleTimeout:  60 * time.Second,
}

// Graceful shutdown
go func() {
    if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        log.Fatal(err)
    }
}()

quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit

ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
srv.Shutdown(ctx)
```

## Summary

- Use **router groups** to organise routes and apply scoped middleware
- Use `c.Set` / `c.Get` to pass data between middleware layers
- Use `c.Error()` + a final middleware for centralised error handling
- Always set `gin.TestMode` in tests and use `httptest.NewRecorder`
- Wrap `http.Server` around the Gin engine for production timeout configuration
