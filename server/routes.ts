import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import express from "express";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

async function seedDatabase() {
  const existingPosts = await storage.getPosts();
  if (existingPosts.length === 0) {
    await storage.createPost({ nickname: "Alice", message: "Hello everyone! This is the first post.", imageUrl: null });
    await storage.createPost({ nickname: "Bob", message: "Such a cool notice board! Thanks for setting this up.", imageUrl: null });
    await storage.createPost({ nickname: "Charlie", message: "Don't forget the meeting on Friday at 3 PM!", imageUrl: null });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Ensure uploads directory exists
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  // Serve uploaded files statically
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
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.upload.create.path, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl });
  });

  // Seed the database
  seedDatabase().catch(console.error);

  return httpServer;
}
