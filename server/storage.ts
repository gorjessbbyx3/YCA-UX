import {
  users,
  cadets,
  applications,
  events,
  mentorships,
  inventory,
  activities,
  type User,
  type UpsertUser,
  type InsertCadet,
  type Cadet,
  type InsertApplication,
  type Application,
  type InsertEvent,
  type Event,
  type InsertMentorship,
  type Mentorship,
  type InsertInventory,
  type Inventory,
  type InsertActivity,
  type Activity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Cadet operations
  getCadets(campus?: string): Promise<Cadet[]>;
  getCadet(id: number): Promise<Cadet | undefined>;
  createCadet(cadet: InsertCadet): Promise<Cadet>;
  updateCadet(id: number, cadet: Partial<InsertCadet>): Promise<Cadet>;
  
  // Application operations
  getApplications(status?: string, campus?: string): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application>;
  
  // Event operations
  getEvents(campus?: string, startDate?: Date, endDate?: Date): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Mentorship operations
  getMentorships(cadetId?: number): Promise<Mentorship[]>;
  createMentorship(mentorship: InsertMentorship): Promise<Mentorship>;
  
  // Inventory operations
  getInventory(campus?: string, category?: string): Promise<Inventory[]>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory>;
  
  // Activity operations
  getRecentActivities(campus?: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard metrics
  getDashboardMetrics(campus?: string): Promise<{
    activeCadets: number;
    graduationRate: number;
    serviceHours: number;
    pendingApplications: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Cadet operations
  async getCadets(campus?: string): Promise<Cadet[]> {
    const query = db.select().from(cadets).orderBy(desc(cadets.createdAt));
    if (campus) {
      return await query.where(eq(cadets.campus, campus));
    }
    return await query;
  }

  async getCadet(id: number): Promise<Cadet | undefined> {
    const [cadet] = await db.select().from(cadets).where(eq(cadets.id, id));
    return cadet;
  }

  async createCadet(cadet: InsertCadet): Promise<Cadet> {
    const [newCadet] = await db.insert(cadets).values(cadet).returning();
    
    // Create activity log
    await this.createActivity({
      type: 'cadet_activity',
      title: 'New Cadet Added',
      description: `Cadet ${cadet.firstName} ${cadet.lastName} has been added to the system`,
      relatedId: newCadet.id,
      relatedType: 'cadet',
      campus: cadet.campus,
    });
    
    return newCadet;
  }

  async updateCadet(id: number, cadetData: Partial<InsertCadet>): Promise<Cadet> {
    const [cadet] = await db
      .update(cadets)
      .set({ ...cadetData, updatedAt: new Date() })
      .where(eq(cadets.id, id))
      .returning();
    return cadet;
  }

  // Application operations
  async getApplications(status?: string, campus?: string): Promise<Application[]> {
    let query = db.select().from(applications).orderBy(desc(applications.submittedAt));
    
    const conditions = [];
    if (status) conditions.push(eq(applications.status, status));
    if (campus) conditions.push(eq(applications.preferredCampus, campus));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    
    await this.createActivity({
      type: 'system_event',
      title: 'New Application Received',
      description: `Application received from ${application.firstName} ${application.lastName}`,
      relatedId: newApplication.id,
      relatedType: 'application',
      campus: application.preferredCampus,
    });
    
    return newApplication;
  }

  async updateApplication(id: number, applicationData: Partial<InsertApplication>): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ ...applicationData, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  // Event operations
  async getEvents(campus?: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
    let query = db.select().from(events).orderBy(events.startTime);
    
    const conditions = [];
    if (campus) conditions.push(eq(events.campus, campus));
    if (startDate) conditions.push(gte(events.startTime, startDate));
    if (endDate) conditions.push(lte(events.startTime, endDate));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  // Mentorship operations
  async getMentorships(cadetId?: number): Promise<Mentorship[]> {
    const query = db.select().from(mentorships).orderBy(desc(mentorships.createdAt));
    if (cadetId) {
      return await query.where(eq(mentorships.cadetId, cadetId));
    }
    return await query;
  }

  async createMentorship(mentorship: InsertMentorship): Promise<Mentorship> {
    const [newMentorship] = await db.insert(mentorships).values(mentorship).returning();
    return newMentorship;
  }

  // Inventory operations
  async getInventory(campus?: string, category?: string): Promise<Inventory[]> {
    let query = db.select().from(inventory).orderBy(inventory.itemName);
    
    const conditions = [];
    if (campus) conditions.push(eq(inventory.campus, campus));
    if (category) conditions.push(eq(inventory.category, category));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async updateInventoryItem(id: number, itemData: Partial<InsertInventory>): Promise<Inventory> {
    const [item] = await db
      .update(inventory)
      .set({ ...itemData, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }

  // Activity operations
  async getRecentActivities(campus?: string, limit: number = 10): Promise<Activity[]> {
    let query = db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
    
    if (campus) {
      return await query.where(eq(activities.campus, campus));
    }
    
    return await query;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Dashboard metrics
  async getDashboardMetrics(campus?: string): Promise<{
    activeCadets: number;
    graduationRate: number;
    serviceHours: number;
    pendingApplications: number;
  }> {
    const campusCondition = campus ? eq(cadets.campus, campus) : undefined;
    const appCampusCondition = campus ? eq(applications.preferredCampus, campus) : undefined;

    // Active cadets
    const [activeCadetsResult] = await db
      .select({ count: count() })
      .from(cadets)
      .where(campusCondition ? and(eq(cadets.status, 'active'), campusCondition) : eq(cadets.status, 'active'));

    // Graduation rate (simplified calculation)
    const [totalCadetsResult] = await db
      .select({ count: count() })
      .from(cadets)
      .where(campusCondition || undefined);

    const [graduatedCadetsResult] = await db
      .select({ count: count() })
      .from(cadets)
      .where(campusCondition ? and(eq(cadets.status, 'graduated'), campusCondition) : eq(cadets.status, 'graduated'));

    // Service hours
    const [serviceHoursResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${cadets.serviceHours}), 0)` })
      .from(cadets)
      .where(campusCondition || undefined);

    // Pending applications
    const [pendingAppsResult] = await db
      .select({ count: count() })
      .from(applications)
      .where(appCampusCondition ? and(eq(applications.status, 'pending'), appCampusCondition) : eq(applications.status, 'pending'));

    const graduationRate = totalCadetsResult.count > 0 
      ? (graduatedCadetsResult.count / totalCadetsResult.count) * 100 
      : 0;

    return {
      activeCadets: activeCadetsResult.count,
      graduationRate: Math.round(graduationRate * 10) / 10,
      serviceHours: serviceHoursResult.total,
      pendingApplications: pendingAppsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
