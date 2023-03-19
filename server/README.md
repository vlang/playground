# V Playground Server

This is the server for the V Playground.

## Endpoints

### GET `/`

Returns the playground index page.

### POST `/run`

Run the code and return the output.
If an error occurs, the error will be returned in the `error` field.

Required form field:

- `code` — code to run

Additional form fields:

- `build_arguments` — build arguments when building binary
- `run_arguments` — run arguments when running binary
- `run_configuration` — run configuration type

#### Request

```curl
curl -X POST localhost:5555/run -F 'code="println(100)"'
```

#### Response

```json
{
  "output": "100",
  "error": ""
}
```

### POST `/run_test`

Run the code as a test and return the output.
If an error occurs, the error will be returned in the `error` field.

Required form field:

- `code` — code to test

Additional form fields:

- `build_arguments` — build arguments when building binary
- `run_arguments` — run arguments when running binary
- `run_configuration` — run configuration type

#### Request

```curl
curl -X POST localhost:5555/run_test -F 'code="fn test_foo() { assert 100 == 100 }"'
```

#### Response

```json
{
  "output": "---- Testing... <other output>",
  "error": ""
}
```

### POST `/cgen`

Retrieve the C code generated from the passed V code.
If an error occurs, the error will be returned in the `error` field.

Required form field:

- `code` — code to generate C code

Additional form fields:

- `build_arguments` — build arguments when building binary

#### Request

```curl
curl -X POST localhost:5555/cgen -F 'code="println(100)"'
```

#### Response

```json
{
  "cgenCode": "...",
  "error": ""
}
```

### POST `/format`

Format the code and return the formatted code.
If an error occurs, the error will be returned in the `error` field.

Required form field:

- `code` — code to format

#### Request

```curl
curl -X POST localhost:5555/format -F 'code="println(   100    )"'
```

#### Response

```json
{
  "output": "println(100)\n",
  "error": ""
}
```

### POST `/share`

Share the code and return the hash.
If an error occurs, the error will be returned in the `error` field.

Required form field:

- `code` — code to share

Additional form fields:

- `build_arguments` — build arguments when building binary
- `run_arguments` — run arguments when running binary
- `run_configuration` — run configuration type

#### Request

```curl
curl -X POST localhost:5555/share -F 'code="println(100)"'
```

#### Response

```json
{
  "hash": "21cf286fdb",
  "error": ""
}
```

### POST `/query`

Return the code for the given hash.
If code for the hash does not exist, `found` field will be false.
If an error occurs, the error will be returned in the `error` field.

Returns JSON contains `snippet` field which is the snippet for the hash.
Snippet structure is next:

```json
{
  "id": {
    "type": "integer",
    "description": "id of the snippet"
  },
  "code": {
    "type": "string",
    "description": "code of the snippet"
  },
  "hash": {
    "type": "string",
    "description": "hash of the snippet"
  },
  "build_arguments": {
    "type": "array",
    "description": "build arguments when building binary"
  },
  "run_arguments": {
    "type": "array",
    "description": "run arguments when running binary"
  },
  "run_configuration": {
    "type": "integer",
    "description": "run configuration type"
  },
  "additional": {
    "type": "object",
    "description": "additional data"
  }
}
```

Required form field:

- `hash` — hash of the code

#### Request

```curl
curl -X POST localhost:5555/query -F 'hash="21cf286fdb"'
```

#### Response

```json
{
  "snippet": {
    "id": 3,
    "code": "println(100)",
    "hash": "21cf286fdb",
    "buildArguments": [],
    "runArguments": [],
    "runConfiguration": 0,
    "additional": {}
  },
  "found": false,
  "error": ""
}
```
