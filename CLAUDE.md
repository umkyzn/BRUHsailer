# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BRUHsailer is a static web app that tracks progress through the "BRUHsailer Ironman Guide" for Old School RuneScape. It's vanilla HTML/CSS/JS with no build tools or frameworks. Data originates from Google Docs, is transformed into JSON, and rendered client-side.

Live site: https://umkyzn.github.io/BRUHsailer/

## Development

No build step is needed for local development—open `index.html` in a browser or use any static file server.

The project includes Node.js scripts for the data pipeline:
- `scripts/download.js` — downloads JSON exports from Google Drive
- `scripts/convert.js` — transforms Google Docs API format into `data/guide_data.json`

These require `googleapis`, `fs-extra`, and `dotenv` (installed via `npm install`).

There are no tests, no linter, and no build command.

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

**Frontend modules** (all in `js/`):

| Module | Responsibility |
|---|---|
| `main.js` | Entry point, DOMContentLoaded setup, wires event listeners |
| `guideDataLoader.js` | Fetches `data/guide_data.json`, parses chapters/sections/steps, renders DOM with rich text formatting |
| `uiManager.js` | All UI interactions: highlight mode, dark mode, search, keyboard nav, smooth scrolling. Largest module (~700 lines) |
| `progressManager.js` | Checkbox state → localStorage (`guideProgress`), progress bar updates |
| `filterManager.js` | Filters steps by completion state, minimize-completed toggle, persists to localStorage (`guideFilter`) |
| `utils.js` | `showToast()` helper |

**Data transformation** (`scripts/convert.js`, 749 lines):
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
