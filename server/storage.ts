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
  type Subject,
  type InsertSubject,
  type FlashcardSet,
  type InsertFlashcardSet,
  type Flashcard,
  type InsertFlashcard,
  calendarEvents,
  tasks,
  chatMessages,
  conversations,
  learningPreferences,
  subjects,
  flashcardSets,
  flashcards,
} from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<Subject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;

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
  getConversations(subjectId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  deleteConversation(id: string): Promise<boolean>;

  // Chat Messages
  getChatMessages(conversationId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Learning Preferences
  getLearningPreference(subjectId: string): Promise<LearningPreference | undefined>;
  upsertLearningPreference(preference: InsertLearningPreference): Promise<LearningPreference>;
  deleteLearningPreference(id: string): Promise<boolean>;

  // Flashcard Sets
  getFlashcardSets(subjectId: string): Promise<FlashcardSet[]>;
  getAllFlashcardSets(): Promise<FlashcardSet[]>;
  getFlashcardSet(id: string): Promise<FlashcardSet | undefined>;
  createFlashcardSet(set: InsertFlashcardSet): Promise<FlashcardSet>;
  updateFlashcardSet(id: string, set: Partial<FlashcardSet>): Promise<FlashcardSet | undefined>;
  deleteFlashcardSet(id: string): Promise<boolean>;

  // Flashcards
  getFlashcards(setId: string): Promise<Flashcard[]>;
  getFlashcard(id: string): Promise<Flashcard | undefined>;
  createFlashcard(card: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: string, card: Partial<Flashcard>): Promise<Flashcard | undefined>;
  deleteFlashcard(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const subjectList = await db
      .select()
      .from(subjects)
      .orderBy(asc(subjects.createdAt));
    return subjectList;
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    const [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id));
    return subject || undefined;
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db
      .insert(subjects)
      .values(insertSubject)
      .returning();
    return subject;
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | undefined> {
    const [updated] = await db
      .update(subjects)
      .set(updates)
      .where(eq(subjects.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSubject(id: string): Promise<boolean> {
    const result = await db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning();
    return result.length > 0;
  }

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
  async getConversations(subjectId: string): Promise<Conversation[]> {
    const convos = await db
      .select()
      .from(conversations)
      .where(eq(conversations.subjectId, subjectId))
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
  async getLearningPreference(subjectId: string): Promise<LearningPreference | undefined> {
    const [pref] = await db
      .select()
      .from(learningPreferences)
      .where(eq(learningPreferences.subjectId, subjectId));
    return pref || undefined;
  }

  async upsertLearningPreference(insertPreference: InsertLearningPreference): Promise<LearningPreference> {
    // First try to find existing preference for this subject
    const existing = await this.getLearningPreference(insertPreference.subjectId);
    
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

  // Flashcard Sets
  async getFlashcardSets(subjectId: string): Promise<FlashcardSet[]> {
    const sets = await db
      .select()
      .from(flashcardSets)
      .where(eq(flashcardSets.subjectId, subjectId))
      .orderBy(desc(flashcardSets.createdAt));
    return sets;
  }

  async getAllFlashcardSets(): Promise<FlashcardSet[]> {
    const sets = await db
      .select()
      .from(flashcardSets)
      .orderBy(desc(flashcardSets.createdAt));
    return sets;
  }

  async getFlashcardSet(id: string): Promise<FlashcardSet | undefined> {
    const [set] = await db
      .select()
      .from(flashcardSets)
      .where(eq(flashcardSets.id, id));
    return set || undefined;
  }

  async createFlashcardSet(insertSet: InsertFlashcardSet): Promise<FlashcardSet> {
    const [set] = await db
      .insert(flashcardSets)
      .values(insertSet)
      .returning();
    return set;
  }

  async updateFlashcardSet(id: string, updates: Partial<FlashcardSet>): Promise<FlashcardSet | undefined> {
    const [updated] = await db
      .update(flashcardSets)
      .set(updates)
      .where(eq(flashcardSets.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFlashcardSet(id: string): Promise<boolean> {
    const result = await db
      .delete(flashcardSets)
      .where(eq(flashcardSets.id, id))
      .returning();
    return result.length > 0;
  }

  // Flashcards
  async getFlashcards(setId: string): Promise<Flashcard[]> {
    const cards = await db
      .select()
      .from(flashcards)
      .where(eq(flashcards.setId, setId))
      .orderBy(asc(flashcards.order));
    return cards;
  }

  async getFlashcard(id: string): Promise<Flashcard | undefined> {
    const [card] = await db
      .select()
      .from(flashcards)
      .where(eq(flashcards.id, id));
    return card || undefined;
  }

  async createFlashcard(insertCard: InsertFlashcard): Promise<Flashcard> {
    const [card] = await db
      .insert(flashcards)
      .values(insertCard)
      .returning();
    return card;
  }

  async updateFlashcard(id: string, updates: Partial<Flashcard>): Promise<Flashcard | undefined> {
    const [updated] = await db
      .update(flashcards)
      .set(updates)
      .where(eq(flashcards.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFlashcard(id: string): Promise<boolean> {
    const result = await db
      .delete(flashcards)
      .where(eq(flashcards.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
