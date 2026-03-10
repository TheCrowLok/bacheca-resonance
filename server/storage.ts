import { db } from "./db";
import { posts, type Post, type InsertPost } from "@shared/schema";

export interface IStorage {
  getPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
}

export class DatabaseStorage implements IStorage {
  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }
}

export const storage = new DatabaseStorage();
