import { db } from "./db";
import { posts, type Post, type InsertPost } from "@shared/schema";
import { eq, asc } from "drizzle-orm"; // Aggiunto 'asc' per l'ordine

export interface IStorage {
  getPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPosts(): Promise<Post[]> {
    // Ora chiediamo esplicitamente di ordinarli per data di creazione (dal più vecchio)
    return await db.select().from(posts).orderBy(asc(posts.createdAt));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }
}

export const storage = new DatabaseStorage();
