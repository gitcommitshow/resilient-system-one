# System One specification

The specification is the product. Language clients implement it. They do not define it.

| Path | Role |
| --- | --- |
| [v1/openapi.yaml](v1/openapi.yaml) | Machine-readable contract. Clients generate types from this file. |
| [v1/spec.md](v1/spec.md) | Normative behavior: semantics, limits, errors, and extensions. |
| [v1/changelog.md](v1/changelog.md) | Protocol history. Independent of SDK releases. |
| [../conformance/](../conformance/) | JSON cases every client must accept. |

`spec.md` wins if it disagrees with `openapi.yaml`. That disagreement is a bug. Fix both in the same pull request, and add or update a conformance case.

The current document is `1.0.0-draft`. Wire breaks wait for `spec/v2/`. `v1` stays in the tree.
