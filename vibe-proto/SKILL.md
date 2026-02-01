---
name: vibe-proto
description: AT Protocol (Bluesky) investigator. Triggers when asked to resolve handles, inspect profiles, or query PDS data directly.
---

# Vibe Proto (AT Protocol Investigator)

## Overview
This skill provides tools and methods for interacting with the AT Protocol network (Bluesky). It favors direct API calls and scripts over browsing.

## Tools

### Inspect Handle
Resolves a Bluesky handle to its DID and fetches the raw profile record.

**Script:** `scripts/inspect_handle.cjs`
**Usage:** `node scripts/inspect_handle.cjs <handle>`
**Example:** "Get me the profile details for support.bsky.team" -> Runs script.

## Capability: Data Discovery

If the provided scripts are insufficient, use the following API references to build custom queries:

1.  **Identity Resolution**:
    *   `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=<HANDLE>`

2.  **Repository Traversal**:
    *   `https://public.api.bsky.app/xrpc/com.atproto.repo.listRecords?repo=<DID>&collection=<NSID>`

3.  **Reference File**:
    *   See `references/atproto-apis.md` for a list of endpoints.

## Workflow

1.  **Check if a script exists:** If the user wants profile info, use `inspect_handle.cjs`.
2.  **If no script:** Consult `references/atproto-apis.md` and generate a custom Node.js script using `https` or `fetch`.
