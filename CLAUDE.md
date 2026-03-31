# CLAUDE.md
# Project: CorpBoard
Internal discussion SNS (React + Vite + Tailwind CSS). Backend is currently mock-based.
Detailed specs: `work/OVERVIEW.md`

# Commands
- Install: `npm install`
- Dev Server: `npm run dev` (http://localhost:5173)
- Build: `npm run build` (outputs to `dist/`)
- Preview: `npm run preview`

# Directory Constraints (CRITICAL)
- `work/`: [STRICTLY READ-ONLY] Design reference only (e.g., `work/App.jsx`). DO NOT edit under any circumstances.
- `src/`: All implementation MUST be done within this directory.

# Architecture & Code Conventions
## Data Flow
- Components MUST fetch data via `src/hooks/useThreads.js`.
- Currently references `src/data/mock.js`, but DO NOT import the mock directly into components.

## Component Structure
- `src/components/layout/`: Screen skeletons (Header, Sidebar, RightPanel, etc.)
- `src/components/thread/`: Thread-related (ThreadListItem, ThreadDetail, CommentBlock [recursive renderer])
- `src/components/ui/`: General UI parts (Button, Badge, etc.)

## State Management
- Currently using only local state (`useState`) in `App.jsx` (e.g., `selectedThreadId`).
- DO NOT introduce external state management libraries like Zustand or Jotai unless explicitly instructed.

## Styling (Tailwind CSS)
- Use the following project-specific design tokens (already defined in `tailwind.config.js`):
  - `primary`: `#10B981` (Emerald Green)
  - `surface`: `#f8fafc`
  - `ink`: `#1E293B`