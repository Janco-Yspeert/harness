# Spike 005 App Server Protocol Baseline

The App Server JSON Schema in `app-server-schema/` was generated for Spike 005
using:

```sh
codex app-server generate-json-schema --out app-server-schema
```

The generating CLI was `codex-cli 0.147.0`, published as `@openai/codex@0.147.0`
from the [OpenAI Codex repository](https://github.com/openai/codex).

The `--experimental` option was not used. Spike 005 targets the non-experimental
App Server protocol surface and does not opt into
`capabilities.experimentalApi`.

## License

The generated schema bundle is derived from OpenAI Codex, which declares the
Apache License 2.0 for version 0.147.0. The schemas are redistributed under
those terms; see [`app-server-schema/LICENSE`](./app-server-schema/LICENSE).

No hand-authored modifications were made to the generated schema files.
