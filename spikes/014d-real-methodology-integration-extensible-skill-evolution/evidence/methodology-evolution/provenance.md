# 014d methodology-evolution evidence provenance

This is a human-authorized, documentation-only evidence record for the AC09
gap found by independent verification attempt 006. It does not alter the
implementation candidate, trusted history, evaluator revision, or any prior
verification result.

## Inputs and tool identity

- Candidate revision: `9169ccf7d4543c214e7b7890ee29e428a5f8c01a`
- Trusted N: record 4 in `methodologies/harness/trusted.jsonl`, revision
  `0a3dafe8e103cc7376bdd7fae32493710613d0c0`, methodology identity
  `sha256:5fc66acdc6e2701ded4f729aa987b1db119845ae1bfca5f385725ba34f42ac48`.
- Trusted-history source bytes: SHA-256
  `d9d4519af844b7f5f11515a24f951c475c760012ed850a985f9007179012261e`.
- `tools/methodology.ts` source bytes at the candidate and current checkout:
  SHA-256 `f315a0d9822e5f2f0a32b3ca5ca3bdc52e103996c6a355575c455049536eef4c`.
- `src/methodology-evolution.ts` source bytes at the candidate and current
  checkout: SHA-256
  `a01caed068514b912d7e4bb8761684512210d5706e1e6bab0986f8099d481327`.

The two source comparisons establish that the existing tool was exercised with
the same methodology-evolution and trusted-history bytes that the exact
candidate uses; its revision argument makes every manifested policy, contract,
skill, and validator byte come from the named Git revision.

## Exact commands

```text
node tools/methodology.ts candidate 0a3dafe8e103cc7376bdd7fae32493710613d0c0 methodologies/harness/trusted.jsonl
node tools/methodology.ts candidate 9169ccf7d4543c214e7b7890ee29e428a5f8c01a methodologies/harness/trusted.jsonl
node tools/methodology.ts check candidate-n-plus-one.candidate.json
node tools/methodology.ts diff trusted-n.candidate.json candidate-n-plus-one.candidate.json
```

## Output bindings

| Output | SHA-256 | Binding |
| --- | --- | --- |
| `trusted-n.candidate.json` | `a763151b2bf7e3fc031b63ab2aa0a79587c7a218e0a3ff54b00157586996649d` | Revision `0a3dafe8…` recomputes record 4's identity `sha256:5fc66…`; relation is `equal`. |
| `candidate-n-plus-one.candidate.json` | `dfac9e8edb9e4a2a45532d0441bfc1148d055c9f943f0fb2d5ba3307c185c7b4` | Revision `9169ccf7…` recomputes candidate identity `sha256:47296d5c73c7833002c482ed7ed75d67ecf21c7aec6fa62a5c84aeeab954effb`; relation is `different` from trusted N. |
| `candidate-n-plus-one.check.json` | `164f06b9ac886e4f0e15ecbb3741e8341114c51836ae4637fd5210b41bf74c7b` | `check` of that exact candidate identity is valid with an empty diagnostics array. |
| `trusted-n-to-candidate.diff.json` | `3fc1516d80459cd878ef0f6b3e28aff50d246fab4462a5a681cbdb467fcc88cd` | `diff` binds `from` `sha256:5fc66…` to `to` `sha256:47296…`; it reports the intended policy, all eight active skills, and evaluator/implementation contract changes. |

The manifest-bearing candidate outputs retain the complete content and
deterministic identity of every governing component. They are the canonical
tool bytes, not a reconstructed summary. Verification attempt 006 remains an
unchanged historical `FAIL`.
