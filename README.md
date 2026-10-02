# System One

A System One model returns a judgment. You send one **state** (a ticket, a message, a document, or any JSON value) and a map of typed **questions**. You get one answer per question, with probabilities. Your program decides the next step: route, threshold, reply, or stop.

This repository is the independent spec for that exchange. The spec is the center. Clients and servers implement it.

Current document: [spec/v1/spec.md](spec/v1/spec.md) (`1.0.0-draft`). Apache-2.0. Not affiliated with the operators below.

## The idea

Every question sees the same state. Questions do not depend on each other. The key (`team`, `same_day`) only matches the answer. It is not question text.

| Type | You ask | You get |
| --- | --- | --- |
| `noul` | Is this true? | Probability from 0 to 1 that the answer is yes. |
| `choice` | Which named option fits? | The winner, a probability per option, and a confidence. |
| `score` | Where does this sit on your rubric? | A point on that scale, a probability per level, and a confidence. |

The same questions work on any server below. Change the host and the model name.

```json
{
  "state": "The card was charged twice. Please reverse one charge today.",
  "model": "example",
  "questions": {
    "team": {
      "type": "choice",
      "instructions": "Which team should handle this?",
      "criteria": {
        "billing": "Charges and refunds",
        "shipping": "Delivery problems"
      }
    }
  }
}
```

Rules, limits, and errors: [spec/v1/spec.md](spec/v1/spec.md).

## Why a separate spec

Jev, Laya, and Kev already speak `POST /v1/systemone`. Each provider's docs were the only contract, so clients guessed which fields were required and which were one server's extras (`latency_ms`, `routing`, `action`).

This repo is the shared contract. A provider field joins the standard only when the spec adopts it. Until then, clients ignore response fields they do not know.

OpenAI's [Decisions API](https://openai.com/index/devday-2026-recap) is the same kind of call: context in, a choice among answers you defined, a value your code can branch on. It is a limited preview with its own HTTP shape. This spec covers `POST /v1/systemone`.

## Models

These servers implement this draft. Limits and extra fields are notes in [registry/providers.yaml](registry/providers.yaml). Notes do not change the spec.

| Model | Operator | Endpoint | Default model |
| --- | --- | --- | --- |
| Jev | TypeSafe AI | `https://api.typesafe.ai` | `jev-latest` |
| Laya | Laya Studio | `https://api.laya.studio` | `english` |
| Kev | self-hosted | your host | `kev-latest` |

Jev is the origin of the wire format. Laya uses a shorter context and may add `routing` and `action`. Kev may add `latency_ms`, and its score rubrics may exceed 10 levels. Those extras are allowed. A client keeps working if it ignores them.

## Repository

| Path | Role |
| --- | --- |
| [spec/](spec/) | The standard. [spec.md](spec/v1/spec.md) wins over [openapi.yaml](spec/v1/openapi.yaml). |
| [conformance/](conformance/) | JSON cases every client must accept. |
| [registry/](registry/) | Known servers and known clients. |
| [packages/sdk](packages/sdk) | Official TypeScript client. Usage: [its README](packages/sdk/README.md). |
| [examples/node](examples/node) | Small local call. |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Review checklist for each kind of change. |

Other languages document themselves in their own repositories.

## Roadmap

`1.0.0-draft` is implementable now. Six decisions are still open in [spec §11](spec/v1/spec.md#11-open-questions). A server that differs on an open question is not broken until the draft picks an answer.

| | Work | How to pick it up |
| --- | --- | --- |
| [x] | Spec, OpenAPI, and changelog for `1.0.0-draft` | |
| [x] | Conformance cases for `noul`, `choice`, and `score` | |
| [x] | Jev, Laya, and Kev in the registry | Add the next host. See [Servers](#servers). |
| [ ] | Close the six open questions | One spec pull request per question. See [Spec](#spec). |
| [ ] | TypeScript client runs `conformance/cases/` | Tests in `packages/sdk`. No live network. |
| [ ] | Stable `1.0.0` | After the two rows above. |
| [ ] | Python SDK | [Open `sdk: python`](https://github.com/gitcommitshow/system-one/issues/new?template=sdk.yml). |
| [ ] | Go SDK | [Open `sdk: go`](https://github.com/gitcommitshow/system-one/issues/new?template=sdk.yml). |
| [ ] | Another language | [Open an SDK issue](https://github.com/gitcommitshow/system-one/issues/new?template=sdk.yml). |

`spec/v2/` starts only for a wire break. Hosting and training stay with the operators.

## Contribute

By submitting a change you agree it is licensed under Apache-2.0 ([LICENSE](LICENSE)).

### Spec

1. Edit [spec/v1/spec.md](spec/v1/spec.md) and [spec/v1/openapi.yaml](spec/v1/openapi.yaml) in the same pull request.
2. Add or update a case in [conformance/cases/](conformance/cases/).
3. Note the change in [spec/v1/changelog.md](spec/v1/changelog.md).
4. If `resilient-system-one` would misread the new contract, update `packages/sdk` in that same pull request.

A clarification stays in `spec/v1/`. A wire break starts `spec/v2/` and leaves v1 in the tree. A break is a removed field, a renamed field, or a new meaning for `noul`, `choice`, or `score`. An optional response field is not a break.

Good first spec work: pick one open question in [§11](spec/v1/spec.md#11-open-questions), propose one answer, and update the prose, the schema, and a conformance case together.

### Servers

A host that already speaks `POST /v1/systemone`: a pull request that edits [registry/providers.yaml](registry/providers.yaml) only. Describe limit and field differences in `notes`.

### TypeScript client

Bug fixes stay in [packages/sdk](packages/sdk). `npm test` must not call a live server. Behavior must keep accepting [conformance/cases/](conformance/cases/).

### A new language

1. [Open an issue](https://github.com/gitcommitshow/system-one/issues/new?template=sdk.yml) titled `sdk: <language>` (language, package name, maintainer, spec version). Wait for a maintainer to accept it.
2. Implement in your own repository against [openapi.yaml](spec/v1/openapi.yaml). Run [conformance/cases/](conformance/cases/). Ignore unknown response fields. Publish under Apache-2.0, and state the spec version. Document the client there.
3. Open a pull request here that edits [registry/sdks.yaml](registry/sdks.yaml) only, with `conformance: passing`.

`community` means your repository owns issues and releases. `official` means a maintainer of this repository is responsible.

## Maintainers

The spec needs more than one owner. Co-maintainers are welcome for the spec, conformance, the registry, the TypeScript client, or a language SDK.

Open an issue titled `maintainer: <area>` and say what you want to own. [New issue](https://github.com/gitcommitshow/system-one/issues/new).

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
