# Conformance cases

These JSON files are the portable test suite. Every System One client, in any language, runs the same files.

A case has:

| Field | Meaning |
| --- | --- |
| `id` | Stable name. |
| `description` | What behavior the case locks. |
| `request` | Body of `POST /v1/systemone`. |
| `response.status` | HTTP status the fixture stands in for. |
| `response.body` | Body a conforming parser must accept. |
| `assert` | Dot paths and values the parser must surface. |

Unknown response fields are part of the fixture on purpose. A parser that rejects `latency_ms` does not conform.

A client test should load every file in `cases/`, check that it can build `request`, and check that reading `response.body` yields each `assert` entry. It must not call a live server. Live calls belong in `*.e2e.test.ts` and are not part of this suite.

Add a case in the same pull request as any change to required fields or answer meaning.
