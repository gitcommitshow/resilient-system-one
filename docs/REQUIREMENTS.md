# Requirements

System One is an independent specification and a set of clients for decision models that speak `POST /v1/systemone`.

## In scope

- A versioned HTTP contract for `noul`, `choice`, and `score` questions.
- A language-neutral conformance suite.
- A registry of known servers and of clients that implement the spec.
- An official TypeScript client, `@system-one/sdk`.
- A documented path for community clients in other languages.

## Out of scope for this draft

- Hosting a model.
- Training, fine-tuning, or calibration.
- OpenAI's Decisions API, or any HTTP shape other than System One.
- A provider-specific adapter class per model. Servers share one request shape. The client takes a base URL, a key, and a model name.
- Hidden retries. Callers compose their own retry policy.

## Success

A program written against `@system-one/sdk` can change `baseUrl` and `model` and call Jev, Laya, Kev, or another server that conforms to `spec/v1`, without rewriting questions.
