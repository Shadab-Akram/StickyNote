import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").default(""),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  color: text("color").notNull(),
  zIndex: integer("z_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User insert schema
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Note insert schema
export const insertNoteSchema = createInsertSchema(notes).pick({
  userId: true,
  content: true,
  x: true,
  y: true,
  width: true,
  height: true,
  color: true,
  zIndex: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Client-side note type (with string ID for client-side usage)
export const noteSchema = z.object({
  id: z.string(),
  content: z.string().default(""),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string(),
  zIndex: z.number(),
  createdAt: z.string(),
  userId: z.number().optional(),
});

// For converting between database and client models
export function dbNoteToClientNote(note: Note): ClientNote {
  return {
    id: note.id.toString(),
    content: note.content || "",
    x: note.x,
    y: note.y,
    width: note.width,
    height: note.height,
    color: note.color,
    zIndex: note.zIndex,
    createdAt: note.createdAt.toISOString(),
    userId: note.userId || undefined
  };
}

export function clientNoteToDbNote(note: ClientNote, userId?: number): InsertNote {
  return {
    userId: userId || null,
    content: note.content,
    x: note.x,
    y: note.y, 
    width: note.width,
    height: note.height,
    color: note.color,
    zIndex: note.zIndex
  };
}

export type ClientNote = z.infer<typeof noteSchema>;
