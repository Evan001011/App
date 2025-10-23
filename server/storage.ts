// DON'T DELETE THIS COMMENT
// Updated to use PostgreSQL database with Drizzle ORM (following javascript_database blueprint)
import {
  type CalendarEvent,
  type InsertCalendarEvent,
  type Task,
  type InsertTask,
  type ChatMessage,
  type InsertChatMessage,
  type Conversation,
  type InsertConversation,
  type LearningPreference,
  type InsertLearningPreference,
  calendarEvents,
  tasks,
  chatMessages,
  conversations,
  learningPreferences,
} from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte, and, desc } from "drizzle-orm";

export interface IStorage {
  // Calendar Events
  getCalendarEvents(year: number, month: number): Promise<CalendarEvent[]>;
  getUpcomingEvents(limit?: number): Promise<CalendarEvent[]>;
  getCalendarEvent(id: string): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: string): Promise<boolean>;

  // Tasks
  getTasksByDate(date: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Conversations
  getConversations(subject: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  deleteConversation(id: string): Promise<boolean>;

  // Chat Messages
  getChatMessages(conversationId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Learning Preferences
  getLearningPreference(subject: string): Promise<LearningPreference | undefined>;
  upsertLearningPreference(preference: InsertLearningPreference): Promise<LearningPreference>;
  deleteLearningPreference(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Calendar Events
  async getCalendarEvents(year: number, month: number): Promise<CalendarEvent[]> {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
    
    const events = await db
      .select()
      .from(calendarEvents)
      .where(and(
        gte(calendarEvents.date, startDate),
        lte(calendarEvents.date, endDate)
      ))
      .orderBy(calendarEvents.date);
    
    return events;
  }

  async getUpcomingEvents(limit = 10): Promise<CalendarEvent[]> {
    const today = new Date().toISOString().split("T")[0];
    
    const events = await db
      .select()
      .from(calendarEvents)
      .where(gte(calendarEvents.date, today))
      .orderBy(calendarEvents.date)
      .limit(limit);
    
    return events;
  }

  async getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.id, id));
    return event || undefined;
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db
      .insert(calendarEvents)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    const [updated] = await db
      .update(calendarEvents)
      .set(updates)
      .where(eq(calendarEvents.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    const result = await db
      .delete(calendarEvents)
      .where(eq(calendarEvents.id, id))
      .returning();
    return result.length > 0;
  }

  // Tasks
  async getTasksByDate(date: string): Promise<Task[]> {
    const taskList = await db
      .select()
      .from(tasks)
      .where(eq(tasks.date, date))
      .orderBy(tasks.order);
    return taskList;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    return result.length > 0;
  }

  // Conversations
  async getConversations(subject: string): Promise<Conversation[]> {
    const convos = await db
      .select()
      .from(conversations)
      .where(eq(conversations.subject, subject))
      .orderBy(desc(conversations.createdAt));
    return convos;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [convo] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return convo || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [convo] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return convo;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const result = await db
      .delete(conversations)
      .where(eq(conversations.id, id))
      .returning();
    return result.length > 0;
  }

  // Chat Messages
  async getChatMessages(conversationId: string, limit = 50): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(desc(chatMessages.sequence))
      .limit(limit);
    
    // Return in chronological order (oldest first)
    return messages.reverse();
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Learning Preferences
  async getLearningPreference(subject: string): Promise<LearningPreference | undefined> {
    const [pref] = await db
      .select()
      .from(learningPreferences)
      .where(eq(learningPreferences.subject, subject));
    return pref || undefined;
  }

  async upsertLearningPreference(insertPreference: InsertLearningPreference): Promise<LearningPreference> {
    // First try to find existing preference for this subject
    const existing = await this.getLearningPreference(insertPreference.subject);
    
    if (existing) {
      // Update existing
      const [updated] = await db
        .update(learningPreferences)
        .set({ ...insertPreference, updatedAt: new Date().toISOString() })
        .where(eq(learningPreferences.id, existing.id))
        .returning();
      return updated;
    } else {
      // Insert new
      const [created] = await db
        .insert(learningPreferences)
        .values({ ...insertPreference, updatedAt: new Date().toISOString() })
        .returning();
      return created;
    }
  }

  async deleteLearningPreference(id: string): Promise<boolean> {
    const result = await db
      .delete(learningPreferences)
      .where(eq(learningPreferences.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
