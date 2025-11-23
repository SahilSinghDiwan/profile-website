# Project Analysis

This document contains a brief analysis of the project's structure, dependencies, and purpose.

## Project Overview

This project is a personal portfolio website for Sahil Singh Diwan, an AI Engineer. It showcases his skills, projects, work experience, and contact information.

## Tech Stack

- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Data Fetching**: TanStack React Query
- **UI Components**:
    - Custom components in `src/components/ui` (likely from shadcn/ui or a similar library).
    - Icons from `lucide-react`.
- **Linting**: ESLint

## Project Structure

- **`src/`**: Main source code directory.
- **`src/components/`**: Contains reusable UI components.
- **`src/hooks/`**: Custom hooks (e.g., `use-toast`).
- **`src/lib/`**: Utility functions.
- **`src/pages/`**: Contains the main pages of the application (`Index.tsx` and `NotFound.tsx`).
- **`src/main.tsx`**: The entry point of the React application.
- **`src/App.tsx`**: The root component of the application, which sets up routing and providers.
- **`public/`**: Contains static assets.
- **`docs/`**: Contains project documentation.

## Key Features

- **Single-page application (SPA)** with smooth scrolling navigation.
- **Dark mode** support.
- **Responsive design** for mobile and desktop.
- Sections for:
    - About Me
    - Skills
    - Featured Projects
    - Work Experience
    - Contact Information
- **UI Components**: Cards, badges, buttons, tooltips, and toasters for a modern user experience.
