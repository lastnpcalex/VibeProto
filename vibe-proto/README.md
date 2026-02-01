# VibeProto Skill

This directory contains the source code for the `vibe-proto` Gemini CLI skill.

## Persistence & Usage

To ensure this skill persists across sessions and is consistently available:

1.  **Package the Skill:**
    Run the packaging script to create a `.skill` file (which is a zip of this directory).
    ```bash
    node <path-to-skill-creator>/scripts/package_skill.cjs .
    ```

2.  **Install the Skill:**
    Install the packaged file into Gemini's internal registry.
    ```bash
    gemini skills install vibe-proto.skill --scope user
    ```

3.  **Update/Edit:**
    - Edit the files in this directory (the "source of truth").
    - Re-package and re-install to apply changes.
    - Run `/skills reload` in your Gemini session.

## Directory Structure

- `SKILL.md`: The main definition file. **Needs editing.**
- `scripts/`: Executable scripts (Node.js, Python, etc.) called by the skill.
- `references/`: Markdown files with documentation/context loaded on demand.
- `assets/`: Static files (templates, images) used in output.
