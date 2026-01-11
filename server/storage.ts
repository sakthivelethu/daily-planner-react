import { users, tasks, gymLogs, type User, type InsertUser, type Task, type GymLog, type InsertGymLog } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  toggleTask(id: number): Promise<Task>;
  resetDailyTasks(): Promise<void>;
  
  getGymLog(date: string): Promise<GymLog | undefined>;
  getAllGymLogs(): Promise<GymLog[]>;
  updateGymLog(date: string, log: InsertGymLog): Promise<GymLog>;
  
  seedTasks(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(tasks.id);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async toggleTask(id: number): Promise<Task> {
    const task = await this.getTask(id);
    if (!task) throw new Error("Task not found");

    const now = new Date();
    const completed = !task.completed;
    
    // Simple streak logic: if completing today and wasn't completed today, increment streak
    // If uncompleting, decrement (optional, but keep simple for now)
    // For this MVP, we just toggle. Real streak logic needs date checking vs lastCompletedAt
    
    let streak = task.streak;
    if (completed) {
      streak += 1;
    } else {
      streak = Math.max(0, streak - 1);
    }

    const [updated] = await db.update(tasks)
      .set({ 
        completed, 
        streak,
        lastCompletedAt: completed ? now : task.lastCompletedAt 
      })
      .where(eq(tasks.id, id))
      .returning();
      
    return updated;
  }

  async resetDailyTasks(): Promise<void> {
    // This should be run via cron or on first request of the day
    // For MVP, we won't implement complex cron, but just exposing the method
    await db.update(tasks).set({ completed: false });
  }

  async getGymLog(date: string): Promise<GymLog | undefined> {
    const [log] = await db.select().from(gymLogs).where(eq(gymLogs.date, date));
    return log;
  }

  async getAllGymLogs(): Promise<GymLog[]> {
    return await db.select().from(gymLogs).orderBy(gymLogs.date);
  }

  async updateGymLog(date: string, log: InsertGymLog): Promise<GymLog> {
    const existing = await this.getGymLog(date);
    if (existing) {
      const [updated] = await db.update(gymLogs)
        .set({
          pushupsCount: log.pushupsCount,
          bicepsSets: log.bicepsSets as any,
          shoulderSets: log.shoulderSets as any
        })
        .where(eq(gymLogs.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(gymLogs)
        .values({ 
          date,
          pushupsCount: log.pushupsCount || 0,
          bicepsSets: (log.bicepsSets || []) as any,
          shoulderSets: (log.shoulderSets || []) as any
        })
        .returning();
      return created;
    }
  }

  async seedTasks(): Promise<void> {
    const existing = await this.getTasks();
    if (existing.length === 0) {
      const defaultTasks = [
        "GCP Certification",
        "DevOps Practice",
        "Learn C#",
        "Unity",
        "Unreal Engine",
        "Gym Workout"
      ];
      
      for (const title of defaultTasks) {
        await db.insert(tasks).values({
          title,
          isSystem: true,
          completed: false,
          streak: 0
        });
      }
    }
  }
}

export const storage = new DatabaseStorage();
