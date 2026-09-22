# Keystorage API

Implementei um Key Storage baseado em MEMÓRIA como EXERCÍCIO. Não é APLICAÇÃO REAL.

Baseei-me no Redis, com os comandos SET, GET, e TTL.

## Tecnologias

- NodeJS

- Fastify
- Fastify Rate Limit

- Zod     (Validação de Dados)

## Routes

### SET KEY_VALUE

```bash
POST '/api/keys'

REQUEST BODY:
{
    key:          string
    value:        string | number | boolean
    expires_in:   miliseconds
}

RESPONSE BODY: 
{
    code: "KEY_VALUE_CREATED"
    element: 
    {
        key:          string
        value:        string | number | boolean
        created_at:   date
        expires_at:   date
        time_to_live: miliseconds
    }
    status: 201
}
```

### GET KEY_VALUE

```bash
GET '/api/keys/:key'

REQUEST BODY: {}

RESPONSE BODY:
{
    code: "GET_KEY_VALUE"
    element: 
    {
        key:          string
        value:        string | number | boolean
        created_at:   date
        expires_at:   date
        time_to_live: miliseconds
    }
    status: 200
}
```

### GET ALL KEY_VALUES

```bash
GET '/api/keys'

REQUEST BODY: {}

RESPONSE BODY:
{
    code: "GET_KEY_VALUES"
    elements:
    [
        {
            key:          string
            value:        string | number | boolean
            created_at:   date
            expires_at:   date
            time_to_live: miliseconds
        }
    ]
    status: 200
}
```

### DELETE KEY

```bash
DELETE '/api/keys/:key'

REQUEST BODY: {}

RESPONSE BODY: 
{
    code: "KEY_VALUE_DELETED"
    message: "Key Value Deleted Successfully!"
    status: 200
}
```

## Error Handlers

```bash
GLOBAL ERROR HANDLERS

# Not Found
{
    code:    "HANDLER_NOT_FOUND"
    message: "404 Not Found."
    status:   404
}

# Limit Requests Exceeded
{
    code:    "LIMIT_REQUESTS_EXCEEDED",
    message: "Too Many Requests.",
    wait:     seconds,
    status:   429
}

# Validation Error
{
    code:    "ZOD_ERROR"
    message: "Something Went Wrong."
    issues:   zod_message
    status:   400
}

# Application Running: /api
{
    code:    "APPLICATION_RUNNING"
    message: "Hello from Keystorage."
    status:   200
}
```