import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getChatResponse } from "./openai";
import {
  insertCalendarEventSchema,
  insertTaskSchema,
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

  // AI Study Chat API
  app.post("/api/study/chat", async (req, res) => {
    try {
      const { subject, message, history } = req.body as {
        subject: AISubject;
        message: string;
        history: Array<{ role: "user" | "assistant"; content: string }>;
      };

      if (!subject || !message) {
        return res.status(400).json({ error: "Subject and message are required" });
      }

      // Get AI response
      const reply = await getChatResponse(subject, history);

      // Store the conversation in memory
      const timestamp = new Date().toISOString();
      await storage.createChatMessage({
        role: "user",
        content: message,
        subject,
        timestamp,
      });
      await storage.createChatMessage({
        role: "assistant",
        content: reply,
        subject,
        timestamp,
      });

      res.json({ reply });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
