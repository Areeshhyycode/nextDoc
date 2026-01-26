import type { Express } from "express";
import { requireAuth } from "../../auth";

// Document CRUD
export { getAllDocsHandler } from "./getAllDocs";
export { getDocByIdHandler } from "./getDocById";
export { createDocHandler } from "./createDoc";
export { updateDocHandler } from "./updateDoc";
export { deleteDocHandler } from "./deleteDoc";

// Document Actions
export { duplicateDocHandler } from "./duplicateDoc";
export { toggleFavoriteHandler } from "./toggleFavorite";
export { markAsViewedHandler } from "./markAsViewed";

// Comments
export { getCommentsHandler } from "./getComments";
export { createCommentHandler } from "./createComment";
export { updateCommentHandler } from "./updateComment";
export { deleteCommentHandler } from "./deleteComment";

// Sharing
export { shareDocumentHandler } from "./shareDocument";
export { getDocumentSharesHandler } from "./getDocumentShares";
export { updateSharePermissionHandler } from "./updateSharePermission";
export { removeDocumentShareHandler } from "./removeDocumentShare";
export { searchUsersForSharingHandler } from "./searchUsersForSharing";

// Public Link
export { togglePublicLinkHandler } from "./togglePublicLink";
export { getPublicDocumentHandler } from "./getPublicDocument";

// Document Pages (Hierarchy)
export { getDocPagesHandler } from "./getDocPages";
export { createDocPageHandler } from "./createDocPage";
export { getDocPageTreeHandler } from "./getDocPageTree";
export { getRootDocumentHandler } from "./getRootDocument";

// Document Protection
export { protectDocumentHandler } from "./protectDocument";

// Import handlers for route registration
import { getAllDocsHandler } from "./getAllDocs";
import { getDocByIdHandler } from "./getDocById";
import { createDocHandler } from "./createDoc";
import { updateDocHandler } from "./updateDoc";
import { deleteDocHandler } from "./deleteDoc";
import { duplicateDocHandler } from "./duplicateDoc";
import { toggleFavoriteHandler } from "./toggleFavorite";
import { markAsViewedHandler } from "./markAsViewed";
import { getCommentsHandler } from "./getComments";
import { createCommentHandler } from "./createComment";
import { updateCommentHandler } from "./updateComment";
import { deleteCommentHandler } from "./deleteComment";
import { shareDocumentHandler } from "./shareDocument";
import { getDocumentSharesHandler } from "./getDocumentShares";
import { updateSharePermissionHandler } from "./updateSharePermission";
import { removeDocumentShareHandler } from "./removeDocumentShare";
import { searchUsersForSharingHandler } from "./searchUsersForSharing";
import { togglePublicLinkHandler } from "./togglePublicLink";
import { getPublicDocumentHandler } from "./getPublicDocument";
import { getDocPagesHandler } from "./getDocPages";
import { createDocPageHandler } from "./createDocPage";
import { getDocPageTreeHandler } from "./getDocPageTree";
import { getRootDocumentHandler } from "./getRootDocument";
import { protectDocumentHandler } from "./protectDocument";

/**
 * Register all document routes
 */
export function registerDocsRoutes(app: Express) {
  // Document CRUD routes
  app.get("/api/docs", requireAuth, getAllDocsHandler as any);
  app.get("/api/docs/:id", requireAuth, getDocByIdHandler as any);
  app.post("/api/docs", requireAuth, createDocHandler as any);
  app.put("/api/docs/:id", requireAuth, updateDocHandler as any);
  app.delete("/api/docs/:id", requireAuth, deleteDocHandler as any);

  // Document duplicate route
  app.post("/api/docs/:id/duplicate", requireAuth, duplicateDocHandler as any);

  // Document favorite toggle route
  app.patch("/api/docs/:id/favorite", requireAuth, toggleFavoriteHandler as any);

  // Document view tracking route
  app.patch("/api/docs/:id/view", requireAuth, markAsViewedHandler as any);

  // Document comments routes
  app.get("/api/docs/:id/comments", requireAuth, getCommentsHandler as any);
  app.post("/api/docs/:id/comments", requireAuth, createCommentHandler as any);
  app.put("/api/docs/:docId/comments/:commentId", requireAuth, updateCommentHandler as any);
  app.delete("/api/docs/:docId/comments/:commentId", requireAuth, deleteCommentHandler as any);

  // Document sharing routes
  app.get("/api/docs/:documentId/shares", requireAuth, getDocumentSharesHandler as any);
  app.post("/api/docs/:documentId/shares", requireAuth, shareDocumentHandler as any);
  app.patch("/api/docs/:documentId/shares/:shareUserId", requireAuth, updateSharePermissionHandler as any);
  app.delete("/api/docs/:documentId/shares/:shareUserId", requireAuth, removeDocumentShareHandler as any);

  // User search for sharing
  app.get("/api/users/search", requireAuth, searchUsersForSharingHandler as any);

  // Public link routes
  app.patch("/api/docs/:id/public-link", requireAuth, togglePublicLinkHandler as any);
  app.get("/api/public/docs/:token", getPublicDocumentHandler as any); // No auth required

  // Document pages (hierarchy) routes
  app.get("/api/docs/:id/pages", requireAuth, getDocPagesHandler as any);
  app.post("/api/docs/:id/pages", requireAuth, createDocPageHandler as any);
  app.get("/api/docs/:id/page-tree", requireAuth, getDocPageTreeHandler as any);
  app.get("/api/docs/:id/root", requireAuth, getRootDocumentHandler as any);

  // Document protection route
  app.patch("/api/docs/:id/protect", requireAuth, protectDocumentHandler as any);
}
