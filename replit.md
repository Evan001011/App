# Studently - Student Productivity Platform

## Overview
Studently is a comprehensive productivity and learning platform designed by students, for students. It combines a monthly calendar, daily task planner, and AI-powered study assistant to help students stay organized and engaged in their learning.

## Mission
Help students learn how to learn through better organization, structured planning, and thoughtful AI guidance that encourages critical thinking rather than providing quick answers.

## Core Features

### 1. Dashboard
- **Today's Progress**: Visual progress bar showing task completion rate
- **Upcoming Events**: Quick view of calendar events
- **AI Study Assistant**: Direct access to subject-specific tutoring powered by Google Gemini
- **Learning Journey Stats**: Overview of daily tasks, events, and completion rates

### 2. Monthly Calendar
- **Interactive Calendar Grid**: Monthly view with clickable date cells
- **Color-Coded Events**: Events distinguished by subject (Math, Science, Writing, Social Studies, Coding, Other)
- **Event Management**: Create, edit, and delete calendar events with descriptions
- **Event Types**: Support for assignments, quizzes, tests, and deadlines
- **Subject Legend**: Visual guide showing color coding for all subjects
- **Month Navigation**: Browse previous and future months

### 3. Daily Task Planner
- **Date-Based Tasks**: View and manage tasks for any specific date
- **Quick Add**: Fast task creation with Enter key support
- **Task States**: Separate views for incomplete and completed tasks
- **Task Management**: Mark complete/incomplete, delete tasks
- **Completion Stats**: Live tracking of tasks remaining and completed
- **Drag Indicators**: Visual grip handles for future drag-and-drop functionality

### 4. AI Study Assistant
- **Powered by Google Gemini 2.5 Flash**: Free, fast, and intelligent AI model
- **Four Subject Modes**:
  - **Math & Science**: Step-by-step problem-solving guidance
  - **Writing**: Brainstorming, outlining, and revision help
  - **Social Studies**: Understanding events, causes, and connections
  - **Coding**: Logic, debugging, and algorithmic thinking
- **Conversational Interface**: Chat-based interaction with subject-specific AI tutors
- **Context Retention**: Maintains conversation history for coherent guidance
- **Educational Focus**: Guides students to understand concepts rather than providing direct answers
- **Generous Free Tier**: 15 requests/minute, 1,500/day, 1 million/month

## Technical Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Wouter for routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Theme**: Light/Dark mode support with persistent storage
- **Design System**: 
  - Primary color: Vibrant blue (HSL 250 100% 60%)
  - Subject colors: Math (blue), Science (green), Writing (purple), Social Studies (orange), Coding (pink)
  - Typography: Inter for UI, JetBrains Mono for code
  - Consistent spacing and responsive design

### Backend (Express + TypeScript)
- **Server**: Express.js with TypeScript
- **Storage**: In-memory storage (MemStorage) for MVP
- **AI Integration**: Google Gemini 2.5 Flash (free) with subject-specific system prompts
- **API Routes**:
  - `/api/calendar` - Calendar events CRUD
  - `/api/tasks` - Tasks CRUD
  - `/api/study/chat` - AI chat responses

### Data Models
- **CalendarEvent**: title, description, date, subject, eventType
- **Task**: title, completed, date, order, subject
- **ChatMessage**: role, content, subject, timestamp

## API Endpoints

### Calendar Events
- `GET /api/calendar/:year/:month` - Get events for specific month
- `GET /api/calendar/upcoming` - Get upcoming events (next 10)
- `POST /api/calendar` - Create new event
- `PATCH /api/calendar/:id` - Update event
- `DELETE /api/calendar/:id` - Delete event

### Tasks
- `GET /api/tasks/:date` - Get tasks for specific date
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task (toggle complete, etc.)
- `DELETE /api/tasks/:id` - Delete task

### AI Study
- `POST /api/study/chat` - Send message to AI tutor and get response

## Environment Variables
- `GEMINI_API_KEY` - Free Google Gemini API key for AI study assistant (get at https://ai.google.dev/)
- `SESSION_SECRET` - Session secret for Express

## Pages and Routes
- `/` - Dashboard (home page with overview)
- `/calendar` - Monthly calendar view
- `/tasks` - Daily task planner
- `/study` - AI study assistant

## User Experience Highlights
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Dark Mode**: Full dark mode support across all pages
- **Loading States**: Skeleton states and loading indicators
- **Empty States**: Encouraging messages when no data exists
- **Toast Notifications**: Success/error feedback for user actions
- **Keyboard Shortcuts**: Enter to submit forms, Shift+Enter for new lines

## Development Notes
- Built with Schema-First approach for type safety
- Uses Zod for runtime validation
- Follows shadcn component patterns
- Implements hover-elevate and active-elevate-2 for interactions
- Maintains consistent spacing (p-2, p-4, p-6 system)
- All interactive elements have proper data-testid attributes

## Deployment Instructions

### Publishing Your App
When you publish/deploy Studently to production:

1. **Configure Environment Variables:**
   - Go to the Deployments tab in Replit
   - Open your deployment settings
   - Add the following secrets:
     - `GEMINI_API_KEY`: Your free Google Gemini API key (get at https://ai.google.dev/)
     - `SESSION_SECRET`: A random string for session security

2. **Redeploy:**
   - After adding the secrets, redeploy your app
   - The AI Study features will now work in production

3. **Verify:**
   - Test all AI subject modes to ensure they're working
   - Check that calendar and tasks persist correctly

**Important:** Development and production environments have separate secret configurations. Secrets set in development won't automatically transfer to production.

**Why Gemini?** Google Gemini 2.5 Flash is completely free with generous limits (15 requests/minute, 1,500/day, 1 million/month), making it perfect for student projects!

## Future Enhancements (Next Phase)
- AI chat streaming responses for better UX (currently returns full responses)
- User authentication with Replit Auth
- Persistent database storage
- Smart reminders based on study patterns
- Spaced repetition for topic review
- Calendar import/export (Google Calendar, iCal)
- Subject-specific progress tracking
- Study session analytics
- Advanced task reordering with keyboard shortcuts

## Project Structure
```
client/
  src/
    components/     # Reusable UI components (dialogs, nav, theme)
    pages/          # Page components (dashboard, calendar, tasks, study)
    lib/            # Utilities and query client
server/
  routes.ts         # API endpoint definitions
  storage.ts        # In-memory storage implementation
  openai.ts         # OpenAI integration with subject prompts
shared/
  schema.ts         # Shared TypeScript types and Zod schemas
```

## Notes
- The app uses in-memory storage, so data resets on server restart
- AI responses are powered by Google Gemini 2.5 Flash (free!) with educational system prompts
- Each subject mode has tailored guidance to encourage learning
- The design follows modern productivity app aesthetics (Linear, Notion inspired)
- Gemini provides faster responses than OpenAI and is completely free for development
