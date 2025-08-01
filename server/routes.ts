import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertApplicationSchema, insertCadetSchema } from "@shared/schema";
import { z } from "zod";
import { analyzeApplication, generateCadetInsights } from "./gemini";
import { checkSystemHealth } from "./health";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // System health check
  app.get('/api/health', async (req, res) => {
    try {
      const health = await checkSystemHealth();
      res.json(health);
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({ message: "Health check failed" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const campus = req.query.campus as string || user?.campus;
      const metrics = await storage.getDashboardMetrics(campus);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Recent activities
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const campus = req.query.campus as string || user?.campus;
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivities(campus, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Cadets routes
  app.get('/api/cadets', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const campus = req.query.campus as string || user?.campus;
      const cadets = await storage.getCadets(campus);
      res.json(cadets);
    } catch (error) {
      console.error("Error fetching cadets:", error);
      res.status(500).json({ message: "Failed to fetch cadets" });
    }
  });

  // Campus-specific cadet routes to avoid parsing issues
  app.get('/api/cadets/:campus', isAuthenticated, async (req: any, res) => {
    try {
      const campus = req.params.campus;
      // Check if this is actually a numeric ID
      if (/^\d+$/.test(campus)) {
        const id = parseInt(campus);
        const cadet = await storage.getCadet(id);
        if (!cadet) {
          return res.status(404).json({ message: "Cadet not found" });
        }
        return res.json(cadet);
      }
      
      // Otherwise treat as campus filter
      const cadets = await storage.getCadets(campus);
      res.json(cadets);
    } catch (error) {
      console.error("Error fetching cadet:", error);
      res.status(500).json({ message: "Failed to fetch cadet" });
    }
  });

  app.post('/api/cadets', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertCadetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid cadet data", 
          errors: validation.error.errors 
        });
      }

      const user = await storage.getUser(req.user.claims.sub);
      const cadetData = {
        ...validation.data,
        campus: validation.data.campus || user?.campus || 'oahu',
      };

      const cadet = await storage.createCadet(cadetData);
      res.status(201).json(cadet);
    } catch (error) {
      console.error("Error creating cadet:", error);
      res.status(500).json({ message: "Failed to create cadet" });
    }
  });

  app.patch('/api/cadets/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertCadetSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid cadet data", 
          errors: validation.error.errors 
        });
      }

      const cadet = await storage.updateCadet(id, validation.data);
      res.json(cadet);
    } catch (error) {
      console.error("Error updating cadet:", error);
      res.status(500).json({ message: "Failed to update cadet" });
    }
  });

  // Applications routes
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const status = req.query.status as string;
      const campus = req.query.campus as string || user?.campus;
      const applications = await storage.getApplications(status, campus);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Campus-specific application routes to avoid parsing issues
  app.get('/api/applications/:campus', isAuthenticated, async (req: any, res) => {
    try {
      const campus = req.params.campus;
      // Check if this is actually a numeric ID
      if (/^\d+$/.test(campus)) {
        const id = parseInt(campus);
        const application = await storage.getApplication(id);
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
        return res.json(application);
      }
      
      // Otherwise treat as campus filter
      const user = await storage.getUser(req.user.claims.sub);
      const applications = await storage.getApplications(undefined, campus);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.post('/api/applications', async (req, res) => {
    try {
      const validation = insertApplicationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid application data", 
          errors: validation.error.errors 
        });
      }

      const application = await storage.createApplication(validation.data);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.patch('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertApplicationSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid application data", 
          errors: validation.error.errors 
        });
      }

      const updateData = {
        ...validation.data,
        reviewedBy: req.user.claims.sub,
        reviewedAt: new Date(),
      };

      const application = await storage.updateApplication(id, updateData);
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // AI-powered application analysis
  app.post('/api/applications/:id/analyze', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const analysis = await analyzeApplication(application);
      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing application:", error);
      res.status(500).json({ message: "Failed to analyze application" });
    }
  });

  // AI-powered cadet insights
  app.post('/api/cadets/:id/insights', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cadet = await storage.getCadet(id);
      if (!cadet) {
        return res.status(404).json({ message: "Cadet not found" });
      }

      const insights = await generateCadetInsights(cadet);
      res.json({ insights });
    } catch (error) {
      console.error("Error generating cadet insights:", error);
      res.status(500).json({ message: "Failed to generate cadet insights" });
    }
  });

  // Events routes
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const campus = req.query.campus as string || user?.campus;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const events = await storage.getEvents(campus, startDate, endDate);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const validation = z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        eventType: z.string(),
        startTime: z.string().transform(str => new Date(str)),
        endTime: z.string().transform(str => new Date(str)),
        location: z.string().optional(),
        campus: z.string(),
        maxParticipants: z.number().optional(),
        isRequired: z.boolean().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: validation.error.errors 
        });
      }

      const user = await storage.getUser(req.user.claims.sub);
      const eventData = {
        ...validation.data,
        createdBy: user?.id || req.user.claims.sub,
      };

      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Mentorships routes
  app.get('/api/mentorships', isAuthenticated, async (req, res) => {
    try {
      const cadetId = req.query.cadetId ? parseInt(req.query.cadetId as string) : undefined;
      const mentorships = await storage.getMentorships(cadetId);
      res.json(mentorships);
    } catch (error) {
      console.error("Error fetching mentorships:", error);
      res.status(500).json({ message: "Failed to fetch mentorships" });
    }
  });

  app.post('/api/mentorships', isAuthenticated, async (req: any, res) => {
    try {
      const validation = z.object({
        cadetId: z.number(),
        mentorName: z.string().min(1),
        mentorEmail: z.string().email().optional(),
        mentorPhone: z.string().optional(),
        assignedDate: z.string(),
        meetingFrequency: z.string().optional(),
        notes: z.string().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid mentorship data", 
          errors: validation.error.errors 
        });
      }

      const mentorship = await storage.createMentorship(validation.data);
      res.status(201).json(mentorship);
    } catch (error) {
      console.error("Error creating mentorship:", error);
      res.status(500).json({ message: "Failed to create mentorship" });
    }
  });

  // Inventory routes
  app.get('/api/inventory', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const campus = req.query.campus as string || user?.campus;
      const category = req.query.category as string;
      const inventory = await storage.getInventory(campus, category);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.patch('/api/inventory/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = z.object({
        itemName: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        quantity: z.number().optional(),
        minQuantity: z.number().optional(),
        maxQuantity: z.number().optional(),
        unitCost: z.number().transform(num => num.toString()).optional(),
        location: z.string().optional(),
        supplier: z.string().optional(),
        notes: z.string().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid inventory data", 
          errors: validation.error.errors 
        });
      }

      const item = await storage.updateInventoryItem(id, validation.data);
      res.json(item);
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ message: "Failed to update inventory" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
