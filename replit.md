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
- **Multiple Conversations**: Create, manage, and switch between multiple chat conversations per subject
- **Conversation Management**: 
  - Create new conversations with auto-generated titles
  - Delete old conversations to stay organized
  - Switch between conversations to track different topics
  - Each subject maintains separate conversation history
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
- **Database**: PostgreSQL (Neon) with Drizzle ORM for full data persistence
- **Storage**: DatabaseStorage class implementing IStorage interface with Drizzle queries
- **AI Integration**: Google Gemini 2.5 Flash (free) with subject-specific system prompts
- **API Routes**:
  - `/api/calendar` - Calendar events CRUD
  - `/api/tasks` - Tasks CRUD
  - `/api/study/conversations` - Conversations CRUD
  - `/api/study/messages/:conversationId` - Retrieve chat history for conversation
  - `/api/study/chat` - AI chat responses

### Database Schema (PostgreSQL + Drizzle)
- **calendar_events**: id (uuid), title, description, date, subject, eventType
- **tasks**: id (uuid), title, completed, date, order, subject
- **conversations**: id (uuid), subject, title, createdAt
  - Stores conversation metadata for each subject
  - Subject can be: math_science, writing, social_studies, coding
- **chat_messages**: id (uuid), conversationId (foreign key), sequence (serial), role, content, timestamp
  - conversationId references conversations(id) with ON DELETE CASCADE
  - sequence column ensures deterministic chronological ordering
  - sorted by sequence to guarantee user/assistant message order

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
- `GET /api/study/conversations/:subject` - Get all conversations for a subject
- `POST /api/study/conversations` - Create new conversation
- `DELETE /api/study/conversations/:id` - Delete conversation (cascades to messages)
- `GET /api/study/messages/:conversationId` - Get chat history for conversation
- `POST /api/study/chat` - Send message to AI tutor and get response (requires conversationId, also saves both user and assistant messages to database)

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

## Recent Changes (October 2025)
- ✅ **Database Migration Complete**: Migrated from in-memory storage to PostgreSQL with Drizzle ORM
- ✅ **Full Data Persistence**: Calendar events, tasks, and AI chat history now persist across sessions and deployments
- ✅ **Chat Message Ordering Fix**: Added auto-incrementing sequence column to ensure deterministic chronological message order
- ✅ **Multiple Conversations**: Students can now create, manage, and switch between multiple chat conversations per subject, making it easier to organize different study topics

## Future Enhancements (Next Phase)
- AI chat streaming responses for better UX (currently returns full responses)
- User authentication with Replit Auth
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
  db.ts             # PostgreSQL database connection (Neon + Drizzle)
  routes.ts         # API endpoint definitions
  storage.ts        # DatabaseStorage implementation with Drizzle queries
  gemini.ts         # Google Gemini AI integration with subject prompts
shared/
  schema.ts         # Drizzle schema definitions and Zod validation schemas
```

## Notes
- Data persists across sessions using PostgreSQL database (Neon-hosted)
- AI responses powered by Google Gemini 2.5 Flash (free!) with educational system prompts
- Each subject mode has tailored guidance to encourage learning
- Chat messages use auto-incrementing sequence for guaranteed chronological order
- Design follows modern productivity app aesthetics (Linear, Notion inspired)
- Gemini provides faster responses than OpenAI and is completely free for development
