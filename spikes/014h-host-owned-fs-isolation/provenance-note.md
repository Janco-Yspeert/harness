# Spike 014h — Provenance Note

This note records only the boundaries needed for subsequent work.

## Accepted 014h product

The independently evaluated and human-accepted 014h candidate is:

`dee86d2314bffa7cc2da0d8ac72004250a06debb`

Its acceptance covers the frozen 014h filesystem-isolation contract and does not automatically extend to later runtime or recovery commits.

## Inherited candidate material

014h began from branch state `4e6c9676045b3c0dcc4eac3a6cbe1a23e5d3a649`, which already contained the 014f candidate `a2ed538330ace7a51b9585dcba404035c72c973f` and the 014g candidate `651352329cca473fb920139e1496f9f508eeabbb`.

Those implementations may therefore be present in current runtime history, but neither becomes accepted merely because 014h passed its own independent evaluation.

## Post-candidate bootstrap runtime

After `dee86d2`, bootstrap runtime changes were added to complete legacy protected evaluation and promotion, notably:

- `5c1c4b50fbee8d2b3df7096f043304015196fb1e` — legacy evaluator evidence-publication bridge;
- `88972ad262bde0de74c9eb5f2535df20524bd0bd` — unattended protected evaluator protocol, host-issued execution context and clearer terminal-result handling;
- `161f4a80d5855106f70768ad1251e21ed7863a9a` — known-loss promotion recovery.

These changes solved real runtime defects and may be reused by subsequent work, but they were not part of the exact 014h candidate independently verified at `dee86d2`.

The known-loss promotion mechanism remains a bootstrap/recovery scar. Its existence must not make missing evaluator-private evidence a normal or easier route through promotion. Future normal evaluation should retain required private evidence at attempt termination.

## Forward-use rule

Subsequent work may inspect and reuse current HEAD as runtime reality, but must distinguish:

- **present in runtime**;
- **independently verified for 014h**;
- **accepted under 014f/014g**;
- **bootstrap recovery machinery**.

No further lineage reconstruction is required unless a later spike's frozen acceptance criteria depend on one of these distinctions.
