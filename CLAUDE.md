# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BRUHsailer is a Vue 3 progressive web app that tracks progress through the "BRUHsailer Ironman Guide" for Old School RuneScape. Built with Vue 3 Composition API, TypeScript, Pinia for state management, and styled with OSRS-themed custom CSS. Data originates from Google Docs, is transformed into JSON, and rendered client-side.

Live site: https://umkyzn.github.io/BRUHsailer/

## Features

- **OSRS-Themed UI**: Pixel fonts, skill icons, and game-inspired aesthetics
- **Compact Navigation**: Collapsible sidebar with progress indicators
- **Interactive Step Cards**: OSRS-styled cards with particle effects
- **Progress Tracking**: Visual orbs showing section completion, time, and GP
- **Keyboard Shortcuts**: Vim-style navigation and quick actions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: OSRS night theme

## Development

Run the dev server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

The project includes Node.js scripts for the data pipeline:
- `scripts/download.mts` — downloads JSON exports from Google Drive
- `scripts/convert.mts` — transforms Google Docs API format into `data/guide_data.json`

These require `googleapis`, `fs-extra`, and `dotenv` (installed via `npm install`).

## Local Setup

To run the data pipeline locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

3. Configure your Google Drive API credentials in `.env`:
   - `GOOGLE_CREDENTIALS` — Service account JSON from Google Cloud Console
   - `FOLDER_ID` — Google Drive folder ID containing the exported JSON files

4. Run the data pipeline:
   ```bash
   npm run update        # Download and convert (full pipeline)
   npm run download      # Download JSON files from Google Drive only
   npm run convert       # Convert downloaded files to guide_data.json only
   ```

The scripts will download JSON files to `data/`, convert them, and output the final `data/guide_data.json`.

## Data Pipeline

```
Google Docs → App Script export (external/googlescripts.js) → Google Drive
  → GitHub Actions (repository_dispatch: google-docs-update)
  → scripts/download.js → scripts/convert.js → data/guide_data.json → committed to main
```

The Google Apps Script in `external/googlescripts.js` adds a custom menu to the source doc with "Export File as JSON" and "Push Data to Site" (triggers the GitHub Actions workflow via repository dispatch).

The same pipeline can be run locally using `npm run update` (see Local Setup section).

## Architecture

**Frontend** (Vue 3 + TypeScript):
- **Components** in `src/components/` - modular Vue SFCs (GuideStep, SidebarNav, ProgressRing, OSRSCheckbox, etc.)
- **Stores** in `src/stores/` - Pinia state management (progress, filter, guide, ui, keyboard)
- **Styles** in `src/styles/` - OSRS theme CSS and design tokens
- **Composables** in `src/composables/` - reusable logic (useToast, useKeyboard, etc.)

**Build System:**
- Vite for dev server and production builds
- TypeScript for type safety
- Motion One for animations
- Vue Router for navigation

**Data transformation** (`scripts/convert.mts`, TypeScript):
- Parses Google Docs API structural elements (paragraphs, lists, textRuns, richLinks)
- Identifies chapters (centered "Chapter" text), sections (`X.X:` pattern), steps (level-0 bullets), nested content (level > 0 bullets), and metadata fields
- Extracts rich formatting (bold, italic, color, links, font) into structured JSON

## Data Structure

`guide_data.json` contains:
```
{ updatedOn, title, chapters[] }
  chapter: { title, sections[], footnotes[] }
    section: { title, steps[], footnotes[] }
      step: { content[], nestedContent[], metadata }
        content[]: { text, formatting: { bold, italic, underline, color, url, isLink, ... } }
        metadata: { gp_stack, items_needed, total_time, skills_quests_met }
```

## localStorage Keys

- `guideProgress` — `{ "check-X-Y": boolean }` step completion states
- `guideFilter` — `{ filter: "all"|"completed"|"incomplete", minimized: boolean }`
- `userHighlights` — array of `{ parentId, htmlContent, color }` for user text highlights
- `highlightColorPreference` — selected highlight color string

## Styling

CSS variables drive theming (`styles.css`). Dark mode toggles a `.dark-mode` class on `<body>` which overrides the variables. Key design: tan/brown palette in light mode, dark blue/near-black in dark mode. Max content width is 900px.
