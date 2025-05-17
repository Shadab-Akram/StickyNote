import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for notes (future implementation for cloud sync)
  app.get("/api/notes", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const notes = await storage.getNotesByUserId(req.session.userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const note = await storage.createNote({
        ...req.body,
        userId: req.session.userId
      });
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const noteId = parseInt(req.params.id);
      const note = await storage.updateNote(noteId, req.body);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const noteId = parseInt(req.params.id);
      await storage.deleteNote(noteId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
