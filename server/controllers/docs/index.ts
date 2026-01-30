import type { Express } from "express";
import { requireAuth } from "../../auth";
import { publicDocRateLimiter, userSearchRateLimiter, shareDocumentRateLimiter } from "../../middleware/rateLimiter";

// Document CRUD
export { getAllDocsHandler } from "./getAllDocs";
export { getDocsPaginatedHandler } from "./getDocsPaginated";
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
export { inviteByEmailHandler, getDocumentInvitesHandler, revokeDocumentInviteHandler } from "./inviteByEmail";

// Public Link
export { togglePublicLinkHandler } from "./togglePublicLink";
export { getPublicDocumentHandler } from "./getPublicDocument";
export { regeneratePublicLinkHandler, updatePublicLinkExpiryHandler, getPublicLinkInfoHandler } from "./regeneratePublicLink";

// Document Pages (Hierarchy)
export { getDocPagesHandler } from "./getDocPages";
export { createDocPageHandler } from "./createDocPage";
export { getDocPageTreeHandler } from "./getDocPageTree";
export { getRootDocumentHandler } from "./getRootDocument";

// Document Protection
export { protectDocumentHandler } from "./protectDocument";

// Document Import
export { validateFileHandler } from "./validateFile";
export { importDocumentHandler } from "./importDocument";

// Import handlers for route registration
import { getAllDocsHandler } from "./getAllDocs";
import { getDocsPaginatedHandler } from "./getDocsPaginated";
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
import { inviteByEmailHandler, getDocumentInvitesHandler, revokeDocumentInviteHandler } from "./inviteByEmail";
import { togglePublicLinkHandler } from "./togglePublicLink";
import { getPublicDocumentHandler } from "./getPublicDocument";
import { regeneratePublicLinkHandler, updatePublicLinkExpiryHandler, getPublicLinkInfoHandler } from "./regeneratePublicLink";
import { getDocPagesHandler } from "./getDocPages";
import { createDocPageHandler } from "./createDocPage";
import { getDocPageTreeHandler } from "./getDocPageTree";
import { getRootDocumentHandler } from "./getRootDocument";
import { protectDocumentHandler } from "./protectDocument";
import {
  getTemplatesHandler,
  getTemplateByIdHandler,
  createTemplateHandler,
  updateTemplateHandler,
  deleteTemplateHandler,
  useTemplateHandler,
  seedTemplatesHandler
} from "./templates";
import {
  getSpacesHandler,
  getSpaceByIdHandler,
  createSpaceHandler,
  updateSpaceHandler,
  deleteSpaceHandler,
  getSpaceDocumentsHandler,
  addDocumentToSpaceHandler,
  removeDocumentFromSpaceHandler,
  moveDocumentHandler,
  getDocumentSpacesHandler
} from "./spaces";

/**
 * Register all document routes
 */
export function registerDocsRoutes(app: Express) {
  // Document spaces routes (must be before :id routes to avoid conflict)
  app.get("/api/docs/spaces", requireAuth, getSpacesHandler as any);
  app.post("/api/docs/spaces", requireAuth, createSpaceHandler as any);
  app.post("/api/docs/spaces/move-document", requireAuth, moveDocumentHandler as any);
  app.get("/api/docs/spaces/:id", requireAuth, getSpaceByIdHandler as any);
  app.patch("/api/docs/spaces/:id", requireAuth, updateSpaceHandler as any);
  app.delete("/api/docs/spaces/:id", requireAuth, deleteSpaceHandler as any);
  app.get("/api/docs/spaces/:id/documents", requireAuth, getSpaceDocumentsHandler as any);
  app.post("/api/docs/spaces/:id/documents", requireAuth, addDocumentToSpaceHandler as any);
  app.delete("/api/docs/spaces/:id/documents/:documentId", requireAuth, removeDocumentFromSpaceHandler as any);

  // Document templates routes (must be before :id routes to avoid conflict)
  app.get("/api/docs/templates", requireAuth, getTemplatesHandler as any);
  app.post("/api/docs/templates", requireAuth, createTemplateHandler as any);
  app.post("/api/docs/templates/seed", requireAuth, seedTemplatesHandler as any);
  app.get("/api/docs/templates/:id", requireAuth, getTemplateByIdHandler as any);
  app.patch("/api/docs/templates/:id", requireAuth, updateTemplateHandler as any);
  app.delete("/api/docs/templates/:id", requireAuth, deleteTemplateHandler as any);
  app.post("/api/docs/templates/:id/use", requireAuth, useTemplateHandler as any);

  // Document CRUD routes
  app.get("/api/docs", requireAuth, getAllDocsHandler as any);
  app.get("/api/docs/paginated", requireAuth, getDocsPaginatedHandler as any);
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

  // Document sharing routes (with rate limiting)
  app.get("/api/docs/:documentId/shares", requireAuth, getDocumentSharesHandler as any);
  app.post("/api/docs/:documentId/shares", requireAuth, shareDocumentRateLimiter, shareDocumentHandler as any);
  app.patch("/api/docs/:documentId/shares/:shareUserId", requireAuth, shareDocumentRateLimiter, updateSharePermissionHandler as any);
  app.delete("/api/docs/:documentId/shares/:shareUserId", requireAuth, shareDocumentRateLimiter, removeDocumentShareHandler as any);

  // User search for sharing (rate limited to prevent email enumeration)
  app.get("/api/users/search", requireAuth, userSearchRateLimiter, searchUsersForSharingHandler as any);

  // Document invite routes (for inviting unregistered users via email)
  app.get("/api/docs/:documentId/invites", requireAuth, getDocumentInvitesHandler as any);
  app.post("/api/docs/:documentId/invites", requireAuth, shareDocumentRateLimiter, inviteByEmailHandler as any);
  app.delete("/api/docs/:documentId/invites/:inviteId", requireAuth, revokeDocumentInviteHandler as any);

  // Public link routes (authenticated - for document owners)
  app.get("/api/docs/:id/public-link", requireAuth, getPublicLinkInfoHandler as any);
  app.patch("/api/docs/:id/public-link", requireAuth, togglePublicLinkHandler as any);
  app.post("/api/docs/:id/public-link/regenerate", requireAuth, regeneratePublicLinkHandler as any);
  app.patch("/api/docs/:id/public-link/expiry", requireAuth, updatePublicLinkExpiryHandler as any);

  // Public document access (no auth required, rate limited)
  app.get("/api/public/docs/:token", publicDocRateLimiter, getPublicDocumentHandler as any);

  // Document pages (hierarchy) routes
  app.get("/api/docs/:id/pages", requireAuth, getDocPagesHandler as any);
  app.post("/api/docs/:id/pages", requireAuth, createDocPageHandler as any);
  app.get("/api/docs/:id/page-tree", requireAuth, getDocPageTreeHandler as any);
  app.get("/api/docs/:id/root", requireAuth, getRootDocumentHandler as any);

  // Document protection route
  app.patch("/api/docs/:id/protect", requireAuth, protectDocumentHandler as any);

  // Document spaces route (get spaces for a specific document)
  app.get("/api/docs/:documentId/spaces", requireAuth, getDocumentSpacesHandler as any);
}
