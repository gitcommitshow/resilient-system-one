# Deployment

The spec is this repository. It is not published as a package.

The TypeScript client publishes as `resilient-system-one` from `packages/sdk`.

## Continuous integration

`.github/workflows/test.yml` runs `npm test` on pushes and pull requests to `main`. That command runs the TypeScript unit tests. It does not run live end-to-end tests.

## Releases

`.github/workflows/release-please.yml` opens a release pull request for `packages/sdk` when conventional commits land on `main`. The workflow expects a `RELEASE_PLEASE_PAT` secret that can open pull requests.

Publishing uses npm trusted publishing (OIDC), not a long-lived npm token. `.github/workflows/publish.yml` runs when a GitHub release is published and publishes the workspace package with provenance.

The package stays at `0.0.0` until the first release. Do not publish the private root package.
