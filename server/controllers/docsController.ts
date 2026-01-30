

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
