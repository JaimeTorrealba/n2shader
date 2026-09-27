---
name: verify
description: End-of-session quality gate — clean and optimize the code changed this session, then run lint, type check, tests and build. Run by the user as /verify.
disable-model-invocation: true
---

# /verify

Run this after a working session. Goal: leave the changed code clean, consistent with `CLAUDE.md`, and green on every check. Never change behaviour or visuals unless fixing a real bug — and say so if you do.

## 1. Scope
Collect what changed: `git status --short` and `git diff HEAD --stat` (include untracked files). Only clean up those files; don't refactor unrelated code. If nothing changed, skip to step 3.

## 2. Clean & optimize (changed files only)
Read each changed file fully, then fix:
- **Dead code**: unused imports, variables, functions, props, commented-out blocks, leftover `console.log`/`debugger`.
- **Duplication**: repeated logic → extract or reuse an existing composable/util (search `app/composables`, `app/utils` first).
- **Conventions**: `<script setup lang="ts">` below `<template>`; VueUse instead of raw browser APIs; Tailwind utilities instead of custom CSS where equivalent; no `any` without reason.
- **Animation**: GSAP tweens animate `transform`/`opacity` only; easing is deliberate (no default/linear on UI motion); animations scoped in `gsap.context()` and reverted on unmount; ScrollTriggers killed on unmount; `prefers-reduced-motion` respected.
- **Performance**: no reactive work in hot loops, listeners/observers cleaned up, three.js geometries/materials/textures disposed, `will-change` not left on permanently.
- **a11y & SEO**: semantic elements, alt text, labels, focus states, keyboard reachability; `useSeoMeta` on pages.

Keep edits minimal and idiomatic to the surrounding code.

## 3. Checks
Run each `package.json` script that exists, in order, fixing failures before moving on:
1. `pnpm lint --fix` (or `pnpm lint:fix` if defined), then `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test` (non-watch, e.g. `pnpm test --run` for Vitest)
4. `pnpm build`

If a script is missing, report it as **skipped (not configured)** — don't install tooling without asking. Don't silence errors with `// @ts-ignore`, `eslint-disable`, or skipped tests unless there's a stated reason.

## 4. Report
Reply with a short summary:
- **Cleaned**: bullet per file, what changed and why.
- **Checks**: lint / typecheck / test / build → pass, fail (with the error), or skipped.
- **Needs attention**: anything you found but deliberately didn't change (behaviour-affecting, out of scope, or a judgment call).

Don't commit.
