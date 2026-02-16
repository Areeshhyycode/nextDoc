import {
  type User,
  type InsertUser,
  type UpdateUser,
  type Document,
  type InsertDocument,
  type UpdateDocument,
  type DocumentComment,
  type InsertDocumentComment,
  type UpdateDocumentComment,
  type DocumentTemplate,
  type InsertDocumentTemplate,
  type UpdateDocumentTemplate,
  type DocumentWithOwner,
  type PageTreeNode,
  type DocumentSpace,
  type InsertDocumentSpace,
  type UpdateDocumentSpace,
  type DocumentSpaceWithMeta,
  type DocumentSpaceMember,
} from "@shared/schema";

// Import individual storage modules
import { UserStorage, userStorage, type IUserStorage, type UserSearchResult } from "./userStorage";
import { DocumentStorage, documentStorage, type IDocumentStorage } from "./documentStorage";
import { TemplateStorage, type ITemplateStorage } from "./templateStorage";
import { SpaceStorage, type ISpaceStorage } from "./spaceStorage";

// Re-export individual storage modules
export { UserStorage, userStorage, type IUserStorage, type UserSearchResult } from "./userStorage";
export { DocumentStorage, documentStorage, type IDocumentStorage } from "./documentStorage";

// Re-export helpers
export * from "./helpers";

// Combined storage interface
export interface IStorage extends IUserStorage, IDocumentStorage {
  // Document Pages (Hierarchy)
  getDocumentPages(parentDocumentId: string): Promise<Document[]>;
  createDocumentPage(parentDocumentId: string, title: string, ownerId: string): Promise<Document>;
  getPageTree(rootDocumentId: string): Promise<PageTreeNode[]>;
  reorderPage(documentId: string, newOrder: number): Promise<Document | undefined>;
  getRootDocument(documentId: string): Promise<Document | undefined>;
  getShareInDocumentTree(documentId: string, userId: string): Promise<{ permission: "view" | "edit" | "comment" | "edit_comment" } | null>;
}

// Combined DatabaseStorage class that delegates to individual storage modules
export class DatabaseStorage implements IStorage {
  private userStorage = new UserStorage();
  private documentStorage = new DocumentStorage();
  private templateStorage = new TemplateStorage();
  private spaceStorageInstance = new SpaceStorage();

  // ==================== SPACE STORAGE ====================
  getAllSpaces(userId: string): Promise<DocumentSpace[]> {
    return this.spaceStorageInstance.getAllSpaces(userId);
  }

  getSpaceById(id: string): Promise<DocumentSpace | undefined> {
    return this.spaceStorageInstance.getSpaceById(id);
  }

  getSpaceTree(userId: string): Promise<DocumentSpaceWithMeta[]> {
    return this.spaceStorageInstance.getSpaceTree(userId);
  }

  getChildSpaces(parentId: string): Promise<DocumentSpace[]> {
    return this.spaceStorageInstance.getChildSpaces(parentId);
  }

  createSpace(space: InsertDocumentSpace): Promise<DocumentSpace> {
    return this.spaceStorageInstance.createSpace(space);
  }

  updateSpace(id: string, updates: UpdateDocumentSpace): Promise<DocumentSpace | undefined> {
    return this.spaceStorageInstance.updateSpace(id, updates);
  }

  deleteSpace(id: string): Promise<boolean> {
    return this.spaceStorageInstance.deleteSpace(id);
  }

  addDocumentToSpace(spaceId: string, documentId: string): Promise<DocumentSpaceMember> {
    return this.spaceStorageInstance.addDocumentToSpace(spaceId, documentId);
  }

  removeDocumentFromSpace(spaceId: string, documentId: string): Promise<boolean> {
    return this.spaceStorageInstance.removeDocumentFromSpace(spaceId, documentId);
  }

  getDocumentsInSpace(spaceId: string): Promise<string[]> {
    return this.spaceStorageInstance.getDocumentsInSpace(spaceId);
  }

  getSpacesForDocument(documentId: string): Promise<DocumentSpace[]> {
    return this.spaceStorageInstance.getSpacesForDocument(documentId);
  }

  moveDocumentToSpace(documentId: string, fromSpaceId: string | null, toSpaceId: string): Promise<void> {
    return this.spaceStorageInstance.moveDocumentToSpace(documentId, fromSpaceId, toSpaceId);
  }

  // ==================== TEMPLATE STORAGE ====================
  getAllTemplates(): Promise<DocumentTemplate[]> {
    return this.templateStorage.getAllTemplates();
  }

  getPublicTemplates(): Promise<DocumentTemplate[]> {
    return this.templateStorage.getPublicTemplates();
  }

  getTemplateById(id: string): Promise<DocumentTemplate | undefined> {
    return this.templateStorage.getTemplateById(id);
  }

  getTemplatesByCategory(category: string): Promise<DocumentTemplate[]> {
    return this.templateStorage.getTemplatesByCategory(category);
  }

  createTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    return this.templateStorage.createTemplate(template);
  }

  updateTemplate(id: string, updates: UpdateDocumentTemplate): Promise<DocumentTemplate | undefined> {
    return this.templateStorage.updateTemplate(id, updates);
  }

  deleteTemplate(id: string): Promise<boolean> {
    return this.templateStorage.deleteTemplate(id);
  }

  incrementTemplateUsageCount(id: string): Promise<void> {
    return this.templateStorage.incrementUsageCount(id);
  }

  seedDefaultTemplates(): Promise<void> {
    return this.templateStorage.seedDefaultTemplates();
  }

  // ==================== USER STORAGE ====================
  getUser(id: string): Promise<User | undefined> {
    return this.userStorage.getUser(id);
  }

  getUserByEmail(email: string): Promise<User | undefined> {
    return this.userStorage.getUserByEmail(email);
  }

  createUser(user: InsertUser): Promise<User> {
    return this.userStorage.createUser(user);
  }

  updateUser(id: string, updates: UpdateUser): Promise<User | undefined> {
    return this.userStorage.updateUser(id, updates);
  }

  updateUserLastLogin(id: string): Promise<User> {
    return this.userStorage.updateUserLastLogin(id);
  }

  updateUserResetToken(id: string, token: string, expiry: Date): Promise<User | undefined> {
    return this.userStorage.updateUserResetToken(id, token, expiry);
  }

  getUserByResetToken(token: string): Promise<User | undefined> {
    return this.userStorage.getUserByResetToken(token);
  }

  clearResetToken(id: string): Promise<User | undefined> {
    return this.userStorage.clearResetToken(id);
  }

  updateUserRole(id: string, role: 'user' | 'admin' | 'sub-admin'): Promise<User | undefined> {
    return this.userStorage.updateUserRole(id, role);
  }

  updateUserOnlineStatus(id: string, isOnline: boolean): Promise<User | undefined> {
    return this.userStorage.updateUserOnlineStatus(id, isOnline);
  }

  updateUserActivity(id: string): Promise<User | undefined> {
    return this.userStorage.updateUserActivity(id);
  }

  getOnlineUsers(): Promise<User[]> {
    return this.userStorage.getOnlineUsers();
  }

  getUsersByRole(role: 'user' | 'admin' | 'sub-admin'): Promise<User[]> {
    return this.userStorage.getUsersByRole(role);
  }

  getAllUsers(): Promise<User[]> {
    return this.userStorage.getAllUsers();
  }

  searchUsers(query: string, excludeUserId: string, limit?: number): Promise<UserSearchResult[]> {
    return this.userStorage.searchUsers(query, excludeUserId, limit);
  }

  createUserSession(session: any): Promise<any> {
    return this.userStorage.createUserSession(session);
  }

  updateSessionActivity(sessionId: string): Promise<any> {
    return this.userStorage.updateSessionActivity(sessionId);
  }

  deactivateUserSessions(userId: string): Promise<void> {
    return this.userStorage.deactivateUserSessions(userId);
  }

  getActiveUserSessions(): Promise<any[]> {
    return this.userStorage.getActiveUserSessions();
  }

  logActivity(log: any): Promise<any> {
    return this.userStorage.logActivity(log);
  }

  getActivityLogs(options?: { userId?: string; action?: string; limit?: number; offset?: number }): Promise<any[]> {
    return this.userStorage.getActivityLogs(options);
  }

  getUserLoginStats(): Promise<{ userId: string; displayName: string; email: string; lastLogin: Date; loginCount: number; }[]> {
    return this.userStorage.getUserLoginStats();
  }

  createInvitation(invitation: any): Promise<any> {
    return this.userStorage.createInvitation(invitation);
  }

  getInvitations(): Promise<any[]> {
    return this.userStorage.getInvitations();
  }

  getInvitationByEmail(email: string): Promise<any> {
    return this.userStorage.getInvitationByEmail(email);
  }

  // ==================== DOCUMENT STORAGE ====================
  getAllDocuments(): Promise<DocumentWithOwner[]> {
    return this.documentStorage.getAllDocuments();
  }

  getDocument(id: string): Promise<Document | undefined> {
    return this.documentStorage.getDocument(id);
  }

  getDocumentByPublicToken(token: string): Promise<Document | undefined> {
    return this.documentStorage.getDocumentByPublicToken(token);
  }

  getDocumentsByOwner(ownerId: string): Promise<DocumentWithOwner[]> {
    return this.documentStorage.getDocumentsByOwner(ownerId);
  }

  getDocumentsByOwnerPaginated(ownerId: string, options?: import('./documentStorage').PaginationOptions): Promise<import('./documentStorage').PaginatedDocuments> {
    return this.documentStorage.getDocumentsByOwnerPaginated(ownerId, options);
  }

  getDocumentsByCategory(category: 'blank' | 'meeting_notes' | 'project_overview'): Promise<DocumentWithOwner[]> {
    return this.documentStorage.getDocumentsByCategory(category as any);
  }

  createDocument(doc: InsertDocument): Promise<Document> {
    return this.documentStorage.createDocument(doc);
  }

  updateDocument(id: string, updates: UpdateDocument, updateTimestamp?: boolean): Promise<Document | undefined> {
    return this.documentStorage.updateDocument(id, updates, updateTimestamp);
  }

  deleteDocument(id: string): Promise<boolean> {
    return this.documentStorage.deleteDocument(id);
  }

  updateDocumentLastViewed(id: string): Promise<Document | undefined> {
    return this.documentStorage.updateDocumentLastViewed(id);
  }

  isDocumentNameUnique(title: string, excludeDocId?: string): Promise<boolean> {
    return this.documentStorage.isDocumentNameUnique(title, excludeDocId);
  }

  generateUniqueDocumentName(baseTitle: string): Promise<string> {
    return this.documentStorage.generateUniqueDocumentName(baseTitle);
  }

  getDocumentByTitle(title: string): Promise<Document | undefined> {
    return this.documentStorage.getDocumentByTitle(title);
  }

  shareDocument(share: { documentId: string; userId: string; permission: "view" | "edit" | "comment"; sharedBy: string }): Promise<any> {
    return this.documentStorage.shareDocument(share);
  }

  removeDocumentShare(documentId: string, userId: string): Promise<boolean> {
    return this.documentStorage.removeDocumentShare(documentId, userId);
  }

  getDocumentShares(documentId: string): Promise<any[]> {
    return this.documentStorage.getDocumentShares(documentId);
  }

  getDocumentShareForUser(documentId: string, userId: string): Promise<{ permission: "view" | "edit" | "comment" } | null> {
    return this.documentStorage.getDocumentShareForUser(documentId, userId);
  }

  getDocumentsSharedWithUser(userId: string): Promise<DocumentWithOwner[]> {
    return this.documentStorage.getDocumentsSharedWithUser(userId);
  }

  getDocumentsSharedWithUserPaginated(userId: string, options?: import('./documentStorage').PaginationOptions): Promise<import('./documentStorage').PaginatedDocuments> {
    return this.documentStorage.getDocumentsSharedWithUserPaginated(userId, options);
  }

  getAllUserDocumentsPaginated(userId: string, options?: import('./documentStorage').PaginationOptions): Promise<import('./documentStorage').PaginatedDocuments> {
    return this.documentStorage.getAllUserDocumentsPaginated(userId, options);
  }

  updateDocumentSharePermission(documentId: string, userId: string, permission: "view" | "edit" | "comment"): Promise<any> {
    return this.documentStorage.updateDocumentSharePermission(documentId, userId, permission);
  }

  updateSharedUserLastViewed(documentId: string, userId: string): Promise<any> {
    return this.documentStorage.updateSharedUserLastViewed(documentId, userId);
  }

  getDocumentComments(documentId: string): Promise<DocumentComment[]> {
    return this.documentStorage.getDocumentComments(documentId);
  }

  getDocumentComment(id: string): Promise<DocumentComment | undefined> {
    return this.documentStorage.getDocumentComment(id);
  }

  createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment> {
    return this.documentStorage.createDocumentComment(comment);
  }

  updateDocumentComment(id: string, updates: UpdateDocumentComment): Promise<DocumentComment | undefined> {
    return this.documentStorage.updateDocumentComment(id, updates);
  }

  deleteDocumentComment(id: string): Promise<boolean> {
    return this.documentStorage.deleteDocumentComment(id);
  }

  // Document Pages (Hierarchy)
  getDocumentPages(parentDocumentId: string): Promise<Document[]> {
    return this.documentStorage.getDocumentPages(parentDocumentId);
  }

  createDocumentPage(parentDocumentId: string, title: string, ownerId: string): Promise<Document> {
    return this.documentStorage.createDocumentPage(parentDocumentId, title, ownerId);
  }

  getPageTree(rootDocumentId: string): Promise<PageTreeNode[]> {
    return this.documentStorage.getPageTree(rootDocumentId);
  }

  reorderPage(documentId: string, newOrder: number): Promise<Document | undefined> {
    return this.documentStorage.reorderPage(documentId, newOrder);
  }

  getRootDocument(documentId: string): Promise<Document | undefined> {
    return this.documentStorage.getRootDocument(documentId);
  }

  getShareInDocumentTree(documentId: string, userId: string) {
    return this.documentStorage.getShareInDocumentTree(documentId, userId);
  }

  // Trash operations
  restoreDocument(id: string): Promise<boolean> {
    return this.documentStorage.restoreDocument(id);
  }

  permanentlyDeleteDocument(id: string): Promise<boolean> {
    return this.documentStorage.permanentlyDeleteDocument(id);
  }

  getDeletedDocumentsByOwner(ownerId: string): Promise<DocumentWithOwner[]> {
    return this.documentStorage.getDeletedDocumentsByOwner(ownerId);
  }
}

// Export the singleton instance
export const storage = new DatabaseStorage();
