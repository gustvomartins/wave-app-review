# Wave - App Review

Wave is a powerful tool designed to analyze and visualize user reviews from both the Apple App Store and Google Play Store. It provides deep insights into user sentiment, ratings, and feedback trends through advanced clustering and comparison features.

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

-   Node.js (v18 or higher recommended)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd wave-app-review
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

To build the application for production:

```bash
npm run build
```

## Project Structure

-   `src/components`: UI components and page views.
-   `src/utils`: Utility functions and API helpers.
-   `src/supabase`: Supabase client configuration and types.
-   `src/styles`: Global styles and theme configurations.