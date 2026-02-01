---
name: vibe-proto
description: AT Protocol (Bluesky) investigation and querying agent. Use when the user asks for information about Bluesky users, PDS data, firehose events, or general ATProto network statistics.
---

# Vibe Proto (AT Protocol Investigator)

## Overview
This skill specializes in exploring and querying the AT Protocol (Bluesky) network. It is designed to function autonomously using public APIs and tools without requiring user credentials whenever possible.

## Capability: Data Discovery & Querying

When asked to find information on Bluesky/ATProto, use the following strategies:

1.  **Public API Aggregators**: Prefer querying public aggregators that index the network.
    *   **Microcosm / Constellation**: Use for graph analysis and global network stats.
    *   **PDSls (Reference)**: Modeled after the `pdsls` capabilities—browsing public PDS records.

2.  **Direct PDS Querying**:
    *   Resolve handles to DIDs (`at://<handle>`).
    *   Query the user's PDS directly for public records (posts, follows, likes).
    *   Use `com.atproto.repo.listRecords` and `com.atproto.sync.getRepo`.

3.  **Firehose Analysis**:
    *   If real-time data is needed, consider creating a script to tap into the `com.atproto.sync.subscribeRepos` websocket (firehose).

## Reference Tools

The skill is aware of the following tools in the ATmosphere:

-   **pds.ls (pdsls)**: A web-based explorer for PDS data.
-   **pdsfs**: A FUSE filesystem for mounting PDS repos as read-only filesystems.

## Workflow

1.  **Identify Target**: Is the user asking about a specific user (Handle/DID), a specific record type (Post), or network-wide trends?
2.  **Select Tool/API**:
    *   *Specific User:* Resolve DID -> Query PDS directly or use a profile viewer API.
    *   *Network Stats:* Query an aggregator (e.g., build a script to query known indexers).
    *   *Raw Data:* Mount PDS via `pdsfs` (if available) or download repo CAR file.
3.  **Execution**: Write and execute a script (Node.js/Python) to fetch the data if a direct tool isn't available.

## Advanced: Script Generation
When no direct tool exists, generate a Node.js script using `@atproto/api` (if available) or standard `fetch` to query XRPC endpoints.