# Studently - Student Productivity Platform

A comprehensive productivity and learning platform designed by students, for students. Combines a monthly calendar, daily task planner, and AI-powered study assistant to help students stay organized and engaged in their learning.

![Studently](./generated-icon.png)

## 🌟 Features

### 📅 Monthly Calendar
- Interactive calendar grid with clickable date cells
- Color-coded events by subject (Math, Science, Writing, Social Studies, Coding)
- Event types: Assignments, Quizzes, Tests, and Deadlines
- Month navigation and event management

### ✅ Daily Task Planner
- Date-based task management
- Quick task creation with Enter key
- Mark tasks as complete/incomplete
- Live completion stats and progress tracking

### 🤖 AI Study Assistant
**Powered by Google Gemini 2.5 Flash (Free!)**

- **Four Subject Modes**: Math & Science, Writing, Social Studies, and Coding
- **Personalized Learning**: Customize how the AI teaches you
  - Explanation styles: Step-by-step, Analogies, Visual examples, Concise, Socratic
  - Complexity levels: Beginner, Intermediate, Advanced
  - Custom instructions for your unique learning preferences
- **Multiple Conversations**: Organize different topics in separate chats
- **Educational Focus**: Guides you to understand concepts, not just providing answers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or use a free hosted option like Neon, Supabase, or Railway)
- Google Gemini API key ([Get one free](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studently.git
   cd studently
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GEMINI_API_KEY`: Your free Google Gemini API key
   - `SESSION_SECRET`: A random string for session encryption

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 🗄️ Database Setup

### Option 1: Local PostgreSQL
Install PostgreSQL locally and create a database:
```sql
CREATE DATABASE studently;
```

### Option 2: Free Hosted Database
Use a free PostgreSQL hosting service:
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Supabase](https://supabase.com/) - Free tier with 500MB
- [Railway](https://railway.app/) - Free $5 monthly credit
- [ElephantSQL](https://www.elephantsql.com/) - Free 20MB

Copy the connection string to your `.env` file as `DATABASE_URL`.

## 🔑 Getting a Free Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key (it's completely free!)
4. Copy the key to your `.env` file

**Free Tier Limits:**
- 15 requests/minute
- 1,500 requests/day
- 1 million requests/month

More than enough for personal use!

## 📦 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Google Gemini 2.5 Flash
- **State Management**: TanStack Query
- **Routing**: Wouter

## 🚢 Deployment

### Deploy to Vercel (Recommended for Frontend)
This app has a backend, so you'll need to deploy separately or use a platform that supports full-stack apps.

### Deploy to Railway (Full-Stack)
1. Create a [Railway](https://railway.app/) account
2. Create a new project from GitHub
3. Add a PostgreSQL database
4. Set environment variables in Railway dashboard
5. Deploy!

### Deploy to Render (Full-Stack)
1. Create a [Render](https://render.com/) account
2. Create a new Web Service from GitHub
3. Add a PostgreSQL database
4. Set environment variables
5. Deploy!

### Deploy on Replit (Easiest)
This project is already configured for Replit:
1. Click "Run" to start the development server
2. Click "Publish" to deploy to production
3. Add your environment variables in the Secrets/Deployments tab

## 📁 Project Structure

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

## 🔧 Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run db:push` - Sync database schema
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

**Made with ❤️ by students, for students**
