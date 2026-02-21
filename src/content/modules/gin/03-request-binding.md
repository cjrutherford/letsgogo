# Gin: Request Binding & Validation

One of Gin's most powerful features is automatic request binding — deserializing request data (JSON body, form fields, query string, URI) directly into Go structs, with optional validation via struct tags.

## Binding Methods

| Method | Source | Error handling |
|--------|--------|----------------|
| `ShouldBindJSON` | JSON body | Returns error |
| `ShouldBindQuery` | Query string | Returns error |
| `ShouldBindUri` | URI params | Returns error |
| `ShouldBindForm` | Form / multipart | Returns error |
| `ShouldBindHeader` | Headers | Returns error |
| `ShouldBind` | Detects by Content-Type | Returns error |
| `BindJSON` | JSON body | Calls `c.AbortWithError(400)` on failure |

Prefer `ShouldBind*` variants — they return errors without aborting the chain, giving you control over the response format.

## JSON Binding

```go
type CreateUserRequest struct {
    Name  string `json:"name"  binding:"required"`
    Email string `json:"email" binding:"required,email"`
    Age   int    `json:"age"   binding:"gte=0,lte=150"`
}

func createUser(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    // req.Name, req.Email, req.Age are populated and validated
    c.JSON(201, gin.H{"user": req})
}
```

The `binding` tag uses the [go-playground/validator](https://github.com/go-playground/validator) library under the hood.

## Query String Binding

```go
type ListUsersQuery struct {
    Page  int    `form:"page"  binding:"min=1"`
    Limit int    `form:"limit" binding:"min=1,max=100"`
    Sort  string `form:"sort"`
}

func listUsers(c *gin.Context) {
    var q ListUsersQuery
    // Use default values before binding:
    q.Page  = 1
    q.Limit = 20
    if err := c.ShouldBindQuery(&q); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, gin.H{"page": q.Page, "limit": q.Limit})
}
```

## URI Binding

```go
type UserURI struct {
    ID uint `uri:"id" binding:"required"`
}

func getUser(c *gin.Context) {
    var uri UserURI
    if err := c.ShouldBindUri(&uri); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, gin.H{"id": uri.ID})
}

// Route: r.GET("/users/:id", getUser)
```

## Validation Tags

The `binding` tag supports all `go-playground/validator` rules:

```go
type Product struct {
    Name        string  `json:"name"        binding:"required,min=2,max=100"`
    Price       float64 `json:"price"       binding:"required,gt=0"`
    Category    string  `json:"category"    binding:"required,oneof=electronics books clothing"`
    Email       string  `json:"email"       binding:"omitempty,email"`
    URL         string  `json:"url"         binding:"omitempty,url"`
    PhoneNumber string  `json:"phone"       binding:"omitempty,e164"`
}
```

Common validators:
- `required` — field must be present and non-zero
- `min=N` / `max=N` — length (strings) or value (numbers)
- `gt=N` / `gte=N` / `lt=N` / `lte=N` — numeric comparisons
- `email` — valid email format
- `url` — valid URL
- `oneof=a b c` — must be one of the listed values
- `omitempty` — skip validation if field is empty

## Custom Validators

```go
import "github.com/go-playground/validator/v10"

func main() {
    r := gin.Default()

    // Register a custom validator
    if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
        v.RegisterValidation("isbn", func(fl validator.FieldLevel) bool {
            isbn := fl.Field().String()
            return len(isbn) == 13 && strings.HasPrefix(isbn, "978")
        })
    }
}

type Book struct {
    ISBN string `json:"isbn" binding:"required,isbn"`
}
```

## Returning Structured Errors

Instead of returning the raw validator error string, parse it for a cleaner API:

```go
import "github.com/go-playground/validator/v10"

func bindingError(err error) []gin.H {
    var ve validator.ValidationErrors
    if errors.As(err, &ve) {
        out := make([]gin.H, len(ve))
        for i, e := range ve {
            out[i] = gin.H{
                "field":   e.Field(),
                "message": e.Tag(),
            }
        }
        return out
    }
    return []gin.H{{"message": err.Error()}}
}

func createUser(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"errors": bindingError(err)})
        return
    }
    c.JSON(201, req)
}
```

## Reading Raw Body

```go
func rawHandler(c *gin.Context) {
    body, err := io.ReadAll(c.Request.Body)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.String(200, string(body))
}
```

## File Upload

```go
func uploadFile(c *gin.Context) {
    file, err := c.FormFile("avatar")
    if err != nil {
        c.JSON(400, gin.H{"error": "no file"})
        return
    }

    // Save to disk
    dst := filepath.Join("uploads", file.Filename)
    if err := c.SaveUploadedFile(file, dst); err != nil {
        c.JSON(500, gin.H{"error": "could not save file"})
        return
    }
    c.JSON(200, gin.H{"filename": file.Filename})
}

r.POST("/upload", uploadFile)
```

## TypeScript Comparison

```typescript
// Express + zod
const schema = z.object({ name: z.string(), email: z.string().email() })
app.post('/users', (req, res) => {
    const result = schema.safeParse(req.body)
    if (!result.success) return res.status(400).json(result.error)
    res.json(result.data)
})
```

```go
// Gin — validation is built-in via struct tags
type CreateUserReq struct {
    Name  string `json:"name"  binding:"required"`
    Email string `json:"email" binding:"required,email"`
}
func createUser(c *gin.Context) {
    var req CreateUserReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(201, req)
}
```

Go's approach is compile-time struct definitions with runtime validation — a different tradeoff from schema-library validation but very ergonomic.
