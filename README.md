# Ummah Name - AI-powered Islamic Name Generator

Ummah Name is a Next.js application that uses generative AI to suggest beautiful and meaningful Islamic names for newborns. The app analyzes a baby's facial features from a photo to provide personalized name recommendations.

## Features

- **AI-Powered Name Suggestions**: Leverages AI to generate name suggestions based on facial analysis.
- **Camera Integration**: Uses the device's camera to capture a photo of the baby.
- **Gender Selection**: Allows users to specify the baby's gender for more accurate name suggestions.
- **Name Meanings & Origins**: Displays the meaning and origin for each suggested name.
- **Responsive Design**: Built with a mobile-first approach for a seamless experience on all devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **AI**: [Google's Gemini model via Genkit](https://firebase.google.com/docs/genkit)
- **UI**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

Follow these instructions to set up and run the project locally for development.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- [npm](https://www.npmjs.com/) (or another package manager like yarn or pnpm)
- A Google AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env` in the root of your project and add your Google AI API key:
    ```
    GEMINI_API_KEY=your_google_api_key_here
    ```

### Running the Application

You'll need to run two separate processes in two different terminal windows: the Genkit AI flows and the Next.js development server.

1.  **Run the Genkit server:**
    This starts the server that handles the AI-related tasks.
    ```bash
    npm run genkit:watch
    ```

2.  **Run the Next.js development server:**
    This starts the main application.
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
