# Wave - App Review

App Review is a powerful tool designed to analyze and visualize user reviews from both the Apple App Store and Google Play Store. It provides deep insights into user sentiment, ratings, and feedback trends through advanced clustering and comparison features.

The original design is available on [Figma](https://www.figma.com/design/drZ3dLvc77fuzaC65Sedsj/Wave---App-Review).

## Features

-   **Multi-Store Support**: Seamlessly fetch and analyze app details and reviews from the Apple App Store and Google Play Store.
-   **Dashboard Summary**: Get a quick overview of your app's performance with key metrics.
-   **Review Management**: Browse, filter, and search through user reviews to understand specific feedback.
-   **Ratings Analysis**: Visualize rating distributions and trends over time.
-   **Sentiment Analysis**: AI-powered sentiment analysis to categorize reviews as positive, negative, or neutral.
-   **Advanced Clustering**:
    -   **Words**: Analyze frequently used words.
    -   **Topics**: Discover common topics discussed in reviews.
    -   **Phrases**: Identify recurring phrases and patterns.
    -   **Themes**: Group reviews by broader themes for strategic insights.
-   **Comparison View**: Compare two applications side-by-side to benchmark performance.
-   **Theme Support**: Fully responsive design with Light, Dark, and System theme options.

## Tech Stack

-   **Frontend**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Backend/Data**: [Supabase](https://supabase.com/)

## Getting Started

### Prerequisites

-   Node.js 20 or higher
-   npm

### Installation

```bash
git clone https://github.com/gustvomartins/wave-app-review.git
cd wave-app-review
npm install
```

`npm install` also installs the Husky git hooks (`pre-commit` runs `lint:fix`, `pre-push` runs the build).

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on `http://localhost:3000` |
| `npm run build` | Build for production into `build/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` / `npm run lint:fix` | Run ESLint (fix mode) |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run test` / `npm run test:dev` | Run Vitest once / in watch mode |

## Project Structure

The layout follows the conventions of the [wave-tech-framework](https://github.com/wave-telecom/wave-tech-framework): kebab-case file names, one module per folder with an `index.ts` barrel, specs under `tests/` mirroring `src/`, and shared GitHub templates and CI.

```
.github/                  Issue/PR templates and the Node.js CI workflow
.husky/                   Git hooks (pre-commit, pre-push)
docs/                     Guidelines and attributions
src/
  app.tsx                 Root component and page routing
  main.tsx                Entry point
  clients/
    app-review-api/       Client and types for the App Review edge function
    supabase/             Supabase project info
  components/
    apps/                 App search, slots and the add-app dialog
    filters/              Date range and version filters
    layout/               Sidebar, navigation, logo and status banner
    ratings/              Rating summary, distribution and stars
    reviews/              Review list
    ui/                   shadcn/ui primitives
  pages/                  Page-level views (summary, reviews, ratings, sentiment, comparison, ...)
    clustering/           Words, topics, phrases and themes clustering pages
  styles/                 Compiled Tailwind CSS and theme globals
  utils/                  Sentiment and clustering analyzers
supabase/
  functions/server/       Supabase Edge Function (Deno + Hono)
tests/                    Vitest specs mirroring src/
```

Import across modules through the `@/` alias and the module barrel (e.g. `import { StarRating } from '@/components/ratings'`); use relative imports only within the same folder.
