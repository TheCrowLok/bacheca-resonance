import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary"; // Importiamo Cloudinary

// Configurazione Cloudinary usando le tue variabili di Render
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Usiamo la memoria RAM invece del disco fisso (così Render non cancella nulla)
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  
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

  // ROTTA UPLOAD AGGIORNATA PER CLOUDINARY
  app.post(api.upload.create.path, upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    try {
      // Trasformiamo l'immagine in un formato leggibile da Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      // Carichiamo su Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "bacheca_uploads",
      });

      // Restituiamo il link ETERNO di Cloudinary
      res.status(201).json({ imageUrl: result.secure_url });
    } catch (error) {
      console.error("Errore Cloudinary:", error);
      res.status(500).json({ message: "Impossibile caricare l'immagine" });
    }
  });

  // ROTTA DELETE PER ADMIN (Modalità Dio)
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
