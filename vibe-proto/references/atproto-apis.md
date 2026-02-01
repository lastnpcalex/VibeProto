# AT Protocol Public APIs

## Identity & Resolution
- **Resolve Handle:** `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=<HANDLE>`
- **Directory PLC:** `https://plc.directory/<DID>`

## Public Data Servers (PDS)
Once a DID's PDS endpoint is found (via PLC Directory), standard XRPC calls apply:
- **List Records:** `<PDS_URL>/xrpc/com.atproto.repo.listRecords?repo=<DID>&collection=<NSID>`
- **Get Record:** `<PDS_URL>/xrpc/com.atproto.repo.getRecord?repo=<DID>&collection=<NSID>&rkey=<RKEY>`

## Aggregators & Explorers
- **PDSls:** `https://pds.ls` (Web interface, check for API)
- **BlueSky App View:** `https://api.bsky.app` (The main AppView, often requires auth for deep queries but public profiles are often accessible).
