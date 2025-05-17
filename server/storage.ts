import { eq } from "drizzle-orm";
import { 
  notes, type Note, type InsertNote, 
  users, type User, type InsertUser
} from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Note operations
  getNotesByUserId(userId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<void>;
}

// In-memory storage for when database is not needed
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private notes: Map<number, Note>;
  private userIdCounter: number;
  private noteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.notes = new Map();
    this.userIdCounter = 1;
    this.noteIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async getNotesByUserId(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId
    );
  }
  
  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteIdCounter++;
    const now = new Date();
    const note: Note = { 
      ...insertNote, 
      id,
      title: insertNote.title || "Note",
      content: insertNote.content || "",
      userId: insertNote.userId || null,
      createdAt: now
    };
    this.notes.set(id, note);
    return note;
  }
  
  async updateNote(id: number, updates: Partial<Note>): Promise<Note | undefined> {
    const existingNote = this.notes.get(id);
    if (!existingNote) return undefined;
    
    const updatedNote = { ...existingNote, ...updates };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<void> {
    this.notes.delete(id);
  }
}

// PostgreSQL implementation using Drizzle
export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  async getNotesByUserId(userId: number): Promise<Note[]> {
    return db.select().from(notes).where(eq(notes.userId, userId));
  }
  
  async getNote(id: number): Promise<Note | undefined> {
    const result = await db.select().from(notes).where(eq(notes.id, id));
    return result.length ? result[0] : undefined;
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const result = await db.insert(notes).values({
      ...insertNote,
      content: insertNote.content || "",
      userId: insertNote.userId || null
    }).returning();
    return result[0];
  }
  
  async updateNote(id: number, updates: Partial<Note>): Promise<Note | undefined> {
    const result = await db
      .update(notes)
      .set(updates)
      .where(eq(notes.id, id))
      .returning();
    
    return result.length ? result[0] : undefined;
  }
  
  async deleteNote(id: number): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }
}

// Export the appropriate storage implementation
const useDatabase = true; // Set to true to use the database, false to use in-memory storage
export const storage = useDatabase ? new DbStorage() : new MemStorage();
