# Evaluate

The client posts to whatever base URL you pass. This example targets a local server.

```ts
import { SystemOneClient } from "@system-one/sdk";

const client = new SystemOneClient({
  apiKey: process.env.SYSTEM_ONE_API_KEY ?? "local",
  baseUrl: process.env.SYSTEM_ONE_BASE_URL ?? "http://127.0.0.1:8009",
  model: process.env.SYSTEM_ONE_MODEL ?? "kev-latest",
});

const result = await client.evaluate({
  state: "The parcel arrived opened.",
  questions: {
    damaged: {
      type: "noul",
      instructions: "Does the message describe damaged goods?",
    },
  },
});

console.log(result.answers.damaged);
```

The same body with curl:

```bash
curl -s "$SYSTEM_ONE_BASE_URL/v1/systemone" \
  -H "Authorization: Bearer $SYSTEM_ONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"state":"The parcel arrived opened.","model":"kev-latest","questions":{"damaged":{"type":"noul","instructions":"Does the message describe damaged goods?"}}}'
```
