/**
 * Documents Controller
 * Re-exports all document-related handlers from modular files
 *
 * Each API has its own file in the ./docs/ folder:
 * - getAllDocs.ts      - GET /api/docs
 * - getDocById.ts      - GET /api/docs/:id
 * - createDoc.ts       - POST /api/docs
 * - updateDoc.ts       - PUT /api/docs/:id
 * - deleteDoc.ts       - DELETE /api/docs/:id
 * - duplicateDoc.ts    - POST /api/docs/:id/duplicate
 * - toggleFavorite.ts  - PATCH /api/docs/:id/favorite
 * - markAsViewed.ts    - PATCH /api/docs/:id/view
 * - getComments.ts     - GET /api/docs/:id/comments
 * - createComment.ts   - POST /api/docs/:id/comments
 * - updateComment.ts   - PUT /api/docs/:docId/comments/:commentId
 * - deleteComment.ts   - DELETE /api/docs/:docId/comments/:commentId
 * - shareDocument.ts   - POST /api/docs/:documentId/shares
 * - getDocumentShares.ts       - GET /api/docs/:documentId/shares
 * - updateSharePermission.ts   - PATCH /api/docs/:documentId/shares/:shareUserId
 * - removeDocumentShare.ts     - DELETE /api/docs/:documentId/shares/:shareUserId
 * - searchUsersForSharing.ts   - GET /api/users/search
 * - togglePublicLink.ts        - PATCH /api/docs/:id/public-link
 * - getPublicDocument.ts       - GET /api/public/docs/:token
 */

export {
  // Document CRUD
  getAllDocsHandler,
  getDocByIdHandler,
  createDocHandler,
  updateDocHandler,
  deleteDocHandler,

  // Document Actions
  duplicateDocHandler,
  toggleFavoriteHandler,
  markAsViewedHandler,

  // Comments
  getCommentsHandler,
  createCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,

  // Sharing
  shareDocumentHandler,
  getDocumentSharesHandler,
  updateSharePermissionHandler,
  removeDocumentShareHandler,
  searchUsersForSharingHandler,

  // Public Link
  togglePublicLinkHandler,
  getPublicDocumentHandler,

  // Route Registration
  registerDocsRoutes,
} from "./docs";
