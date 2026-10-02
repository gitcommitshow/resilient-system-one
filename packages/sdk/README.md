# resilient-system-one

Resilient integration with System One models that follow the [1.0.0-draft spec](https://github.com/gitcommitshow/resilient-system-one/blob/main/spec/v1/spec.md), such as Jev, Laya, and Kev.

Switch to a different System One model by changing `baseUrl` and `model`. The questions stay the same. Known hosts are in the [provider registry](https://github.com/gitcommitshow/resilient-system-one/blob/main/registry/providers.yaml).

```ts
import { SystemOneClient } from "resilient-system-one";

const client = new SystemOneClient({
  apiKey: process.env.SYSTEM_ONE_API_KEY ?? "",
  baseUrl: process.env.SYSTEM_ONE_BASE_URL ?? "https://api.typesafe.ai",
  model: "jev-latest",
});

const result = await client.evaluate({
  state: "The card was charged twice. Please reverse one charge today.",
  questions: {
    same_day: {
      type: "noul",
      instructions: "Does the message ask for something to happen today?",
    },
  },
});

console.log(result.answers.same_day);
```

`systemOne` is the same call. Use it when you are moving a TypeSafe client over: pass `baseURL` on the client, and pass `model` on the request.

```ts
const client = new SystemOneClient({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  baseURL: "https://openrouter.ai/api",
});

const result = await client.systemOne({
  model: "jev-1.13",
  state: "I was charged twice for my subscription.",
  questions: {
    refund: {
      type: "noul",
      instructions: "Is the customer asking for money back?",
    },
  },
});
```

`baseURL` is the same setting as `baseUrl`. `defaultModel` is the same setting as `model`. One config change is enough to move a call from Jev (`https://api.typesafe.ai`, `jev-latest`) to Laya (`https://api.laya.studio`, `english`) or to a self-hosted Kev (`kev-latest`). The client does not retry.

## Roadmap

Rough. Order can move.

**Now.** One client for System One models that follow the spec. Change `baseUrl` and `model` to switch. Each call is a single request.

**Soon.** Resilience patterns similar to [resilient-llm](https://github.com/gitcommitshow/resilient-llm): retries with backoff, circuit breakers, rate limiting, and fallback to another System One model when the current one fails.

**Also open.** Run the repo's conformance cases in this package, with no live network.
