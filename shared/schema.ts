import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const departmentEnum = pgEnum("department", ["Product", "Design", "Dev", "Marketing & Sales", "Bug Hunting Campaign"]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "sub-admin"]);
export const statusEnum = pgEnum("status", ["Not Started", "In Progress", "Completed", "Blocked", "Reviewing", "Design Approval Needed", "Temporary Hold"]);
export const riskEnum = pgEnum("risk", ["Low", "Medium", "High"]);
export const taskTypeEnum = pgEnum("task_type", ["Operational", "Technical", "Strategic", "Hiring", "Financial"]);

export const stageEnum = pgEnum("stage", ["Others", "Pre-Event", "Day Of", "Post-Event", "During Event"]);
export const sprintStatusEnum = pgEnum("sprint_status", ["Planning", "Active", "Completed", "Cancelled"]);
export const viewTypeEnum = pgEnum("view_type", ["table", "kanban"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  profilePicture: text("profile_picture"),
  isOnline: boolean("is_online").default(false),
  lastActivity: timestamp("last_activity").default(sql`CURRENT_TIMESTAMP`),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  lastLogin: timestamp("last_login").default(sql`CURRENT_TIMESTAMP`),
  firstName: text("first_name"),
  lastName: text("last_name"),
  country: text("country"),
  phone: text("phone"),
  birthday: text("birthday"),
  language: text("language").default("English"),
  timezone: text("timezone").default("(GMT+00:00) UTC"),
  theme: text("theme").default("Auto"),
  dateFormat: text("date_format").default("31 Dec 2025"),
  timeFormat: text("time_format").default("12"),
  weekFormat: text("week_format").default("Monday"),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  onboardingUseCase: text("onboarding_use_case"),
  onboardingManagementArea: text("onboarding_management_area"),
  onboardingHeardFrom: text("onboarding_heard_from"),
  onboardingWorkspaceName: text("onboarding_workspace_name"),
  onboardingInterestedFeatures: text("onboarding_interested_features").array().default(sql`ARRAY[]::text[]`),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  department: departmentEnum("department").notNull(),
  avatarColor: text("avatar_color").default("#3B82F6"),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  department: departmentEnum("department").notNull(),
  task: text("task").notNull(),
  status: statusEnum("status").notNull().default("Not Started"),
  owner: text("owner"),
  stage: text("stage").default("Others"),
  startDate: text("start_date"), // Start date for task
  dueDate: text("due_date"), // Using text to match YYYY-MM-DD format
  completionPercentage: integer("completion_percentage").default(0),
  risk: text("risk"),
  notes: text("notes"),
  description: text("description"), // Detailed task description  
  labels: text("labels").array().default(sql`ARRAY[]::text[]`), // Array of label names
  dependencies: text("dependencies").array().default(sql`ARRAY[]::text[]`), // Array of task IDs this task depends on
  linkedGoalId: varchar("linked_goal_id"), // Reference to associated goal
  sprintId: varchar("sprint_id"), // Reference to assigned sprint
  scheduledDate: text("scheduled_date"), // Calendar scheduled date
  effortEstimate: integer("effort_estimate").default(1), // Story points or hours estimate in minutes
  taskType: taskTypeEnum("task_type"), // Task category (Operational, Technical, etc.)
  workspaceProjectId: varchar("workspace_project_id"), // Link to workspace project
  sectionId: varchar("section_id"), // Link to section/group in list view
  lastUpdated: timestamp("last_updated").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  owner: text("owner"),
  targetDate: text("target_date"), // Using text to match YYYY-MM-DD format
  taskIds: text("task_ids").array().default(sql`ARRAY[]::text[]`), // Array of linked task IDs
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const sprints = pgTable("sprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  startDate: text("start_date").notNull(), // Using text to match YYYY-MM-DD format
  endDate: text("end_date").notNull(), // Using text to match YYYY-MM-DD format
  status: sprintStatusEnum("status").notNull().default("Planning"),
  teamMembers: text("team_members").array().default(sql`ARRAY[]::text[]`), // Array of team member names
  taskIds: text("task_ids").array().default(sql`ARRAY[]::text[]`), // Array of assigned task IDs
  totalEffort: integer("total_effort").default(0), // Total story points/hours
  completedEffort: integer("completed_effort").default(0), // Completed story points/hours
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sessionId: text("session_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  loginTime: timestamp("login_time").default(sql`CURRENT_TIMESTAMP`),
  lastActivity: timestamp("last_activity").default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").default(true),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(), // 'login', 'logout', 'task_created', 'task_updated', etc.
  details: text("details"), // JSON string with additional details
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  invitedBy: varchar("invited_by").notNull(), // User ID of admin who sent invite
  status: text("status").default("pending"), // 'pending', 'accepted', 'expired'
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expires_at"), // Optional expiry date
});

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("Users"),
  color: text("color").notNull().default("#3B82F6"),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const viewPreferences = pgTable("view_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  teamId: varchar("team_id").notNull(),
  viewType: viewTypeEnum("view_type").notNull().default("table"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const kanbanColumns = pgTable("kanban_columns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6B7280"),
  icon: text("icon").default("📋"), // Emoji or icon identifier for the column
  order: integer("order").notNull().default(0),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const commentStatusEnum = pgEnum("comment_status", ["open", "resolved"]);
export const docCategoryEnum = pgEnum("doc_category", ["blank", "meeting_notes", "project_overview"]);
export const projectPrivacyEnum = pgEnum("project_privacy", ["private", "everyone", "specific_people"]);
export const projectLayoutEnum = pgEnum("project_layout", ["list", "kanban", "gantt"]);
export const projectStatusEnum = pgEnum("project_status", ["at_risk", "on_track", "off_track", "on_hold", "completed"]);
export const budgetTypeEnum = pgEnum("budget_type", ["fixed", "hourly"]);
export const activityTypeEnum = pgEnum("activity_type", ["status_changed", "task_completed", "task_added", "task_updated", "task_deleted", "member_added", "member_removed", "description_updated"]);

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").default(""), // JSON content from TipTap editor
  ownerId: varchar("owner_id").notNull(),
  category: docCategoryEnum("category").notNull().default("blank"),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  isFavorite: boolean("is_favorite").default(false),
  // Page style preferences
  fontStyle: text("font_style").default("system"),
  fontSize: text("font_size").default("default"),
  pageWidth: text("page_width").default("default"),
  showCoverImage: boolean("show_cover_image").default(false),
  showPageIconAndTitle: boolean("show_page_icon_and_title").default(true),
  showAuthor: boolean("show_author").default(false),
  showContributors: boolean("show_contributors").default(false),
  showSubtitle: boolean("show_subtitle").default(false),
  showLastModified: boolean("show_last_modified").default(true),
  showPageOutline: boolean("show_page_outline").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  lastViewedAt: timestamp("last_viewed_at"),
});

export const documentComments = pgTable("document_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  status: commentStatusEnum("status").notNull().default("open"),
  mentionedUserIds: text("mentioned_user_ids").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const workspaceProjects = pgTable("workspace_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull().default("#3B82F6"),
  startDate: text("start_date"), // YYYY-MM-DD format
  endDate: text("end_date"), // YYYY-MM-DD format
  ownerId: varchar("owner_id").notNull(), // User who created the project
  privacy: projectPrivacyEnum("privacy").notNull().default("private"),
  memberIds: text("member_ids").array().default(sql`ARRAY[]::text[]`), // Array of user IDs for specific_people privacy
  defaultLayout: projectLayoutEnum("default_layout").notNull().default("list"),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projectSections = pgTable("project_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(), // Workspace project this section belongs to
  name: text("name").notNull(),
  order: integer("order").notNull().default(0), // For drag-and-drop reordering
  isCollapsed: boolean("is_collapsed").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projectStatusUpdates = pgTable("project_status_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  status: projectStatusEnum("status").notNull(),
  description: text("description"),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projectBudgets = pgTable("project_budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  type: budgetTypeEnum("type").notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  currency: text("currency").default("USD"),
  billDate: text("bill_date"), // YYYY-MM-DD format
  category: text("category"),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projectCosts = pgTable("project_costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  type: budgetTypeEnum("type").notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  currency: text("currency").default("USD"),
  date: text("date"), // YYYY-MM-DD format
  category: text("category"),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projectAttachments = pgTable("project_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"), // Size in bytes
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projectActivities = pgTable("project_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  activityType: activityTypeEnum("activity_type").notNull(),
  entityName: text("entity_name"), // Name of the task/entity that was affected
  oldValue: text("old_value"), // Previous value for changes
  newValue: text("new_value"), // New value for changes
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(userSessions),
  activityLogs: many(activityLogs),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, { fields: [userSessions.userId], references: [users.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  inviter: one(users, { fields: [invitations.invitedBy], references: [users.id] }),
}));

export const teamMembersRelations = relations(teamMembers, ({ many }) => ({
  projects: many(projects),
}));

export const viewPreferencesRelations = relations(viewPreferences, ({ one }) => ({
  user: one(users, { fields: [viewPreferences.userId], references: [users.id] }),
  team: one(teams, { fields: [viewPreferences.teamId], references: [teams.id] }),
}));

export const kanbanColumnsRelations = relations(kanbanColumns, ({ one }) => ({
  team: one(teams, { fields: [kanbanColumns.teamId], references: [teams.id] }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  owner: one(users, { fields: [documents.ownerId], references: [users.id] }),
  comments: many(documentComments),
}));

export const documentCommentsRelations = relations(documentComments, ({ one }) => ({
  document: one(documents, { fields: [documentComments.documentId], references: [documents.id] }),
  user: one(users, { fields: [documentComments.userId], references: [users.id] }),
}));

export const workspaceProjectsRelations = relations(workspaceProjects, ({ one }) => ({
  owner: one(users, { fields: [workspaceProjects.ownerId], references: [users.id] }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  lastActivity: true,
  isOnline: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  loginTime: true,
  lastActivity: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTeamSchema = insertTeamSchema.partial();

export const insertViewPreferenceSchema = createInsertSchema(viewPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKanbanColumnSchema = createInsertSchema(kanbanColumns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateKanbanColumnSchema = insertKanbanColumnSchema.partial();

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDocumentSchema = insertDocumentSchema.partial();

export const insertDocumentCommentSchema = createInsertSchema(documentComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDocumentCommentSchema = insertDocumentCommentSchema.partial();

export const insertWorkspaceProjectSchema = createInsertSchema(workspaceProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWorkspaceProjectSchema = insertWorkspaceProjectSchema.partial();

export const insertProjectSectionSchema = createInsertSchema(projectSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProjectSectionSchema = insertProjectSectionSchema.partial();

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const updateProjectSchema = insertProjectSchema.partial();

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateGoalSchema = insertGoalSchema.partial();

export const insertSprintSchema = createInsertSchema(sprints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSprintSchema = insertSprintSchema.partial();

export const updateUserSchema = insertUserSchema.partial();
export const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin", "sub-admin"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type UpdateGoal = z.infer<typeof updateGoalSchema>;
export type Sprint = typeof sprints.$inferSelect;
export type InsertSprint = z.infer<typeof insertSprintSchema>;
export type UpdateSprint = z.infer<typeof updateSprintSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitations.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
export type UpdateTeam = z.infer<typeof updateTeamSchema>;
export type InsertViewPreference = z.infer<typeof insertViewPreferenceSchema>;
export type ViewPreference = typeof viewPreferences.$inferSelect;
export type InsertKanbanColumn = z.infer<typeof insertKanbanColumnSchema>;
export type KanbanColumn = typeof kanbanColumns.$inferSelect;
export type UpdateKanbanColumn = z.infer<typeof updateKanbanColumnSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type UpdateDocument = z.infer<typeof updateDocumentSchema>;

// Document with owner info for display purposes
export type DocumentWithOwner = Document & {
  owner: {
    id: string;
    displayName: string;
    email: string;
    profilePicture: string | null;
  } | null;
};
export type InsertDocumentComment = z.infer<typeof insertDocumentCommentSchema>;
export type DocumentComment = typeof documentComments.$inferSelect;
export type UpdateDocumentComment = z.infer<typeof updateDocumentCommentSchema>;
export type InsertWorkspaceProject = z.infer<typeof insertWorkspaceProjectSchema>;
export type WorkspaceProject = typeof workspaceProjects.$inferSelect;
export type UpdateWorkspaceProject = z.infer<typeof updateWorkspaceProjectSchema>;
export type InsertProjectSection = z.infer<typeof insertProjectSectionSchema>;
export type ProjectSection = typeof projectSections.$inferSelect;
export type UpdateProjectSection = z.infer<typeof updateProjectSectionSchema>;

export const insertProjectStatusUpdateSchema = createInsertSchema(projectStatusUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertProjectBudgetSchema = createInsertSchema(projectBudgets).omit({
  id: true,
  createdAt: true,
});

export const insertProjectCostSchema = createInsertSchema(projectCosts).omit({
  id: true,
  createdAt: true,
});

export const insertProjectAttachmentSchema = createInsertSchema(projectAttachments).omit({
  id: true,
  createdAt: true,
});

export const insertProjectActivitySchema = createInsertSchema(projectActivities).omit({
  id: true,
  createdAt: true,
});

export type InsertProjectStatusUpdate = z.infer<typeof insertProjectStatusUpdateSchema>;
export type ProjectStatusUpdate = typeof projectStatusUpdates.$inferSelect;
export type InsertProjectBudget = z.infer<typeof insertProjectBudgetSchema>;
export type ProjectBudget = typeof projectBudgets.$inferSelect;
export type InsertProjectCost = z.infer<typeof insertProjectCostSchema>;
export type ProjectCost = typeof projectCosts.$inferSelect;
export type InsertProjectAttachment = z.infer<typeof insertProjectAttachmentSchema>;
export type ProjectAttachment = typeof projectAttachments.$inferSelect;
export type InsertProjectActivity = z.infer<typeof insertProjectActivitySchema>;
export type ProjectActivity = typeof projectActivities.$inferSelect;
