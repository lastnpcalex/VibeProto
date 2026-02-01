# VibeProto Skill (AT Protocol Investigator)

A persistent Gemini CLI skill for investigating and querying the AT Protocol (Bluesky). This skill equips your AI agent with tools to resolve handles, inspect profiles, and explore the "Atmosphere" using public APIs without needing user credentials.

## Capabilities

*   **Handle Resolution:** Instantly convert `handle.bsky.social` to `did:plc:...`.
*   **Profile Inspection:** Fetch public profile data (description, avatar, banner) directly from the PDS.
*   **API Guidance:** Includes a reference map of public AT Protocol APIs (`constellation`, `microcosm`, `pds.ls`) for building custom queries on the fly.
*   **Extensible:** Designed to be a living repository of ATProto scripts.

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

## Usage

Once installed, you can ask Gemini questions like:

*   *"Who is @support.bsky.team?"* (Triggers `inspect_handle.cjs`)
*   *"Get the DID for danabra.mov"*
*   *"Check the profile data for jay.bsky.team"*

## Directory Structure

*   `SKILL.md`: The "brain" of the skill. Tells Gemini when and how to use the tools.
*   `scripts/`: Executable Node.js scripts.
    *   `inspect_handle.cjs`: Resolves a handle and fetches the profile record.
*   `references/`: Markdown knowledge base.
    *   `atproto-apis.md`: List of public API endpoints (PDS, PLC, etc.).