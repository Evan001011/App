import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Calendar Events Schema
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(), // YYYY-MM-DD format
  subject: text("subject").notNull(), // math, science, writing, social_studies, coding, other
  eventType: text("event_type").notNull(), // assignment, quiz, test, deadline
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
});

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// Tasks Schema
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  date: text("date").notNull(), // YYYY-MM-DD format
  order: integer("order").notNull().default(0),
  subject: text("subject"), // optional subject category
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// AI Chat Messages Schema
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sequence: serial("sequence").notNull(),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  subject: text("subject").notNull(), // math_science, writing, social_studies, coding
  timestamp: text("timestamp").notNull(), // ISO string
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  sequence: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Subject types for color coding
export const subjects = ["math", "science", "writing", "social_studies", "coding", "other"] as const;
export type Subject = typeof subjects[number];

export const eventTypes = ["assignment", "quiz", "test", "deadline"] as const;
export type EventType = typeof eventTypes[number];

export const aiSubjects = ["math_science", "writing", "social_studies", "coding"] as const;
export type AISubject = typeof aiSubjects[number];
