import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import express from "express";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  if (!fs.existsSync("uploads")) { fs.mkdirSync("uploads"); }
  app.use("/uploads", express.static("uploads"));

  app.get(api.posts.list.path, async (req, res) => {
    const allPosts = await storage.getPosts();
    res.status(200).json(allPosts);
  });

  app.post(api.posts.create.path, async (req, res) => {
    try {
      const input = api.posts.create.input.parse(req.body);
      const post = await storage.createPost(input);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.upload.create.path, upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No image file uploaded" });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl });
  });

  // ROTTA DELETE PER ADMIN
  app.delete("/api/posts/:id", async (req, res) => {
    const adminPassword = req.headers["x-admin-password"];
    if (adminPassword !== "admin123") {
      return res.status(403).json({ message: "Non autorizzato" });
    }
    const id = parseInt(req.params.id);
    await storage.deletePost(id);
    res.sendStatus(204);
  });

  return httpServer;
}
