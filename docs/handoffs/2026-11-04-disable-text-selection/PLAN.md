# Disable accidental text selection

- **Created:** 2026-11-04
- **Status:** done
- **Request:** make text in the app not accidentally selectable.

## Goal

UI text can't be selected/long-press-highlighted by accident, while text inputs stay fully usable.

## Context

- Relevant files: src/style.css (global styles); inputs in src/views/*.vue

## Tasks

| ID  | Title                          | Depends on | Status |
| --- | ------------------------------ | ---------- | ------ |
| T01 | Global user-select: none in CSS | –          | done   |

## Decisions

- Global CSS rule with an exception for input/textarea — no per-component edits needed.

## Outcome

Added global `user-select: none` (plus touch-callout and tap-highlight off) on html/body in src/style.css; inputs/textarea stay selectable. `npm run build` passed; reviewer approved.
