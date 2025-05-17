import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

// Client-side note type (localStorage version)
export const noteSchema = z.object({
  id: z.string(),
  content: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string(),
  zIndex: z.number(),
  createdAt: z.string(),
});

export type ClientNote = z.infer<typeof noteSchema>;
