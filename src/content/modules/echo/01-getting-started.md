# Echo: Getting Started

Echo is a high-performance, minimalist web framework for Go. It emphasises a clean API, zero dynamic allocations on the hot path, and extensive built-in middleware.

## Why Echo?

| Feature | Express.js | Echo |
|---------|-----------|------|
| Routing | `express.Router()` | `echo.New()` |
| Context | `(req, res)` pair | Single `echo.Context` |
| Middleware | `app.use()` | `e.Use()` |
| Error handling | `next(err)` | Return `error` from handler |
| HTTP/2 | Third-party | Built-in |

The most striking difference from Gin is Echo's **error-return** convention: handlers return `error` instead of writing to the context directly for errors. This aligns with Go's idiomatic error-handling style.

## Installation

```bash
go mod init myapp
go get github.com/labstack/echo/v4
```

## First Server

```go
package main

import (
    "net/http"
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

func main() {
    e := echo.New()

    // Attach global middleware
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())

    e.GET("/hello", func(c echo.Context) error {
        return c.String(http.StatusOK, "Hello, Echo!")
    })

    e.Start(":1323")
}
```

## HTTP Methods

```go
e.GET("/users",        getUsers)
e.POST("/users",       createUser)
e.PUT("/users/:id",    updateUser)
e.DELETE("/users/:id", deleteUser)
e.PATCH("/users/:id",  patchUser)
e.Any("/webhook",      handleWebhook)  // all methods
```

## The `echo.Context` Interface

`echo.Context` wraps request + response and provides helpers:

```go
func handler(c echo.Context) error {
    // Request info
    method := c.Request().Method
    path   := c.Path()

    // Path parameters
    id := c.Param("id")

    // Query parameters
    q    := c.QueryParam("q")
    page := c.QueryParam("page")

    // Response
    return c.JSON(http.StatusOK, map[string]string{
        "method": method,
        "id":     id,
        "q":      q,
    })
}
```

## Path Parameters

```go
// Single param: /users/42
e.GET("/users/:id", func(c echo.Context) error {
    id := c.Param("id")
    return c.JSON(200, echo.Map{"id": id})
})

// Multiple params: /posts/5/comments/10
e.GET("/posts/:postID/comments/:commentID", func(c echo.Context) error {
    postID    := c.Param("postID")
    commentID := c.Param("commentID")
    return c.JSON(200, echo.Map{"post": postID, "comment": commentID})
})
```

`echo.Map` is a `map[string]any` shorthand (like Gin's `gin.H`).

## Query Parameters

```go
// GET /search?q=golang&limit=10
e.GET("/search", func(c echo.Context) error {
    q     := c.QueryParam("q")
    limit := c.QueryParam("limit")
    if limit == "" { limit = "20" }
    return c.JSON(200, echo.Map{"q": q, "limit": limit})
})
```

## Returning Errors

Echo handlers return `error`. Echo converts the returned error into an HTTP response automatically:

```go
func getUser(c echo.Context) error {
    id := c.Param("id")
    user, err := db.FindUser(id)
    if err != nil {
        // echo.HTTPError becomes a JSON error response
        return echo.NewHTTPError(http.StatusNotFound, "user not found")
    }
    return c.JSON(http.StatusOK, user)
}
```

`echo.NewHTTPError(code, message)` produces `{"message": "user not found"}` with the given status code.

## Customising the Error Handler

```go
e.HTTPErrorHandler = func(err error, c echo.Context) {
    code := http.StatusInternalServerError
    msg  := "internal server error"

    if he, ok := err.(*echo.HTTPError); ok {
        code = he.Code
        msg  = fmt.Sprintf("%v", he.Message)
    }

    c.JSON(code, echo.Map{"error": msg})
}
```

## Named Routes and URL Generation

```go
e.GET("/users/:id", getUser).Name = "getUser"

// Generate URL from name and params
url := e.Reverse("getUser", "42") // → "/users/42"
```

## TypeScript Comparison

```typescript
// Express
app.get('/users/:id', async (req, res) => {
    try {
        const user = await db.findUser(req.params.id)
        if (!user) return res.status(404).json({ error: 'not found' })
        res.json(user)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})
```

```go
// Echo — errors are returned, not thrown
func getUser(c echo.Context) error {
    user, err := db.FindUser(c.Param("id"))
    if err != nil {
        return echo.NewHTTPError(404, "not found")
    }
    return c.JSON(200, user)
}
```

The `return error` pattern eliminates the need for try/catch and makes the error path explicit at the type level.
