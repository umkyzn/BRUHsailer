# BRUHsailer

**Web version for the BRUHsailer guide.**  
Keep track of your progress easier with this interactive web version.

[Access it here](https://umkyzn.github.io/BRUHsailer/)

## Overview

Intuitive web interface to keep track of your BRUHsailer ironman guide progress.

## Features

- **Progress Tracking:** Log and view your progress throughout your Ironman journey — uses localStorage for data persistence, isolated between the Main and Landlubber guides
- **Filtering:** Filter steps by All, Completed, or Incomplete; minimize completed steps
- **Search:** Live text search with in-page highlighting
- **User Highlights:** Mark steps with a colour-coded highlight (green, yellow, blue, pink)
- **Dark Mode:** Toggle with system preference detection as fallback
- **Jump to Last Step:** Quickly resume from where you left off
- **Current Guide Data:** The originating Google Docs data is converted to JSON and used as the data source for all steps. This is an automated process triggered by a Google Docs update webhook. (see `.github/scripts/` and `.github/workflows/update-site.yml`)

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router (HashRouter)
- **State:** React Context API + useReducer
- **Testing:** Vitest + React Testing Library

## Local Development

```bash
git clone https://github.com/umkyzn/BRUHsailer.git
cd BRUHsailer
npm install
npm run dev
```

Other scripts:

| Command | Description |
|---|---|
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run deploy` | Build and deploy to GitHub Pages |

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via the `deploy.yml` workflow. Guide data is updated separately via the `update-site.yml` workflow, which is triggered by a Google Docs export webhook and pulls the latest JSON from Google Drive.

## Contributing

Contributions are welcome! To contribute:
- Fork the repository
- Create a new branch (`git checkout -b feature/your-feature`)
- Make your changes and submit a pull request

For any questions or issues, please open an issue in the repository.

## Acknowledgements

Big thanks to So Iron BRUH and ParasailerOSRS for permission to make this based on their guide, and for testing. Additional thanks to the ironman community as a whole — projects like these wouldn't exist without the great community.
