# VibeProto Skill (AT Protocol Investigator)

A persistent Gemini CLI skill for investigating and querying the AT Protocol (Bluesky). This skill equips your AI agent with tools to resolve handles, inspect profiles, audit threads, and explore the "Atmosphere" using public APIs without needing user credentials.

## Capabilities

*   **Handle Resolution:** Instantly convert `handle.bsky.social` to `did:plc:...`.
*   **Deep Forensics:** Inspect raw record JSON to debug "ghost" posts, missing quotes, and embed errors.
*   **Thread Analysis:** Extract external links from entire conversation trees.
*   **Quote Discovery:** Find who quoted a post, checking beyond the standard API limits.

## Installation

1.  **Clone this repo:**
    ```bash
    git clone https://github.com/lastnpcalex/VibeProto.git
    cd VibeProto
    ```

2.  **Package the skill:**
    ```bash
    # Requires the Gemini CLI skill-creator tools
    node <path-to-skill-creator>/scripts/package_skill.cjs vibe-proto
    ```

3.  **Install into Gemini:**
    ```bash
    gemini skills install vibe-proto.skill --scope user
    ```

4.  **Activate:**
    In your Gemini session, run:
    ```
    /skills reload
    ```

## Toolset (`vibe-proto/scripts/`)

All scripts can be run directly via Node.js: `node vibe-proto/scripts/<script_name> <args>`

| Script | Arguments | Description |
| :--- | :--- | :--- |
| **`inspect_handle.cjs`** | `<handle>` | Resolves a handle (e.g., `jay.bsky.team`) to DID and fetches the full profile record. |
| **`inspect_post_record.cjs`** | `<url>` | Fetches the **raw JSON record** of a specific post. Useful for debugging broken embeds, "ghost" quotes, or finding hidden reply chains. |
| **`get_quotes.cjs`** | `<url>` | Fetches **all** quotes for a specific post, handling pagination to ensure none are missed. |
| **`extract_thread_links.cjs`** | `<url>` | Crawls a full thread/conversation and extracts all external URLs (great for summarizing reading lists). |
| **`deep_scan_user.cjs`** | *None* (Edit file) | Audits a user's recent history (last 100 posts) to find mentions of a specific RKey. (Edit the `did` and `targetRkey` in the file). |
| **`search_post_references.cjs`** | `<url>` | Searches the public index for any text mentions or links to the given post URL. |
| **`search_constellation.cjs`** | `<url>` | *(Experimental)* Queries the [Constellation](https://microcosm.blue) backlink index for network-wide references. |

## References

*   `vibe-proto/references/atproto-apis.md`: Cheat sheet of public API endpoints (`plc.directory`, `public.api.bsky.app`, etc.).