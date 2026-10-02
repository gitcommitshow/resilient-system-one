# Design

## Name

The project is System One. The npm client is `@system-one/sdk`. The unscoped npm name `system-one` is already used by another client, so this client is scoped.

The protocol version (`spec/v1`, currently `1.0.0-draft`) is not the package version.

## Layout

| Path | Owns |
| --- | --- |
| `spec/v1/openapi.yaml` | Request and response schema. |
| `spec/v1/spec.md` | Semantics. Wins over the OpenAPI file if they disagree. |
| `conformance/cases/` | JSON fixtures every client runs. |
| `registry/providers.yaml` | Known servers and how they differ. |
| `registry/sdks.yaml` | Official and community clients. |
| `packages/sdk` | The only package this repository publishes. |
| `docs/` | Product, design, contribution, and release notes. |

The root `package.json` is private. A second language does not get a folder here until a maintainer accepts it. Until then it lives in its own repository and is listed in `registry/sdks.yaml`.

## Client shape

`SystemOneClient` is constructed with `apiKey`, `baseUrl`, and `model`. `evaluate` posts `{ state, model, questions }` to `{baseUrl}/v1/systemone`. There is no adapter interface. Provider differences stay in the registry.

## Tests

Unit tests live in `packages/sdk/test`, use Mocha, Chai, and Sinon, and do not call the network. `npm test` at the root runs those tests. Files named `*.e2e.test.ts` call live servers and are run only by `npm run test:e2e`. CI runs `npm test` only.

## License

Apache-2.0 for the spec, the conformance files, the registry, and the client. See `LICENSE` and `NOTICE`.
