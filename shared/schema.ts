import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "sub-admin"]);
export const commentStatusEnum = pgEnum("comment_status", ["open", "resolved"]);
export const docCategoryEnum = pgEnum("doc_category", ["blank", "meeting_notes", "project_overview"]);
export const docSharingPermissionEnum = pgEnum("doc_sharing_permission", ["view", "edit", "comment", "edit_comment"]);

// ─── Users Table ────────────────────────────────────────────────────────────────

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

// ─── User Sessions ──────────────────────────────────────────────────────────────

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

// ─── Activity Logs ──────────────────────────────────────────────────────────────

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Invitations ────────────────────────────────────────────────────────────────

export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  invitedBy: varchar("invited_by").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expires_at"),
});

// ─── Documents Table ────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").default(""), // JSON content from TipTap editor
  yjsState: text("yjs_state"), // Base64-encoded Yjs binary state for real-time collaboration
  ownerId: varchar("owner_id").notNull(),
  category: docCategoryEnum("category").notNull().default("blank"),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  isFavorite: boolean("is_favorite").default(false),
  isPinned: boolean("is_pinned").default(false),
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
  deletedAt: timestamp("deleted_at"), // null = not deleted, set = soft-deleted (trash)
});

// ─── Document Shares ────────────────────────────────────────────────────────────

export const documentShares = pgTable("document_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  userId: varchar("user_id").notNull(), // User the document is shared with
  permission: docSharingPermissionEnum("permission").notNull().default("view"),
  sharedBy: varchar("shared_by").notNull(), // User who shared the document
  sharedAt: timestamp("shared_at").default(sql`CURRENT_TIMESTAMP`),
  lastViewedAt: timestamp("last_viewed_at"), // When this user last viewed the document
});

// ─── Document Comments ──────────────────────────────────────────────────────────

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

// ─── Document Invites ───────────────────────────────────────────────────────────

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

// ─── Document Templates ─────────────────────────────────────────────────────────

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

// ─── Document Versions ──────────────────────────────────────────────────────────

export const documentVersions = pgTable("document_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  title: text("title").notNull(),
  content: text("content").default(""),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  versionNumber: integer("version_number").notNull().default(1),
  changeType: text("change_type").notNull().default("auto"), // "auto" | "manual" | "restore"
  wordCount: integer("word_count").default(0),
});

// ─── Document Spaces ────────────────────────────────────────────────────────────

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

// ─── Document Space Members ─────────────────────────────────────────────────────

export const documentSpaceMembers = pgTable("document_space_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spaceId: varchar("space_id").notNull(),
  documentId: varchar("document_id").notNull(),
  addedAt: timestamp("added_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── Relations ──────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  documentComments: many(documentComments),
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

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(documents, { fields: [documentVersions.documentId], references: [documents.id] }),
  creator: one(users, { fields: [documentVersions.createdBy], references: [users.id] }),
}));

// ─── Insert / Update Schemas ────────────────────────────────────────────────────

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  lastActivity: true,
  isOnline: true,
});

export const updateUserSchema = insertUserSchema.partial();
export const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin", "sub-admin"]),
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

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
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

export const insertDocumentCommentSchema = createInsertSchema(documentComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDocumentCommentSchema = insertDocumentCommentSchema.partial();

// Document invites schemas
export const insertDocumentInviteSchema = createInsertSchema(documentInvites).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
  acceptedByUserId: true,
});
export const updateDocumentInviteSchema = insertDocumentInviteSchema.partial();

// Validation schema for invite by email API request
export const inviteByEmailRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  permission: z.enum(["view", "edit", "comment", "edit_comment"], {
    errorMap: () => ({ message: "Permission must be one of: view, edit, comment, edit_comment" }),
  }),
});

// Document templates schemas
export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateDocumentTemplateSchema = insertDocumentTemplateSchema.partial();

// Document spaces schemas
export const insertDocumentSpaceSchema = createInsertSchema(documentSpaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateDocumentSpaceSchema = insertDocumentSpaceSchema.partial();

// Document space members schemas
export const insertDocumentSpaceMemberSchema = createInsertSchema(documentSpaceMembers).omit({
  id: true,
  addedAt: true,
});

// ─── Types ──────────────────────────────────────────────────────────────────────

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitations.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type UpdateDocument = z.infer<typeof updateDocumentSchema>;

export type InsertDocumentShare = z.infer<typeof insertDocumentShareSchema>;
export type DocumentShare = typeof documentShares.$inferSelect;
export type UpdateDocumentShare = z.infer<typeof updateDocumentShareSchema>;

export type ShareDocumentRequest = z.infer<typeof shareDocumentRequestSchema>;
export type UpdateSharePermissionRequest = z.infer<typeof updateSharePermissionRequestSchema>;

export type InsertDocumentComment = z.infer<typeof insertDocumentCommentSchema>;
export type DocumentComment = typeof documentComments.$inferSelect;
export type UpdateDocumentComment = z.infer<typeof updateDocumentCommentSchema>;

export type InsertDocumentInvite = z.infer<typeof insertDocumentInviteSchema>;
export type DocumentInvite = typeof documentInvites.$inferSelect;
export type UpdateDocumentInvite = z.infer<typeof updateDocumentInviteSchema>;

export type InviteByEmailRequest = z.infer<typeof inviteByEmailRequestSchema>;

export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type UpdateDocumentTemplate = z.infer<typeof updateDocumentTemplateSchema>;

export type InsertDocumentSpace = z.infer<typeof insertDocumentSpaceSchema>;
export type DocumentSpace = typeof documentSpaces.$inferSelect;
export type UpdateDocumentSpace = z.infer<typeof updateDocumentSpaceSchema>;

export type InsertDocumentSpaceMember = z.infer<typeof insertDocumentSpaceMemberSchema>;
export type DocumentSpaceMember = typeof documentSpaceMembers.$inferSelect;

// Document version types
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type DocumentVersionWithCreator = DocumentVersion & {
  creator: {
    id: string;
    displayName: string;
    profilePicture: string | null;
  } | null;
};

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

// Document space with nested children and document count
export type DocumentSpaceWithMeta = DocumentSpace & {
  documentCount: number;
  children: DocumentSpaceWithMeta[];
};
