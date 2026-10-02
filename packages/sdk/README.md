# resilient-system-one

TypeScript client for any server that implements [System One 1.0.0-draft](../../spec/v1/spec.md).

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

`baseUrl` and `model` on the client still work. `defaultModel` is accepted as another name for the client model. Point `baseUrl` at another System One server to switch models. Known hosts are listed in [registry/providers.yaml](../../registry/providers.yaml). The client does not retry.
