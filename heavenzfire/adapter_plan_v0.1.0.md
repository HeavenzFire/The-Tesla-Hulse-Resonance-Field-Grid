# HeavenzFire cross-AI adapter plan v0.1.0

## Primary transport

Use versioned JSON files for portable interchange. Each package should include the schema, interchange instance, capability entries, evidence references, test results, and hashes. Use repository commits or explicit file attachments as provenance. Do not treat a share URL as API authorization or claim access to a private conversation merely because its URL is known.

## Adapter contract

1. Validate the envelope against heavenzfire/interchange_schema_v0.1.0.json using a Draft 2020-12 JSON Schema validator.
2. Preserve unknown extension fields; never silently rewrite or discard data from another platform.
3. Keep platform capability entries scoped to the specific session/runtime and include evidence basis, timestamp, and limitations.
4. Represent unavailable facts as null, unknown, or unverified. Do not promote another platform's reported tests into locally reproduced results.
5. Record file SHA-256 values from exact bytes. Hash prefixes are display-only; retain the full digest in the manifest/log.
6. Run deterministic tests and record command, commit SHA, CI run URL, test count, and outcome.
7. Export a new interchange instance after validation; retain the source handoff unchanged for auditability.

## Current ChatGPT session capability entry

See heavenzfire/capability_registry_chatgpt_v0.1.0.json. This session has an authenticated GitHub connector, web search, Python execution, and file interchange. The Python execution runtime does not have direct internet access. This does not imply arbitrary API access to Meta/Gemini/Claude, private share-link retrieval, or control of other AI user interfaces.

## Validation boundary

The original Meta AI files named in the pasted handoff were not attached to this session. This branch creates a compatible schema/example/test suite from the pasted handoff, but does not claim to have executed Meta's exact test file or independently verified the reported cfb5957e6826... digest. Attach the original files to verify byte-for-byte equivalence.
