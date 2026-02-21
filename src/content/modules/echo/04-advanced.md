# Echo: Advanced Patterns

## Route Groups

Groups share a prefix and optional middleware:

```go
e := echo.New()

// /api/v1/...
v1 := e.Group("/api/v1")
v1.Use(middleware.Logger())
v1.GET("/users", listUsers)
v1.POST("/users", createUser)

// /api/v2/... with JWT required
v2 := e.Group("/api/v2", JWTAuth("secret"))
v2.GET("/users", listUsersV2)
```

Nested groups:

```go
admin := e.Group("/admin", AdminMiddleware)
{
    users := admin.Group("/users")
    users.GET("", listAllUsers)
    users.DELETE("/:id", forceDeleteUser)
}
```

## Centralised Error Handling

Echo routes all unhandled errors through the `HTTPErrorHandler`. Override it for custom error shapes:

```go
type ErrorResponse struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
}

func customErrorHandler(err error, c echo.Context) {
    code := http.StatusInternalServerError
    msg  := "internal server error"

    if he, ok := err.(*echo.HTTPError); ok {
        code = he.Code
        if m, ok := he.Message.(string); ok {
            msg = m
        }
    }

    if !c.Response().Committed {
        c.JSON(code, ErrorResponse{Code: code, Message: msg})
    }
}

e.HTTPErrorHandler = customErrorHandler
```

## Rendering HTML Templates

Echo implements `echo.Renderer`:

```go
import "html/template"

type TemplateRegistry struct {
    templates *template.Template
}

func (t *TemplateRegistry) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
    return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
    e := echo.New()
    e.Renderer = &TemplateRegistry{
        templates: template.Must(template.ParseGlob("templates/*.html")),
    }
    e.GET("/", func(c echo.Context) error {
        return c.Render(200, "home.html", echo.Map{"title": "Home"})
    })
}
```

## Static Files

```go
e.Static("/static", "public")                // serves ./public/**
e.File("/favicon.ico", "public/favicon.ico") // single file
```

## HTTP/2 & HTTPS

Echo has built-in HTTP/2 and TLS support:

```go
e.StartTLS(":443", "cert.pem", "key.pem")
e.StartAutoTLS(":443") // Let's Encrypt via golang.org/x/crypto/acme/autocert
```

## WebSocket

```go
import "github.com/gorilla/websocket"

var upgrader = websocket.Upgrader{}

e.GET("/ws", func(c echo.Context) error {
    conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
    if err != nil { return err }
    defer conn.Close()

    for {
        mt, msg, err := conn.ReadMessage()
        if err != nil { break }
        conn.WriteMessage(mt, msg) // echo back
    }
    return nil
})
```

## Graceful Shutdown

```go
func main() {
    e := echo.New()
    e.GET("/", handler)

    go func() {
        if err := e.Start(":8080"); err != nil && err != http.ErrServerClosed {
            e.Logger.Fatal(err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    e.Shutdown(ctx)
}
```

## Context Extension

Store strongly-typed data in a custom context by embedding `echo.Context`:

```go
type AppContext struct {
    echo.Context
    UserID int
}

func AppContextMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        ac := &AppContext{c, 0}
        // authenticate and set ac.UserID...
        return next(ac)
    }
}

func handler(c echo.Context) error {
    ac := c.(*AppContext)
    return c.JSON(200, echo.Map{"user": ac.UserID})
}
```

## Summary

| Concept | Echo API |
|---------|----------|
| Groups | `e.Group(prefix, ...middleware)` |
| Error handling | `e.HTTPErrorHandler = fn` |
| Templates | Implement `echo.Renderer` |
| Static files | `e.Static(prefix, dir)` |
| TLS / HTTP2 | `e.StartTLS()` / `e.StartAutoTLS()` |
| Graceful shutdown | `e.Shutdown(ctx)` |

Echo's return-error style, built-in TLS/HTTP2, and automatic middleware composition make it an excellent choice for production APIs that need clean code organisation and high performance.
