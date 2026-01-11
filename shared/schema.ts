import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Daily Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastCompletedAt: timestamp("last_completed_at"),
  isSystem: boolean("is_system").default(false), // To identify the default required tasks
});

// Gym Logs for specific tracking
export const gymLogs = pgTable("gym_logs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  pushupsCount: integer("pushups_count").default(0),
  bicepsSets: jsonb("biceps_sets").$type<{ completed: boolean; reps: number }[]>().default([]),
  shoulderSets: jsonb("shoulder_sets").$type<{ completed: boolean; reps: number }[]>().default([]),
});

export const insertUserSchema = createInsertSchema(users);
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, streak: true, lastCompletedAt: true });
export const insertGymLogSchema = createInsertSchema(gymLogs).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type GymLog = typeof gymLogs.$inferSelect;
export type InsertGymLog = z.infer<typeof insertGymLogSchema>;

// API Contract Types
export type LoginRequest = { username: string; password: string };
