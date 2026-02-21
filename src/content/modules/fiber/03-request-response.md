# Fiber: Request & Response

## Parsing the Request Body

### JSON

```go
type CreateUserReq struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

app.Post("/users", func(c *fiber.Ctx) error {
    req := new(CreateUserReq)
    if err := c.BodyParser(req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    return c.Status(201).JSON(req)
})
```

`c.BodyParser` auto-detects the content type (`application/json`, `application/x-www-form-urlencoded`, `multipart/form-data`).

### Form Data

```go
type LoginForm struct {
    Username string `form:"username"`
    Password string `form:"password"`
}

app.Post("/login", func(c *fiber.Ctx) error {
    form := new(LoginForm)
    if err := c.BodyParser(form); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    return c.JSON(fiber.Map{"user": form.Username})
})
```

### Raw Body

```go
app.Post("/raw", func(c *fiber.Ctx) error {
    body := c.Body()           // []byte
    text := string(c.Body())   // string
    return c.SendString(text)
})
```

## Reading Request Data

### Headers

```go
contentType := c.Get("Content-Type")
auth        := c.Get("Authorization", "Bearer fallback") // default value
```

### Cookies

```go
session := c.Cookies("session")
```

### IP Address

```go
ip := c.IP()       // request client IP
ips := c.IPs()     // X-Forwarded-For IPs
```

## Sending Responses

### JSON

```go
return c.JSON(fiber.Map{"status": "ok"})
return c.Status(201).JSON(user)
```

### Text and HTML

```go
return c.SendString("Hello!")
return c.SendString("<h1>Hello</h1>")
return c.Type("html").SendString("<h1>Hello</h1>")
```

### Byte Slice

```go
return c.Send([]byte("raw bytes"))
```

### Status

```go
return c.SendStatus(fiber.StatusNoContent)  // 204 with standard message
return c.Status(202).SendString("accepted")
```

### Redirect

```go
return c.Redirect("/new-path")         // 302 by default
return c.Redirect("/moved", 301)       // 301 permanent
```

### Setting Headers

```go
c.Set("X-Powered-By", "Fiber")
c.Append("Link", "<https://example.com>; rel=preload")
c.Vary("Origin")
```

### Cookies

```go
c.Cookie(&fiber.Cookie{
    Name:     "session",
    Value:    "abc123",
    Expires:  time.Now().Add(24 * time.Hour),
    HTTPOnly: true,
    Secure:   true,
    SameSite: "Strict",
})
```

## File Serving

### Single File

```go
app.Get("/download", func(c *fiber.Ctx) error {
    return c.Download("./files/report.pdf", "monthly-report.pdf")
})
```

### Static Directory

```go
// Serve ./public/** at /static/**
app.Static("/static", "./public")

// With config
app.Static("/assets", "./dist", fiber.Static{
    Compress:  true,
    ByteRange: true,
    Browse:    false,
    Index:     "index.html",
    MaxAge:    3600,
})
```

## Multipart File Upload

```go
app.Post("/upload", func(c *fiber.Ctx) error {
    file, err := c.FormFile("avatar")
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "no file"})
    }

    // Save to disk
    if err := c.SaveFile(file, fmt.Sprintf("./uploads/%s", file.Filename)); err != nil {
        return err
    }
    return c.JSON(fiber.Map{"saved": file.Filename})
})
```

## Validation

Fiber doesn't have built-in validation — combine `BodyParser` with go-playground/validator:

```go
var validate = validator.New()

func Validate[T any](c *fiber.Ctx) (T, error) {
    var body T
    if err := c.BodyParser(&body); err != nil {
        return body, err
    }
    if err := validate.Struct(body); err != nil {
        return body, err
    }
    return body, nil
}

app.Post("/users", func(c *fiber.Ctx) error {
    type Req struct {
        Name  string `json:"name"  validate:"required"`
        Email string `json:"email" validate:"required,email"`
    }
    req, err := Validate[Req](c)
    if err != nil {
        return c.Status(422).JSON(fiber.Map{"error": err.Error()})
    }
    return c.Status(201).JSON(req)
})
```

## TypeScript Comparison

```typescript
// Express
app.post('/users', (req, res) => {
    const { name, email } = req.body
    res.status(201).json({ name, email })
})
```

```go
// Fiber
app.Post("/users", func(c *fiber.Ctx) error {
    var req struct { Name, Email string }
    if err := c.BodyParser(&req); err != nil { return err }
    return c.Status(201).JSON(req)
})
```

The method chaining style (`c.Status(201).JSON(...)`) mirrors Express's `res.status(201).json(...)` very closely.
