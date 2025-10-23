import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getChatResponse } from "./gemini";
import {
  insertCalendarEventSchema,
  insertTaskSchema,
  insertConversationSchema,
  insertLearningPreferenceSchema,
  type AISubject,
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

  // AI Study Conversations API
  app.get("/api/study/conversations/:subject", async (req, res) => {
    try {
      const { subject } = req.params;
      const conversations = await storage.getConversations(subject);
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
      const { conversationId, subject, message, history } = req.body as {
        conversationId: string;
        subject: AISubject;
        message: string;
        history: Array<{ role: "user" | "assistant"; content: string }>;
      };

      if (!conversationId || !subject || !message) {
        return res.status(400).json({ error: "ConversationId, subject, and message are required" });
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
      const preferences = await storage.getLearningPreference(subject);
      
      // Get AI response with personalized preferences
      const reply = await getChatResponse(subject, history, preferences ? {
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
  app.get("/api/preferences/:subject", async (req, res) => {
    try {
      const { subject } = req.params;
      const preference = await storage.getLearningPreference(subject);
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

  const httpServer = createServer(app);

  return httpServer;
}
