# System One

Independent specification and TypeScript client for System One decision models. One request shape covers Jev, Laya, Kev, and any other server that implements `POST /v1/systemone`.

The spec is [spec/v1/spec.md](spec/v1/spec.md) (`1.0.0-draft`). The machine-readable contract is [spec/v1/openapi.yaml](spec/v1/openapi.yaml). Apache-2.0.

## Install

```bash
npm install resilient-system-one
```

The package is not published yet. Until the first release, depend on this repository.

```ts
import { SystemOneClient } from "resilient-system-one";

const client = new SystemOneClient({
  apiKey: process.env.SYSTEM_ONE_API_KEY ?? "",
  baseUrl: "https://api.typesafe.ai",
  model: "jev-latest",
});

const result = await client.evaluate({
  state: "The card was charged twice. Please reverse one charge today.",
  questions: {
    team: {
      type: "choice",
      instructions: "Which team should handle this?",
      criteria: {
        billing: "Charges and refunds",
        shipping: "Delivery problems",
      },
    },
  },
});
```

The same request is available as `client.systemOne({ model, state, questions })`, which matches the TypeSafe client. Pass `baseURL` on the constructor if that is the option name you already use.

Change `baseUrl` and `model` to call another server. Hosts we know about are in [registry/providers.yaml](registry/providers.yaml).

## Repository

| Path | What it is |
| --- | --- |
| [spec/](spec/) | The standard. `spec.md` wins if it disagrees with the OpenAPI file. |
| [conformance/](conformance/) | JSON cases every client must accept. |
| [registry/](registry/) | Known servers and known SDKs. |
| [packages/sdk](packages/sdk) | Official TypeScript client, `resilient-system-one`. |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to change the spec, register a server, or add a language. |

## SDKs

| Language | Package | Status |
| --- | --- | --- |
| TypeScript | `resilient-system-one` | Official, in this repo. Conformance runner still pending. |

Another language starts in its own repository, passes `conformance/cases/`, and is listed with a registry-only pull request. The steps are in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
