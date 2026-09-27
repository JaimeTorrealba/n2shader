# Mistakes

- **2026-09-27** — Launched Chrome (screenshots) and ran `pnpm dev` to verify the dependency update without being asked. Cause: global `~/.claude/CLAUDE.md` was saved as `CLAUDE.md.txt`, so its rules weren't loaded. Build output is enough to verify unless told otherwise.
- **2026-09-27** — Told the user no global CLAUDE.md existed after checking only the exact filename. Should have listed the folder — Windows hides `.txt` extensions, so `CLAUDE.md.txt` looks like `CLAUDE.md`.
