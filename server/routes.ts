import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getChatResponse } from "./gemini";
import {
  insertCalendarEventSchema,
  insertTaskSchema,
  insertConversationSchema,
  insertLearningPreferenceSchema,
  insertSubjectSchema,
  insertFlashcardSetSchema,
  insertFlashcardSchema,
  type AICategory,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Calendar Events API
  app.get("/api/calendar/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const events = await storage.getCalendarEvents(year, month);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });

  app.get("/api/calendar/upcoming", async (req, res) => {
    try {
      const events = await storage.getUpcomingEvents(10);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming events" });
    }
  });

  app.post("/api/calendar", async (req, res) => {
    try {
      const validated = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(validated);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.patch("/api/calendar/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateCalendarEvent(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/calendar/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCalendarEvent(id);
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Tasks API
  app.get("/api/tasks/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const tasks = await storage.getTasksByDate(date);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validated = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validated);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateTask(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Subjects API
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const validated = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(validated);
      res.status(201).json(subject);
    } catch (error) {
      res.status(400).json({ error: "Invalid subject data" });
    }
  });

  app.patch("/api/subjects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateSubject(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSubject(id);
      if (!deleted) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subject" });
    }
  });

  // AI Study Conversations API
  app.get("/api/study/conversations/:subjectId", async (req, res) => {
    try {
      const { subjectId } = req.params;
      const conversations = await storage.getConversations(subjectId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/study/conversations", async (req, res) => {
    try {
      const validated = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validated);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  app.delete("/api/study/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteConversation(id);
      if (!deleted) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // AI Study Messages API
  app.get("/api/study/messages/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getChatMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/study/chat", async (req, res) => {
    try {
      const { conversationId, subjectId, aiCategory, message, history } = req.body as {
        conversationId: string;
        subjectId: string;
        aiCategory: AICategory;
        message: string;
        history: Array<{ role: "user" | "assistant"; content: string }>;
      };

      if (!conversationId || !subjectId || !aiCategory || !message) {
        return res.status(400).json({ error: "ConversationId, subjectId, aiCategory, and message are required" });
      }

      // Store user message first with current timestamp
      const userTimestamp = new Date().toISOString();
      await storage.createChatMessage({
        conversationId,
        role: "user",
        content: message,
        timestamp: userTimestamp,
      });

      // Fetch learning preferences for this subject
      const preferences = await storage.getLearningPreference(subjectId);
      
      // Get AI response with personalized preferences
      const reply = await getChatResponse(aiCategory, history, preferences ? {
        explanationStyle: preferences.explanationStyle,
        complexityLevel: preferences.complexityLevel,
        customInstructions: preferences.customInstructions,
      } : undefined);

      // Store assistant message with its own timestamp to ensure chronological ordering
      const assistantTimestamp = new Date().toISOString();
      await storage.createChatMessage({
        conversationId,
        role: "assistant",
        content: reply,
        timestamp: assistantTimestamp,
      });

      res.json({ reply });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // Learning Preferences API
  app.get("/api/preferences/:subjectId", async (req, res) => {
    try {
      const { subjectId } = req.params;
      const preference = await storage.getLearningPreference(subjectId);
      if (!preference) {
        return res.json(null);
      }
      res.json(preference);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch learning preferences" });
    }
  });

  app.put("/api/preferences", async (req, res) => {
    try {
      const validated = insertLearningPreferenceSchema.parse(req.body);
      const preference = await storage.upsertLearningPreference(validated);
      res.json(preference);
    } catch (error) {
      res.status(400).json({ error: "Invalid preference data" });
    }
  });

  // Flashcard Sets API
  app.get("/api/flashcards/sets", async (req, res) => {
    try {
      const sets = await storage.getAllFlashcardSets();
      res.json(sets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flashcard sets" });
    }
  });

  app.get("/api/flashcards/sets/subject/:subjectId", async (req, res) => {
    try {
      const { subjectId } = req.params;
      const sets = await storage.getFlashcardSets(subjectId);
      res.json(sets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flashcard sets" });
    }
  });

  app.post("/api/flashcards/sets", async (req, res) => {
    try {
      const validated = insertFlashcardSetSchema.parse(req.body);
      const set = await storage.createFlashcardSet(validated);
      res.status(201).json(set);
    } catch (error) {
      res.status(400).json({ error: "Invalid flashcard set data" });
    }
  });

  app.patch("/api/flashcards/sets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateFlashcardSet(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Flashcard set not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update flashcard set" });
    }
  });

  app.delete("/api/flashcards/sets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFlashcardSet(id);
      if (!deleted) {
        return res.status(404).json({ error: "Flashcard set not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete flashcard set" });
    }
  });

  // Flashcards API
  app.get("/api/flashcards/:setId", async (req, res) => {
    try {
      const { setId } = req.params;
      const cards = await storage.getFlashcards(setId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flashcards" });
    }
  });

  app.post("/api/flashcards", async (req, res) => {
    try {
      const validated = insertFlashcardSchema.parse(req.body);
      const card = await storage.createFlashcard(validated);
      res.status(201).json(card);
    } catch (error) {
      res.status(400).json({ error: "Invalid flashcard data" });
    }
  });

  app.patch("/api/flashcards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateFlashcard(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Flashcard not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update flashcard" });
    }
  });

  app.delete("/api/flashcards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFlashcard(id);
      if (!deleted) {
        return res.status(404).json({ error: "Flashcard not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete flashcard" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
