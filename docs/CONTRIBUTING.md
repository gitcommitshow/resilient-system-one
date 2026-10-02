# Contributing

Apache-2.0. By submitting a change you agree it is licensed under `LICENSE`.

Four kinds of change land here. Use the one that matches the files you touch.

## 1. Spec

Change `spec/v1/openapi.yaml` and `spec/v1/spec.md` together, and add or update a file in `conformance/cases/`. Note the change in `spec/v1/changelog.md`.

If the official TypeScript client would misread the new contract, update `packages/sdk` in the same pull request.

Do not start `spec/v2/` for a clarification. A wire break (removed field, renamed field, or a new meaning for `noul`, `choice`, or `score`) is the bar for a new version directory.

## 2. Server registry

A new host that already speaks `POST /v1/systemone` is a pull request that edits `registry/providers.yaml` only. Describe limit and field differences in `notes`. Do not add a class in the TypeScript client.

## 3. TypeScript client

Bug fixes and the official client stay in `packages/sdk`. Behavior has to keep accepting `conformance/cases/`. `npm test` must not call a live server.

## 4. A new language SDK

A new language starts outside this repository.

1. Open an issue with the title `sdk: <language>`. Include the language, the package name on that registry, the maintainer, and the spec version (`1.0.0-draft` or later). Wait for a maintainer to accept it before adding code to this repo.
2. Implement against `spec/v1/openapi.yaml`. Load `conformance/cases/` in that project's tests. Send `state`, `model`, and `questions` to `{baseUrl}/v1/systemone`. Ignore unknown response fields.
3. Publish under Apache-2.0. The package states the spec version it implements. Prefer the name `system-one` when that registry name is free. It is already taken on npm and on PyPI, so a new client on those registries needs a free name. The official TypeScript name stays `@system-one/sdk`.
4. Open a pull request here that changes only `registry/sdks.yaml`. The root README stays high level. Document the client in its own repository.

```yaml
- language: python
  package: <published name>
  registry: https://pypi.org/project/<published-name>/
  repository: https://github.com/example/system-one-python
  specVersion: 1.0.0-draft
  status: community
  conformance: passing
```

`community` means the other repository owns issues and releases. `official` means a maintainer of this repository is responsible. Promotion is a separate decision. An official SDK may stay outside, or move to `packages/<language>` with its own CI job and its own release-please entry. `npm test` in this repository keeps running only the TypeScript package.

A pull request that fails conformance, renames the package, or edits the spec in the same change is not listed.
