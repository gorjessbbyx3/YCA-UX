import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  date,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("staff"), // staff, admin, instructor
  campus: varchar("campus").notNull().default("oahu"), // oahu, hilo
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cadets table
export const cadets = pgTable("cadets", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  dateOfBirth: date("date_of_birth").notNull(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  emergencyContactName: varchar("emergency_contact_name").notNull(),
  emergencyContactPhone: varchar("emergency_contact_phone").notNull(),
  emergencyContactRelation: varchar("emergency_contact_relation").notNull(),
  campus: varchar("campus").notNull().default("oahu"),
  classNumber: integer("class_number"),
  startDate: date("start_date"),
  graduationDate: date("graduation_date"),
  status: varchar("status").notNull().default("active"), // active, graduated, dismissed, withdrawn
  academicProgress: decimal("academic_progress", { precision: 5, scale: 2 }).default("0"),
  fitnessProgress: decimal("fitness_progress", { precision: 5, scale: 2 }).default("0"),
  leadershipProgress: decimal("leadership_progress", { precision: 5, scale: 2 }).default("0"),
  serviceHours: integer("service_hours").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  parentGuardianName: varchar("parent_guardian_name").notNull(),
  parentGuardianPhone: varchar("parent_guardian_phone").notNull(),
  parentGuardianEmail: varchar("parent_guardian_email"),
  currentSchool: varchar("current_school"),
  gradeLevel: varchar("grade_level"),
  reasonForApplying: text("reason_for_applying"),
  previousChallenges: text("previous_challenges"),
  goals: text("goals"),
  preferredCampus: varchar("preferred_campus").notNull().default("oahu"),
  status: varchar("status").notNull().default("pending"), // pending, under_review, approved, denied, waitlisted
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  eventType: varchar("event_type").notNull(), // graduation, community_service, visitation, training
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: varchar("location"),
  campus: varchar("campus").notNull(),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  isRequired: boolean("is_required").default(false),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mentorship assignments table
export const mentorships = pgTable("mentorships", {
  id: serial("id").primaryKey(),
  cadetId: integer("cadet_id").notNull(),
  mentorName: varchar("mentor_name").notNull(),
  mentorEmail: varchar("mentor_email"),
  mentorPhone: varchar("mentor_phone"),
  assignedDate: date("assigned_date").notNull(),
  status: varchar("status").notNull().default("active"), // active, completed, inactive
  meetingFrequency: varchar("meeting_frequency"), // weekly, biweekly, monthly
  lastMeetingDate: date("last_meeting_date"),
  nextMeetingDate: date("next_meeting_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  itemName: varchar("item_name").notNull(),
  category: varchar("category").notNull(), // uniforms, equipment, supplies, academic
  description: text("description"),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").default(10),
  maxQuantity: integer("max_quantity").default(100),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }),
  location: varchar("location"),
  campus: varchar("campus").notNull(),
  supplier: varchar("supplier"),
  lastRestocked: date("last_restocked"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities/tasks table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull(), // cadet_activity, system_event, task_completed
  title: varchar("title").notNull(),
  description: text("description"),
  relatedId: integer("related_id"), // ID of related cadet, application, etc.
  relatedType: varchar("related_type"), // cadet, application, event, etc.
  performedBy: varchar("performed_by"),
  campus: varchar("campus"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events),
}));

export const cadetsRelations = relations(cadets, ({ many }) => ({
  mentorships: many(mentorships),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  createdBy: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
}));

export const mentorshipsRelations = relations(mentorships, ({ one }) => ({
  cadet: one(cadets, {
    fields: [mentorships.cadetId],
    references: [cadets.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCadetSchema = createInsertSchema(cadets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  submittedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMentorshipSchema = createInsertSchema(mentorships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCadet = z.infer<typeof insertCadetSchema>;
export type Cadet = typeof cadets.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertMentorship = z.infer<typeof insertMentorshipSchema>;
export type Mentorship = typeof mentorships.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
