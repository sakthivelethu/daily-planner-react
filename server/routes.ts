import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth Setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "daily_planner_secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "Incorrect username." });
        const isValid = await comparePassword(password, user.password);
        if (!isValid) return done(null, false, { message: "Incorrect password." });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Seed Data
  // Ensure the requested user exists
  const sakthi = await storage.getUserByUsername("Sakthi");
  if (!sakthi) {
    const hashedPassword = await hashPassword("Sakthi@123");
    await storage.createUser({
      username: "Sakthi",
      password: hashedPassword,
    });
  }
  // Seed Tasks
  await storage.seedTasks();

  // Middleware to check auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth Routes
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });

  // Task Routes
  app.get(api.tasks.list.path, requireAuth, async (req: any, res) => {
    const lastReset = (req.session as any).lastReset;
    const today = new Date().toISOString().split('T')[0];
    
    if (lastReset !== today) {
      await storage.resetDailyTasks();
      (req.session as any).lastReset = today;
    }
    
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.patch(api.tasks.toggle.path, requireAuth, async (req, res) => {
    try {
      const updated = await storage.toggleTask(Number(req.params.id));
      res.json(updated);
    } catch (e) {
      res.status(404).json({ message: "Task not found" });
    }
  });

  // Gym Routes
  app.get(api.gym.get.path, requireAuth, async (req, res) => {
    // Get today's log (formatted YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    const log = await storage.getGymLog(today);
    // If no log exists yet, return a default empty structure without saving it yet
    res.json(log || { 
      id: 0, 
      date: today, 
      pushupsCount: 0, 
      bicepsSets: ["", "", ""], 
      shoulderSets: ["", "", ""] 
    });
  });

  app.post(api.gym.update.path, requireAuth, async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const log = await storage.updateGymLog(today, req.body);
    res.json(log);
  });

  app.get("/api/gym/history", requireAuth, async (req, res) => {
    const logs = await storage.getAllGymLogs();
    res.json(logs);
  });

  return httpServer;
}
