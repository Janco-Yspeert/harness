# Contributing to Harness

Harness is a personal, experimental project under active development. External
contributions may be considered, but there is no guarantee that a proposed
change will be accepted or reviewed within a particular timeframe.

The project owner retains final authority over its direction, scope, design, and
releases.

## Before Starting

For anything beyond a small, obvious correction, open an issue or discussion
before investing significant effort. This avoids building a substantial change
that does not fit the project's current direction.

Read [`GOALS.md`](./GOALS.md) for product direction and
[`AGENTS.md`](./AGENTS.md) for the repository's engineering constraints.
Spike-specific contracts and historical development records live under
[`spikes/`](./spikes/).

Do not modify promoted evaluation artifacts or other historical spike records
unless the proposed change explicitly concerns their provenance or
documentation. They record what was evaluated at the time; tidying history until
it tells a nicer story rather defeats the point.

## Development

Harness currently requires:

- Ubuntu;
- Node.js 24.12 or newer; and
- npm 11 or newer.

Install dependencies with:

```sh
npm install
```

Before submitting a change, run:

```sh
npm run check
```

Keep changes focused. Avoid unrelated refactoring, speculative abstractions, new
dependencies without a concrete need, and changes that broaden the current
security posture.

## Submitting Changes

Do not commit directly to `main`.

- External contributors should create a fork and submit a pull request from a
  focused branch.
- Collaborators with repository access must also work on a focused branch and
  submit a pull request.
- Pull requests should explain the problem, the chosen approach, important
  trade-offs, and the verification performed.
- Every change is subject to review and approval by the project owner.
- Approval is discretionary; opening a pull request does not create an
  obligation to merge it.
- Accepted pull requests are squash-merged. Merge commits and rebase merges are
  not used.

Repository permissions, branch protection, and required checks are configured on
GitHub and remain authoritative where they impose stricter requirements.

## Security Reports

Do not report undisclosed vulnerabilities in public issues or pull requests.
Follow the private reporting instructions in [`SECURITY.md`](./SECURITY.md).
