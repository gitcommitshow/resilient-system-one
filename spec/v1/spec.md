# System One 1.0.0-draft

Status: draft. The machine-readable twin is [openapi.yaml](openapi.yaml).

System One is an HTTP API for decision models. The client sends state and a map of typed questions. The server returns one typed answer per question, including probabilities. The server does not write a reply and does not take an action. The caller decides what to do with the values.

This version follows the public wire format used by TypeSafe Jev and by servers that speak the same `POST /v1/systemone` contract, including Laya and Kev. It is an independent document. It is not published by those providers, and a provider's extra fields do not become part of this spec unless this document adopts them.

The words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are used as in RFC 2119.

## 1. Versions

The protocol version is the `version` field of `openapi.yaml` and the heading of this file. Client package versions are separate. A client declares the spec version it implements.

Breaking wire changes go in `spec/v2/` and leave this directory in place. Adding an optional response field is not a break. Removing a required field, renaming a field, or changing the meaning of `noul`, `choice`, or `score` is a break.

## 2. Client and server

A server accepts the requests in this document and returns the responses in this document.

A client sends only fields defined on the request, and ignores response fields it does not know. Ignoring unknown response fields is how a client keeps working when a server adds `latency_ms`, `routing`, or `action`.

A client MUST send `model`. A server MAY treat an unknown model id as its own default, and MAY echo a different id in the response. Callers that need reproducibility MUST record `response.model`, not the alias they sent.

## 3. Authentication

Both endpoints use `Authorization: Bearer <token>` when the server requires a credential.

| Status | Meaning |
| --- | --- |
| 401 | The credential is missing or rejected. |
| 413 | The request exceeds a limit the server documents. |
| 422 | The body failed validation. |
| 429 | The caller should slow down. The server SHOULD send `Retry-After`. |

A validation error body SHOULD be JSON. `detail` MAY be a string or a list of objects. Clients MUST treat every 422 as an invalid request, whatever the body looks like.

Error messages MUST NOT include the request state, the API key, or a raw upstream payload.

## 4. Evaluate

`POST /v1/systemone`

```json
{
  "state": "The parcel arrived opened and the invoice was charged twice.",
  "model": "example",
  "questions": {
    "team": {
      "type": "choice",
      "instructions": "Which team should handle this?",
      "criteria": {
        "shipping": "Lost, late, or damaged delivery",
        "billing": "Charges, invoices, refunds"
      }
    }
  }
}
```

### 4.1 `state`

`state` is a string, a JSON object, or a JSON array. Every question in the request refers to that same state. The server MUST NOT require the caller to repeat the state inside each question.

### 4.2 `questions`

`questions` is a JSON object with at least one entry. The caller chooses each key. The matching answer comes back under that same key.

The key is a correlation id. It is not question content. A server MUST NOT require a particular key spelling, and two calls that differ only by key names MUST be free to return the same answer values.

Questions are independent. A server MUST evaluate each question against `state` alone. An answer MUST NOT depend on the instructions or criteria of a sibling question.

### 4.3 `instructions`

`instructions` MAY be a string, an object, or an array. It tells the model what to decide. Objects are for a long question that needs named context. No field name inside the object is reserved.

`instructions` is optional in this draft. See open questions.

## 5. Question types

`type` is `noul`, `choice`, or `score`. The answer uses the same `type`.

### 5.1 `noul`

A yes/no question. The answer field `noul` is the probability that the answer is yes, from 0 to 1.

`criteria` is optional. When present, `criteria.true` describes a yes and `criteria.false` describes a no. Each description MAY be a string, an object, an array, or null.

```json
{
  "type": "noul",
  "instructions": "Does this need a same-day response?",
  "criteria": {
    "true": "A deadline today is stated",
    "false": "No time pressure is stated"
  }
}
```

### 5.2 `choice`

Pick one option the caller named. `criteria` is a map of option name to a description. The description MAY be a string, an object, an array, or null. Null means the option stands on its name.

A request MUST contain at least 1 option and MUST NOT contain more than 255. A server MUST accept any count in that range. Callers SHOULD send at least 2 options.

The answer MUST include:

| Field | Meaning |
| --- | --- |
| `choice` | The option name with the highest probability. It MUST be one of the criteria keys. |
| `probabilities` | One probability per criteria key. Each value is from 0 to 1. |
| `confidence` | A number from 0 to 1 derived from that distribution. |

The probabilities SHOULD sum to 1, with an absolute error of at most 0.001.

### 5.3 `score`

Place the state on an ordered rubric. `criteria` is an array of level descriptions, lowest first. A description MAY be a string, an object, or an array.

Level indexes start at 0.

A conforming server MUST accept 2 to 10 levels. A server MAY accept more than 10. A client that sends more than 10 is using an extension and MUST be prepared for 422.

The answer MUST include:

| Field | Meaning |
| --- | --- |
| `score` | The probability-weighted mean of the level indexes. |
| `legend` | Map of index strings (`"0"`, `"1"`, ...) to the level text. |
| `probabilities` | One probability per level index, keys as decimal strings. |
| `confidence` | A number from 0 to 1 derived from that distribution. |

`score` MUST be greater than or equal to 0 and MUST be less than or equal to the index of the last level.

## 6. Response

```json
{
  "model": "example-1.0.0",
  "answers": {
    "team": {
      "type": "choice",
      "choice": "billing",
      "confidence": 0.42,
      "probabilities": { "shipping": 0.31, "billing": 0.69 }
    }
  },
  "usage": { "input_tokens": 80, "output_tokens": 12 }
}
```

`answers` MUST contain every question id from the request and no others.

`usage.input_tokens` and `usage.output_tokens` MUST be integers greater than or equal to 0. This spec does not set a price for either number.

`confidence` on `choice` and `score` MUST be from 0 to 1. This draft does not require one formula. A server MUST document the formula it uses. A threshold tuned on one server MUST NOT be assumed valid on another.

A `noul` answer MAY include `confidence`. When it does, the same 0 to 1 range applies.

## 7. Models

`GET /v1/models` lists the model names this credential may send.

This draft defines the body as a JSON array of cards. Each card MUST have `name`. `description` and `release_date` are optional strings.

```json
[
  { "name": "example", "description": "Default alias", "release_date": "2026-10-02" }
]
```

Servers that wrap this list in an object are recorded in [registry/providers.yaml](../../registry/providers.yaml) until the open question below is closed.

## 8. Limits

Token capacity, option counts above the minimums, and language coverage are server limits. A server MUST document them. A server MUST reject an over-limit request with 413 or 422 rather than silently truncating, unless the server's own documentation says it truncates and where.

This draft does not require a minimum context length.

## 9. Extensions

These are allowed and are not required for conformance:

- Extra response fields (`latency_ms`, `routing`, `action`, and others).
- Extra routes such as `/v1/systemone/permute` or `/v1/systemone/separate`.
- Score rubrics longer than 10 levels.
- A server-specific default when `model` is an id the server does not host.

A client MUST keep working if it ignores those extras. A conformance case that includes an unknown response field must still parse.

## 10. Conformance

A server conforms when it accepts every request under `conformance/cases/` that is within its documented limits, and returns a body that matches this document.

A client conforms when it can send those requests and accept those responses, including responses that carry unknown fields.

Provider notes in `registry/providers.yaml` explain where a named server is narrower than this draft. Those notes do not change the draft.

## 11. Open questions

These are unresolved. Do not treat a deviation here as a broken server until the draft picks one.

1. `instructions` is required in some provider prose and optional in the published schema. This draft leaves it optional.
2. Some provider docs cap `score` at 10 levels. Some servers allow far more. This draft requires support for 2 to 10 and allows more as an extension.
3. `GET /v1/models` might be a bare array or an object with a `models` field. This draft uses a bare array.
4. `confidence` is not a single formula. The draft requires the range and leaves the formula to the server.
5. Whether `noul` answers must include `confidence`. This draft makes that field optional.
6. Whether a one-option `choice` is worth forbidding. The draft allows it and recommends at least two options.

## 12. References

The behavior above was written to match the public System One HTTP contract as described by provider documentation and by servers that implement `POST /v1/systemone`. Starting points:

- TypeSafe API reference: https://docs.typesafe.ai/api
- TypeSafe OpenAPI: https://api.typesafe.ai/openapi.json
