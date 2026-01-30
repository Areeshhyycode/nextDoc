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
export const docSharingPermissionEnum = pgEnum("doc_sharing_permission", ["view", "edit", "comment", "edit_comment"]);
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
  // Page hierarchy support
  parentDocumentId: varchar("parent_document_id"), // Reference to parent document (null for root documents)
  pageOrder: integer("page_order").default(0), // Order within parent's children
  // Page style preferences
  fontStyle: text("font_style").default("system"),
  fontSize: text("font_size").default("default"),
  pageWidth: text("page_width").default("default"),
  backgroundColor: text("background_color").default("#ffffff"),
  textColor: text("text_color").default("#1f2937"),
  headingColor: text("heading_color").default("#111827"),
  h1Color: text("h1_color").default("#111827"),
  h2Color: text("h2_color").default("#1f2937"),
  h3Color: text("h3_color").default("#374151"),
  h4Color: text("h4_color").default("#4b5563"),
  h5Color: text("h5_color").default("#6b7280"),
  h6Color: text("h6_color").default("#9ca3af"),
  linkColor: text("link_color").default("#3b82f6"),
  codeBlockBg: text("code_block_bg").default("#f3f4f6"),
  codeBlockText: text("code_block_text").default("#1f2937"),
  blockquoteBg: text("blockquote_bg").default("#f9fafb"),
  blockquoteText: text("blockquote_text").default("#4b5563"),
  tableBorderColor: text("table_border_color").default("#e5e7eb"),
  tableHeaderBg: text("table_header_bg").default("#f3f4f6"),
  showPageOutline: boolean("show_page_outline").default(false),
  isShared: boolean("is_shared").default(false),
  isProtected: boolean("is_protected").default(false), // When true, only owner can edit
  // Public link sharing - Production-grade implementation
  publicLinkEnabled: boolean("public_link_enabled").default(false),
  publicLinkToken: varchar("public_link_token").unique(), // Unique token for public access (indexed)
  publicLinkExpiresAt: timestamp("public_link_expires_at"), // Optional expiry for public links
  publicLinkCreatedAt: timestamp("public_link_created_at"), // When the current token was generated
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  lastViewedAt: timestamp("last_viewed_at"),
  lastUpdatedBy: varchar("last_updated_by"), // User ID of who last updated the document
});

// Document sharing - tracks who a document is shared with
export const documentShares = pgTable("document_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  userId: varchar("user_id").notNull(), // User the document is shared with
  permission: docSharingPermissionEnum("permission").notNull().default("view"),
  sharedBy: varchar("shared_by").notNull(), // User who shared the document
  sharedAt: timestamp("shared_at").default(sql`CURRENT_TIMESTAMP`),
  lastViewedAt: timestamp("last_viewed_at"), // When this user last viewed the document
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

// Document invites - for inviting unregistered users via email
export const documentInvites = pgTable("document_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  email: text("email").notNull(), // Email of the invitee (not yet registered)
  permission: docSharingPermissionEnum("permission").notNull().default("view"),
  invitedBy: varchar("invited_by").notNull(), // User who sent the invite
  token: varchar("token").unique().notNull(), // Unique token for accepting invite
  status: text("status").default("pending"), // 'pending', 'accepted', 'expired', 'revoked'
  expiresAt: timestamp("expires_at").notNull(), // Invite expiry date
  acceptedAt: timestamp("accepted_at"), // When invite was accepted
  acceptedByUserId: varchar("accepted_by_user_id"), // User ID who accepted (after registration)
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Document templates - user-defined or system templates
export const documentTemplates = pgTable("document_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").default(""), // JSON content from TipTap editor
  category: text("category").notNull().default("general"), // general, meeting, project, etc.
  icon: text("icon"), // Icon identifier (e.g., "project", "meeting", "notes")
  iconColor: text("icon_color").default("#3B82F6"),
  isSystem: boolean("is_system").default(false), // System templates cannot be deleted
  createdBy: varchar("created_by"), // User ID (null for system templates)
  isPublic: boolean("is_public").default(true), // Visible to all users
  usageCount: integer("usage_count").default(0), // Track template popularity
  sortOrder: integer("sort_order").default(0), // Display order
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Document spaces/folders for organizing documents
export const documentSpaces = pgTable("document_spaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("folder"), // Icon identifier
  color: text("color").default("#3B82F6"),
  ownerId: varchar("owner_id").notNull(), // User who created the space
  parentSpaceId: varchar("parent_space_id"), // For nested folders (null for root spaces)
  sortOrder: integer("sort_order").default(0), // Display order
  isPrivate: boolean("is_private").default(false), // Private spaces only visible to owner
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Junction table linking documents to spaces
export const documentSpaceMembers = pgTable("document_space_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spaceId: varchar("space_id").notNull(),
  documentId: varchar("document_id").notNull(),
  addedAt: timestamp("added_at").default(sql`CURRENT_TIMESTAMP`),
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
  parentDocument: one(documents, {
    fields: [documents.parentDocumentId],
    references: [documents.id],
    relationName: "parentChild"
  }),
  childPages: many(documents, { relationName: "parentChild" }),
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

export const insertDocumentShareSchema = createInsertSchema(documentShares).omit({
  id: true,
  sharedAt: true,
});

export const updateDocumentShareSchema = insertDocumentShareSchema.partial();

// Validation schema for share document API request
export const shareDocumentRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  permission: z.enum(["view", "edit", "comment", "edit_comment"], {
    errorMap: () => ({ message: "Permission must be one of: view, edit, comment, edit_comment" }),
  }),
});

// Validation schema for update share permission API request
export const updateSharePermissionRequestSchema = z.object({
  permission: z.enum(["view", "edit", "comment", "edit_comment"], {
    errorMap: () => ({ message: "Permission must be one of: view, edit, comment, edit_comment" }),
  }),
});

export type ShareDocumentRequest = z.infer<typeof shareDocumentRequestSchema>;
export type UpdateSharePermissionRequest = z.infer<typeof updateSharePermissionRequestSchema>;

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

export type InsertDocumentShare = z.infer<typeof insertDocumentShareSchema>;
export type DocumentShare = typeof documentShares.$inferSelect;
export type UpdateDocumentShare = z.infer<typeof updateDocumentShareSchema>;

// Shared user info for display purposes
export type SharedUserInfo = {
  id: string;
  displayName: string;
  email: string;
  profilePicture: string | null;
  permission: "view" | "edit" | "comment" | "edit_comment";
};

// Last updater info for display purposes
export type LastUpdaterInfo = {
  id: string;
  displayName: string;
  email: string;
  profilePicture: string | null;
};

// Document with owner info for display purposes
export type DocumentWithOwner = Document & {
  owner: {
    id: string;
    displayName: string;
    email: string;
    profilePicture: string | null;
  } | null;
  sharedWith?: SharedUserInfo[];
  shareCount?: number;
  lastUpdater?: LastUpdaterInfo | null; // Info about who last updated the document
};

// Page tree node for hierarchical display
export type PageTreeNode = {
  id: string;
  title: string;
  pageOrder: number;
  parentDocumentId: string | null;
  children: PageTreeNode[];
};
export type InsertDocumentComment = z.infer<typeof insertDocumentCommentSchema>;
export type DocumentComment = typeof documentComments.$inferSelect;
export type UpdateDocumentComment = z.infer<typeof updateDocumentCommentSchema>;

// Document invites schemas
export const insertDocumentInviteSchema = createInsertSchema(documentInvites).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
  acceptedByUserId: true,
});
export const updateDocumentInviteSchema = insertDocumentInviteSchema.partial();
export type InsertDocumentInvite = z.infer<typeof insertDocumentInviteSchema>;
export type DocumentInvite = typeof documentInvites.$inferSelect;
export type UpdateDocumentInvite = z.infer<typeof updateDocumentInviteSchema>;

// Validation schema for invite by email API request
export const inviteByEmailRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  permission: z.enum(["view", "edit", "comment", "edit_comment"], {
    errorMap: () => ({ message: "Permission must be one of: view, edit, comment, edit_comment" }),
  }),
});
export type InviteByEmailRequest = z.infer<typeof inviteByEmailRequestSchema>;

// Document templates schemas
export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateDocumentTemplateSchema = insertDocumentTemplateSchema.partial();
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type UpdateDocumentTemplate = z.infer<typeof updateDocumentTemplateSchema>;

// Document spaces schemas
export const insertDocumentSpaceSchema = createInsertSchema(documentSpaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateDocumentSpaceSchema = insertDocumentSpaceSchema.partial();
export type InsertDocumentSpace = z.infer<typeof insertDocumentSpaceSchema>;
export type DocumentSpace = typeof documentSpaces.$inferSelect;
export type UpdateDocumentSpace = z.infer<typeof updateDocumentSpaceSchema>;

// Document space with nested children and document count
export type DocumentSpaceWithMeta = DocumentSpace & {
  documentCount: number;
  children: DocumentSpaceWithMeta[];
};

// Document space members schemas
export const insertDocumentSpaceMemberSchema = createInsertSchema(documentSpaceMembers).omit({
  id: true,
  addedAt: true,
});
export type InsertDocumentSpaceMember = z.infer<typeof insertDocumentSpaceMemberSchema>;
export type DocumentSpaceMember = typeof documentSpaceMembers.$inferSelect;

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
