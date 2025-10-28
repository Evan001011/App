# Studently - Student Productivity Platform

A comprehensive productivity and learning platform designed by students, for students. Combines a monthly calendar, daily task planner, and AI-powered study assistant to help students stay organized and engaged in their learning.

## Features

### Monthly Calendar
- Interactive calendar grid with clickable date cells
- Color-coded events by subject (Math, Science, Writing, Social Studies, Coding)
- Event types: Assignments, Quizzes, Tests, and Deadlines
- Month navigation and event management

### Daily Task Planner
- Date-based task management
- Quick task creation with Enter key
- Mark tasks as complete/incomplete
- Live completion stats and progress tracking

### AI Study Assistant
**Powered by Google Gemini 2.5 Flash (Free!)**

- **Four Subject Modes**: Math & Science, Writing, Social Studies, and Coding
- **Personalized Learning**: Customize how the AI teaches you
  - Explanation styles: Step-by-step, Analogies, Visual examples, Concise, Socratic
  - Complexity levels: Beginner, Intermediate, Advanced
  - Custom instructions for your unique learning preferences
- **Multiple Conversations**: Organize different topics in separate chats
- **Educational Focus**: Guides you to understand concepts, not just providing answers

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Google Gemini 2.5 Flash
- **State Management**: TanStack Query
- **Routing**: Wouter

##  Project Structure

```
studently/
├── client/               # React frontend
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components (Dashboard, Calendar, Tasks, Study)
│       └── lib/         # Utilities and query client
├── server/              # Express backend
│   ├── db.ts           # PostgreSQL connection
│   ├── routes.ts       # API endpoints
│   ├── storage.ts      # Database operations
│   └── gemini.ts       # AI integration
└── shared/
    └── schema.ts       # Database schema and types
```

## License

This project is open source and available under the MIT License.

## Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Icons from [Lucide](https://lucide.dev/)
- Configured GitHub–Replit integration for live hosting
  

**Made by students, for students**
