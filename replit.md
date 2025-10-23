# Studently - Student Productivity Platform

## Overview
Studently is a comprehensive, student-designed productivity and learning platform. Its core purpose is to help students learn how to learn through enhanced organization, structured planning, and thoughtful AI guidance. It integrates a monthly calendar, daily task planner, and an AI-powered study assistant to foster engagement and organization. The platform aims to encourage critical thinking over direct answers and has strong market potential for students seeking to improve their academic efficiency and learning methodologies.

## User Preferences
I want iterative development. Ask before making major changes. I prefer detailed explanations.

## System Architecture
Studently utilizes a modern web stack with a clear separation of concerns between its frontend and backend.

### UI/UX Decisions
- **Design System**: Features a vibrant blue primary color (HSL 250 100% 60%) and distinct subject-specific colors (Math: blue, Science: green, Writing: purple, Social Studies: orange, Coding: pink).
- **Typography**: Uses Inter for UI elements and JetBrains Mono for code displays.
- **Responsiveness**: Fully responsive design for desktop, tablet, and mobile.
- **Theming**: Supports persistent Light/Dark mode.
- **Interaction**: Implements hover-elevate and active-elevate-2 for interactive elements.
- **Feedback**: Includes skeleton states, loading indicators, empty states, and toast notifications.

### Technical Implementations
- **Frontend**: Developed with React and TypeScript, using Wouter for routing. Styling is managed with Tailwind CSS and shadcn/ui components. TanStack Query handles server state management.
- **Backend**: Built with Express.js and TypeScript.
- **Database**: PostgreSQL (Neon) is used for full data persistence, managed via Drizzle ORM.
- **AI Integration**: Leverages Google Gemini 2.5 Flash for the AI Study Assistant, dynamically customizing prompts based on user learning preferences.
- **Architecture Patterns**: Follows a Schema-First approach for type safety, uses Zod for runtime validation, and implements a `DatabaseStorage` class for database interactions.

### Feature Specifications
- **Dashboard**: Displays daily progress, upcoming events, AI Study Assistant access, and learning journey statistics.
- **Monthly Calendar**: Interactive, color-coded event management (create, edit, delete assignments, quizzes, tests, deadlines) with customizable subjects and month navigation.
- **Daily Task Planner**: Date-based task management with quick add, distinct views for incomplete/completed tasks, and live completion stats.
- **Flashcards System**: Organizes flashcards by customizable subjects into sets, supports bi-directional flipping, and full CRUD operations. (Backend complete, UI in development).
- **Streak Tracking**: Automatically tracks daily task completion, calculates current streaks, and visualizes productive days. (Backend complete, UI in development).
- **AI Study Assistant**:
    - **Subject Modes**: Offers four specialized modes: Math & Science, Writing, Social Studies, and Coding.
    - **Personalized Learning**: Adaptive AI with customizable explanation styles (step-by-step, analogies, visual examples, concise, Socratic), complexity levels (beginner, intermediate, advanced), and custom instructions, configurable per subject.
    - **Conversation Management**: Supports multiple, switchable, and deletable chat conversations per subject with context retention.
    - **Educational Focus**: Guides students to understand concepts rather than providing direct answers.

### System Design Choices
- **Data Persistence**: All user data (calendar events, tasks, AI chat history, subjects, flashcards, streaks, preferences) persists using PostgreSQL.
- **API Endpoints**: Comprehensive RESTful API for all features, including CRUD operations for subjects, calendar events, tasks, flashcards, streaks, AI conversations, messages, and learning preferences.
- **Chat Message Ordering**: Utilizes an auto-incrementing sequence column for deterministic chronological message ordering in AI conversations.
- **Optimistic Updates**: Implemented for a responsive UI experience, especially for deletions.

## External Dependencies
- **PostgreSQL (Neon)**: Cloud-hosted relational database for all application data.
- **Google Gemini 2.5 Flash API**: Powers the AI Study Assistant, providing free and intelligent AI capabilities.
- **Replit Auth**: Planned for user authentication.