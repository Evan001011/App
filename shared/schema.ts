import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, serial, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Subjects Schema - User-created custom subjects
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull(), // hex color code
  createdAt: text("created_at").notNull(), // ISO string
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
});

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

// Calendar Events Schema
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(), // YYYY-MM-DD format
  subjectId: varchar("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
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
  subjectId: varchar("subject_id").references(() => subjects.id, { onDelete: "set null" }),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// AI Conversations Schema
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: text("created_at").notNull(), // ISO string
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// AI Chat Messages Schema
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  sequence: serial("sequence").notNull(),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(), // ISO string
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  sequence: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Event types
export const eventTypes = ["assignment", "quiz", "test", "deadline"] as const;
export type EventType = typeof eventTypes[number];

// Learning Preferences Schema
export const explanationStyles = ["step_by_step", "analogies", "visual_examples", "concise", "socratic"] as const;
export type ExplanationStyle = typeof explanationStyles[number];

export const complexityLevels = ["beginner", "intermediate", "advanced"] as const;
export type ComplexityLevel = typeof complexityLevels[number];

export const learningPreferences = pgTable("learning_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  explanationStyle: text("explanation_style"), // step_by_step, analogies, visual_examples, concise, socratic
  complexityLevel: text("complexity_level"), // beginner, intermediate, advanced
  customInstructions: text("custom_instructions"), // Free-form text for personalization
  updatedAt: text("updated_at").notNull(), // ISO string
});

export const insertLearningPreferenceSchema = createInsertSchema(learningPreferences).omit({
  id: true,
});

export type InsertLearningPreference = z.infer<typeof insertLearningPreferenceSchema>;
export type LearningPreference = typeof learningPreferences.$inferSelect;

// Flashcard Sets Schema
export const flashcardSets = pgTable("flashcard_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(), // ISO string
});

export const insertFlashcardSetSchema = createInsertSchema(flashcardSets).omit({
  id: true,
});

export type InsertFlashcardSet = z.infer<typeof insertFlashcardSetSchema>;
export type FlashcardSet = typeof flashcardSets.$inferSelect;

// Flashcards Schema
export const flashcards = pgTable("flashcards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  setId: varchar("set_id").notNull().references(() => flashcardSets.id, { onDelete: "cascade" }),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  order: integer("order").notNull().default(0),
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
});

export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
