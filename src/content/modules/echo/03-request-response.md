# Echo: Request & Response

## Request Binding

Echo provides a `Bind` method on the context that automatically deserialises request data based on the `Content-Type` header. You can also target a specific source explicitly.

```go
type CreateUserRequest struct {
    Name  string `json:"name"  validate:"required"`
    Email string `json:"email" validate:"required,email"`
    Age   int    `json:"age"   validate:"gte=0"`
}

func createUser(c echo.Context) error {
    req := new(CreateUserRequest)
    if err := c.Bind(req); err != nil {
        return echo.NewHTTPError(400, err.Error())
    }
    // validate separately (see Custom Validator section)
    return c.JSON(201, req)
}
```

### Binding Sources

| Tag | Source |
|-----|--------|
| `json:"..."` | JSON body |
| `query:"..."` | Query string |
| `form:"..."` | Form / multipart |
| `param:"..."` | URL path param |
| `header:"..."` | HTTP header |

You can mix sources in one struct:

```go
type SearchRequest struct {
    UserID string `param:"id"`            // from /users/:id
    Q      string `query:"q"`             // from ?q=...
    Token  string `header:"Authorization"` // from Authorization header
}
```

## Custom Validator

Echo does not validate automatically — you wire in a validator:

```go
import "github.com/go-playground/validator/v10"

type CustomValidator struct {
    v *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
    return cv.v.Struct(i)
}

func main() {
    e := echo.New()
    e.Validator = &CustomValidator{v: validator.New()}
}
```

Then call `c.Validate(req)` after binding:

```go
func createUser(c echo.Context) error {
    req := new(CreateUserRequest)
    if err := c.Bind(req); err != nil {
        return echo.NewHTTPError(400, err.Error())
    }
    if err := c.Validate(req); err != nil {
        return echo.NewHTTPError(422, err.Error())
    }
    return c.JSON(201, req)
}
```

## Sending Responses

### JSON

```go
return c.JSON(200, echo.Map{"status": "ok"})
return c.JSONPretty(200, data, "  ") // indented
return c.JSONBlob(200, []byte(`{"key":"val"}`)) // pre-encoded bytes
```

### Plain Text and HTML

```go
return c.String(200, "Hello!")
return c.HTML(200, "<h1>Hello</h1>")
```

### Attachment / Download

```go
return c.Attachment("report.pdf", "monthly.pdf")
return c.Inline("image.png", "photo.png")
```

### No Content

```go
return c.NoContent(204)
```

### Redirect

```go
return c.Redirect(302, "/new-path")
```

## Setting Response Headers

```go
c.Response().Header().Set("X-Custom-Header", "value")
c.Response().Header().Set("Cache-Control", "no-store")
```

## Reading Cookies

```go
func readCookie(c echo.Context) error {
    cookie, err := c.Cookie("session")
    if err != nil {
        return echo.NewHTTPError(400, "missing cookie")
    }
    return c.String(200, cookie.Value)
}
```

## Writing Cookies

```go
func setCookie(c echo.Context) error {
    cookie := new(http.Cookie)
    cookie.Name     = "session"
    cookie.Value    = "abc123"
    cookie.Expires  = time.Now().Add(24 * time.Hour)
    cookie.HttpOnly = true
    cookie.Secure   = true
    c.SetCookie(cookie)
    return c.NoContent(204)
}
```

## File Upload

```go
func upload(c echo.Context) error {
    file, err := c.FormFile("file")
    if err != nil {
        return echo.NewHTTPError(400, "no file")
    }

    src, err := file.Open()
    if err != nil { return err }
    defer src.Close()

    dst, err := os.Create("uploads/" + file.Filename)
    if err != nil { return err }
    defer dst.Close()

    if _, err = io.Copy(dst, src); err != nil { return err }
    return c.JSON(201, echo.Map{"filename": file.Filename})
}
```

## Server-Sent Events (SSE)

```go
e.GET("/events", func(c echo.Context) error {
    c.Response().Header().Set("Content-Type", "text/event-stream")
    c.Response().Header().Set("Cache-Control", "no-cache")

    for i := 0; i < 5; i++ {
        fmt.Fprintf(c.Response(), "data: event %d\n\n", i)
        c.Response().Flush()
        time.Sleep(time.Second)
    }
    return nil
})
```

## Testing Echo Handlers

```go
func TestCreateUser(t *testing.T) {
    e := echo.New()

    body := `{"name":"Alice","email":"alice@example.com","age":25}`
    req  := httptest.NewRequest(http.MethodPost, "/users",
                strings.NewReader(body))
    req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
    rec  := httptest.NewRecorder()
    c    := e.NewContext(req, rec)

    if err := createUser(c); err != nil {
        t.Fatal(err)
    }
    if rec.Code != 201 {
        t.Errorf("status = %d, want 201", rec.Code)
    }
}
```

## TypeScript Comparison

```typescript
// Express
res.status(200).json({ status: 'ok' })
res.redirect(302, '/new')
```

```go
// Echo — return the response call
return c.JSON(200, echo.Map{"status": "ok"})
return c.Redirect(302, "/new")
```

The key insight: Echo handlers **return** the response call. This means errors are just another return value — no need to manage `res.headersSent` or forgetting to `return` after `res.json()`.
