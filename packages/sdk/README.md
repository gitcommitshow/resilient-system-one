# @system-one/sdk

TypeScript client for any server that implements [System One 1.0.0-draft](../../spec/v1/spec.md).

```ts
import { SystemOneClient } from "@system-one/sdk";

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

Point `baseUrl` at another System One server to switch models. Known hosts are listed in [registry/providers.yaml](../../registry/providers.yaml). The client does not retry.
