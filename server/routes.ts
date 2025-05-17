import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { dbNoteToClientNote } from "@shared/schema";

// Extend the Express Request type to include session
declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

// Express middleware for session authentication
const requireAuth = (req: Request, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "sticky-notes-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
    })
  );

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid data",
          errors: validationResult.error.errors 
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Create new user
      const user = await storage.createUser(req.body);
      
      // Set session data
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.status(201).json({ 
        message: "User registered successfully",
        user: { 
          id: user.id, 
          username: user.username 
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session data
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({ 
        message: "Login successful", 
        user: { 
          id: user.id, 
          username: user.username 
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.userId) {
      return res.json({ authenticated: false });
    }
    
    res.json({ 
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username
      }
    });
  });

  // Notes API routes
  app.get("/api/notes", requireAuth, async (req, res) => {
    try {
      const dbNotes = await storage.getNotesByUserId(req.session.userId!);
      
      // Convert DB notes to client notes
      const clientNotes = dbNotes.map(dbNoteToClientNote);
      
      res.json(clientNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to retrieve notes" });
    }
  });

  app.post("/api/notes", requireAuth, async (req, res) => {
    try {
      // Create note with authenticated user ID
      const insertNote = {
        ...req.body,
        userId: req.session.userId!,
        content: req.body.content || ""
      };
      
      const dbNote = await storage.createNote(insertNote);
      const clientNote = dbNoteToClientNote(dbNote);
      
      res.status(201).json(clientNote);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      
      // Check if note exists and belongs to user
      const existingNote = await storage.getNote(noteId);
      if (!existingNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      if (existingNote.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to edit this note" });
      }
      
      const updatedDbNote = await storage.updateNote(noteId, req.body);
      if (!updatedDbNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      const clientNote = dbNoteToClientNote(updatedDbNote);
      res.json(clientNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      
      // Check if note exists and belongs to user
      const existingNote = await storage.getNote(noteId);
      if (!existingNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      if (existingNote.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to delete this note" });
      }
      
      await storage.deleteNote(noteId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
