# VedaAI — Assessment Creator (Frontend)

A pixel-faithful frontend replica of the VedaAI Figma designs for an AI Assessment Creator.
This is the **frontend only** — no backend or AI integration yet.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Zustand** — state management
- **Lucide React** — icons
- **Bricolage Grotesque** — typeface (via `next/font`)

## Screens

| Route | Screen |
|---|---|
| `/assignments` | Assignments — empty state **and** populated list (toggle in the top-right) |
| `/assignments/create` | Create Assignment — 2-step wizard (details → review & generate) |
| `/assignments/[id]/output` | Generated question paper (with answer key) |

`/` redirects to `/assignments`.

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

> If port 3000 is occupied, run `PORT=4123 npm run dev`.

Build for production:

```bash
npm run build
npm run start
```

## Notes

- **Empty vs. List state** — the store ships with 6 sample assignments, so the list shows
  by default. Use the small toggle in the top-right of the Assignments page to preview the
  empty state.
- **Interactions wired up**: three-dot card menu (View / Delete), question-type steppers,
  add/remove question rows, live totals, file drag-and-drop, and step navigation.
- **Responsive**: a floating sidebar on desktop collapses to a top bar + bottom tab bar
  (and an orange `+` FAB) on mobile.
- Brand/logo, the "no assignments" illustration, and avatars are the exact assets exported
  from the design.

## Project Structure

```
app/
  layout.tsx                       # font + root layout
  page.tsx                         # redirect → /assignments
  assignments/
    page.tsx                       # empty/list switch + mobile FAB
    EmptyState.tsx
    AssignmentList.tsx
    create/{page,Step1,Step2}.tsx  # 2-step wizard
    [id]/output/page.tsx           # question paper
components/
  AppLayout.tsx  Sidebar.tsx  Header.tsx  MobileBars.tsx
store/
  useAssignmentStore.ts            # Zustand store
```
# veda-ai-frontend
