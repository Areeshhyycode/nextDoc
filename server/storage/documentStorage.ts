import {
  documents,
  documentComments,
  documentShares,
  users,
  type Document,
  type InsertDocument,
  type UpdateDocument,
  type DocumentComment,
  type InsertDocumentComment,
  type UpdateDocumentComment,
  type DocumentWithOwner,
  type PageTreeNode,
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, sql, inArray, isNull, asc } from "drizzle-orm";
import { wasDeleted, buildOwnerObject, escapeRegex, fetchLastUpdaterMap, getLastUpdaterIds } from "./helpers";

export interface IDocumentStorage {
  // Documents
  getAllDocuments(): Promise<DocumentWithOwner[]>;
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentByPublicToken(token: string): Promise<Document | undefined>;
  getDocumentsByOwner(ownerId: string): Promise<DocumentWithOwner[]>;
  getDocumentsByCategory(category: 'blank' | 'meeting_notes' | 'project_overview'): Promise<DocumentWithOwner[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: UpdateDocument, updateTimestamp?: boolean): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  updateDocumentLastViewed(id: string): Promise<Document | undefined>;

  // Document Name Uniqueness
  isDocumentNameUnique(title: string, excludeDocId?: string): Promise<boolean>;
  generateUniqueDocumentName(baseTitle: string): Promise<string>;
  getDocumentByTitle(title: string): Promise<Document | undefined>;

  // Document Sharing
  shareDocument(share: { documentId: string; userId: string; permission: "view" | "edit" | "comment" | "edit_comment"; sharedBy: string }): Promise<any>;
  removeDocumentShare(documentId: string, userId: string): Promise<boolean>;
  getDocumentShares(documentId: string): Promise<any[]>;
  getDocumentShareForUser(documentId: string, userId: string): Promise<{ permission: "view" | "edit" | "comment" | "edit_comment" } | null>;
  getDocumentsSharedWithUser(userId: string): Promise<DocumentWithOwner[]>;
  updateDocumentSharePermission(documentId: string, userId: string, permission: "view" | "edit" | "comment" | "edit_comment"): Promise<any>;
  updateSharedUserLastViewed(documentId: string, userId: string): Promise<any>;

  // Document Comments
  getDocumentComments(documentId: string): Promise<DocumentComment[]>;
  createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment>;
  updateDocumentComment(id: string, updates: UpdateDocumentComment): Promise<DocumentComment | undefined>;
  deleteDocumentComment(id: string): Promise<boolean>;

  // Document Pages (Hierarchy)
  getDocumentPages(parentDocumentId: string): Promise<Document[]>;
  createDocumentPage(parentDocumentId: string, title: string, ownerId: string): Promise<Document>;
  getPageTree(rootDocumentId: string): Promise<PageTreeNode[]>;
  reorderPage(documentId: string, newOrder: number): Promise<Document | undefined>;
  getRootDocument(documentId: string): Promise<Document | undefined>;
}

export class DocumentStorage implements IDocumentStorage {
  // Documents Implementation
  async getAllDocuments(): Promise<DocumentWithOwner[]> {
    const rows = await db
      .select({
        doc: documents,
        ownerId: users.id,
        ownerDisplayName: users.displayName,
        ownerEmail: users.email,
        ownerProfilePicture: users.profilePicture,
      })
      .from(documents)
      .leftJoin(users, eq(documents.ownerId, users.id))
      .orderBy(desc(documents.updatedAt));

    return rows.map(row => ({
      ...row.doc,
      owner: buildOwnerObject(row),
    }));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return doc || undefined;
  }

  async getDocumentByPublicToken(token: string): Promise<Document | undefined> {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.publicLinkToken, token));
    return doc || undefined;
  }

  async getDocumentsByOwner(ownerId: string): Promise<DocumentWithOwner[]> {
    const rows = await db
      .select({
        doc: documents,
        ownerId: users.id,
        ownerDisplayName: users.displayName,
        ownerEmail: users.email,
        ownerProfilePicture: users.profilePicture,
      })
      .from(documents)
      .leftJoin(users, eq(documents.ownerId, users.id))
      .where(eq(documents.ownerId, ownerId))
      .orderBy(desc(documents.updatedAt));

    const lastUpdaterIds = getLastUpdaterIds(rows.map(r => r.doc));
    const lastUpdaterMap = await fetchLastUpdaterMap(lastUpdaterIds);

    return rows.map(row => ({
      ...row.doc,
      owner: buildOwnerObject(row),
      lastUpdater: row.doc.lastUpdatedBy ? lastUpdaterMap.get(row.doc.lastUpdatedBy) || null : null,
    }));
  }

  async getDocumentsByCategory(category: 'blank' | 'meeting_notes'): Promise<DocumentWithOwner[]> {
    const rows = await db
      .select({
        doc: documents,
        ownerId: users.id,
        ownerDisplayName: users.displayName,
        ownerEmail: users.email,
        ownerProfilePicture: users.profilePicture,
      })
      .from(documents)
      .leftJoin(users, eq(documents.ownerId, users.id))
      .where(eq(documents.category, category))
      .orderBy(desc(documents.updatedAt));

    const lastUpdaterIds = getLastUpdaterIds(rows.map(r => r.doc));
    const lastUpdaterMap = await fetchLastUpdaterMap(lastUpdaterIds);

    return rows.map(row => ({
      ...row.doc,
      owner: buildOwnerObject(row),
      lastUpdater: row.doc.lastUpdatedBy ? lastUpdaterMap.get(row.doc.lastUpdatedBy) || null : null,
    }));
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [newDoc] = await db
      .insert(documents)
      .values(doc)
      .returning();
    return newDoc;
  }

  async updateDocument(id: string, updates: UpdateDocument, updateTimestamp: boolean = false): Promise<Document | undefined> {
    // Only update updatedAt if content or title changed (passed via updateTimestamp flag)
    const setData = updateTimestamp
      ? { ...updates, updatedAt: sql`CURRENT_TIMESTAMP` }
      : { ...updates };

    const [updated] = await db
      .update(documents)
      .set(setData)
      .where(eq(documents.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDocument(id: string): Promise<boolean> {
    await db.delete(documentComments).where(eq(documentComments.documentId, id));
    const result = await db.delete(documents).where(eq(documents.id, id));
    return wasDeleted(result);
  }

  async updateDocumentLastViewed(id: string): Promise<Document | undefined> {
    const [updated] = await db
      .update(documents)
      .set({ lastViewedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(documents.id, id))
      .returning();
    return updated || undefined;
  }

  // Document Name Uniqueness Implementation
  async isDocumentNameUnique(title: string, excludeDocId?: string): Promise<boolean> {
    // Case-insensitive check for document name
    const normalizedTitle = title.trim().toLowerCase();

    const existingDocs = await db
      .select()
      .from(documents)
      .where(sql`LOWER(TRIM(${documents.title})) = ${normalizedTitle}`);

    // If excluding a specific document (for update scenarios)
    if (excludeDocId) {
      const filteredDocs = existingDocs.filter(doc => doc.id !== excludeDocId);
      return filteredDocs.length === 0;
    }

    return existingDocs.length === 0;
  }

  async generateUniqueDocumentName(baseTitle: string): Promise<string> {
    const trimmedTitle = baseTitle.trim();

    // Check if original title is unique
    const isUnique = await this.isDocumentNameUnique(trimmedTitle);
    if (isUnique) {
      return trimmedTitle;
    }

    // Find all documents with similar names (base title or base title with number)
    const normalizedBase = trimmedTitle.toLowerCase();
    const existingDocs = await db
      .select({ title: documents.title })
      .from(documents)
      .where(sql`LOWER(TRIM(${documents.title})) LIKE ${normalizedBase + '%'}`);

    // Extract existing numbers from titles like "My Doc (1)", "My Doc (2)", etc.
    const existingNumbers: number[] = [];
    const pattern = new RegExp(`^${escapeRegex(normalizedBase)}\\s*\\((\\d+)\\)$`, 'i');

    for (const doc of existingDocs) {
      const match = doc.title.trim().toLowerCase().match(pattern);
      if (match) {
        existingNumbers.push(parseInt(match[1], 10));
      }
    }

    // Find the next available number
    let nextNumber = 1;
    if (existingNumbers.length > 0) {
      nextNumber = Math.max(...existingNumbers) + 1;
    }

    // Generate unique name
    const uniqueTitle = `${trimmedTitle} (${nextNumber})`;

    // Double-check that the generated name is unique
    const isNewUnique = await this.isDocumentNameUnique(uniqueTitle);
    if (!isNewUnique) {
      // Recursively try with the new title
      return this.generateUniqueDocumentName(uniqueTitle);
    }

    return uniqueTitle;
  }

  async getDocumentByTitle(title: string): Promise<Document | undefined> {
    const normalizedTitle = title.trim().toLowerCase();

    const [doc] = await db
      .select()
      .from(documents)
      .where(sql`LOWER(TRIM(${documents.title})) = ${normalizedTitle}`);

    return doc || undefined;
  }

  // Document Comments Implementation
  async getDocumentComments(documentId: string): Promise<DocumentComment[]> {
    const comments = await db
      .select()
      .from(documentComments)
      .where(eq(documentComments.documentId, documentId))
      .orderBy(documentComments.createdAt);
    return comments;
  }

  async createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment> {
    const [newComment] = await db
      .insert(documentComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async updateDocumentComment(id: string, updates: UpdateDocumentComment): Promise<DocumentComment | undefined> {
    const [updated] = await db
      .update(documentComments)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(documentComments.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDocumentComment(id: string): Promise<boolean> {
    const result = await db.delete(documentComments).where(eq(documentComments.id, id));
    return wasDeleted(result);
  }

  // Document Sharing Implementation
  async shareDocument(share: { documentId: string; userId: string; permission: "view" | "edit" | "comment" | "edit_comment"; sharedBy: string }): Promise<any> {
    // Check if share already exists
    const existing = await db
      .select()
      .from(documentShares)
      .where(and(
        eq(documentShares.documentId, share.documentId),
        eq(documentShares.userId, share.userId)
      ));

    if (existing.length > 0) {
      // Update existing share permission
      const [updated] = await db
        .update(documentShares)
        .set({ permission: share.permission })
        .where(and(
          eq(documentShares.documentId, share.documentId),
          eq(documentShares.userId, share.userId)
        ))
        .returning();
      return updated;
    }

    // Create new share
    const [newShare] = await db
      .insert(documentShares)
      .values({
        documentId: share.documentId,
        userId: share.userId,
        permission: share.permission,
        sharedBy: share.sharedBy
      })
      .returning();

    // Update document isShared flag
    await db
      .update(documents)
      .set({ isShared: true })
      .where(eq(documents.id, share.documentId));

    return newShare;
  }

  async removeDocumentShare(documentId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(documentShares)
      .where(and(
        eq(documentShares.documentId, documentId),
        eq(documentShares.userId, userId)
      ));

    // Check if there are any remaining shares
    const remainingShares = await db
      .select()
      .from(documentShares)
      .where(eq(documentShares.documentId, documentId));

    // Update document isShared flag if no more shares
    if (remainingShares.length === 0) {
      await db
        .update(documents)
        .set({ isShared: false })
        .where(eq(documents.id, documentId));
    }

    return wasDeleted(result);
  }

  async getDocumentShares(documentId: string): Promise<any[]> {
    const shares = await db
      .select({
        id: documentShares.id,
        documentId: documentShares.documentId,
        userId: documentShares.userId,
        permission: documentShares.permission,
        sharedBy: documentShares.sharedBy,
        sharedAt: documentShares.sharedAt,
        user: {
          id: users.id,
          displayName: users.displayName,
          email: users.email,
          profilePicture: users.profilePicture
        }
      })
      .from(documentShares)
      .leftJoin(users, eq(documentShares.userId, users.id))
      .where(eq(documentShares.documentId, documentId));

    return shares;
  }

  async getDocumentShareForUser(documentId: string, userId: string): Promise<{ permission: "view" | "edit" | "comment" | "edit_comment" } | null> {
    const [share] = await db
      .select({
        permission: documentShares.permission
      })
      .from(documentShares)
      .where(and(
        eq(documentShares.documentId, documentId),
        eq(documentShares.userId, userId)
      ));

    return share || null;
  }

  async updateDocumentSharePermission(documentId: string, userId: string, permission: "view" | "edit" | "comment" | "edit_comment"): Promise<any> {
    const [updated] = await db
      .update(documentShares)
      .set({ permission })
      .where(and(
        eq(documentShares.documentId, documentId),
        eq(documentShares.userId, userId)
      ))
      .returning();
    return updated || undefined;
  }

  async updateSharedUserLastViewed(documentId: string, userId: string): Promise<any> {
    const [updated] = await db
      .update(documentShares)
      .set({ lastViewedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(
        eq(documentShares.documentId, documentId),
        eq(documentShares.userId, userId)
      ))
      .returning();
    return updated || undefined;
  }

  async getDocumentsSharedWithUser(userId: string): Promise<DocumentWithOwner[]> {
    // Get all document shares for this user with their lastViewedAt
    const sharedDocs = await db
      .select({
        documentId: documentShares.documentId,
        permission: documentShares.permission,
        sharedUserLastViewedAt: documentShares.lastViewedAt
      })
      .from(documentShares)
      .where(eq(documentShares.userId, userId));

    if (sharedDocs.length === 0) {
      return [];
    }

    // Create a map of documentId to shared user's lastViewedAt
    const shareInfoMap = new Map(sharedDocs.map(s => [s.documentId, s.sharedUserLastViewedAt]));

    // Get the actual documents with owner info
    const documentIds = sharedDocs.map(s => s.documentId);
    const docsWithOwner = await db
      .select({
        id: documents.id,
        title: documents.title,
        content: documents.content,
        ownerId: documents.ownerId,
        category: documents.category,
        tags: documents.tags,
        fontStyle: documents.fontStyle,
        fontSize: documents.fontSize,
        pageWidth: documents.pageWidth,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        lastViewedAt: documents.lastViewedAt,
        isFavorite: documents.isFavorite,
        isShared: documents.isShared,
        showCoverImage: documents.showCoverImage,
        showPageIconAndTitle: documents.showPageIconAndTitle,
        showAuthor: documents.showAuthor,
        showContributors: documents.showContributors,
        showSubtitle: documents.showSubtitle,
        showLastModified: documents.showLastModified,
        showPageOutline: documents.showPageOutline,
        lastUpdatedBy: documents.lastUpdatedBy,
        owner: {
          id: users.id,
          displayName: users.displayName,
          email: users.email,
          profilePicture: users.profilePicture
        }
      })
      .from(documents)
      .leftJoin(users, eq(documents.ownerId, users.id))
      .where(inArray(documents.id, documentIds));

    const lastUpdaterIds = getLastUpdaterIds(docsWithOwner);
    const lastUpdaterMap = await fetchLastUpdaterMap(lastUpdaterIds);

    // Override lastViewedAt with the shared user's own view time
    return docsWithOwner.map(doc => ({
      ...doc,
      lastViewedAt: shareInfoMap.get(doc.id) || null, // Use shared user's lastViewedAt
      lastUpdater: doc.lastUpdatedBy ? lastUpdaterMap.get(doc.lastUpdatedBy) || null : null,
    })) as DocumentWithOwner[];
  }

  // Document Pages (Hierarchy) Implementation
  async getDocumentPages(parentDocumentId: string): Promise<Document[]> {
    const pages = await db
      .select()
      .from(documents)
      .where(eq(documents.parentDocumentId, parentDocumentId))
      .orderBy(asc(documents.pageOrder));
    return pages;
  }

  async createDocumentPage(parentDocumentId: string, title: string, ownerId: string): Promise<Document> {
    // Get the next page order for this parent
    const existingPages = await this.getDocumentPages(parentDocumentId);
    const nextOrder = existingPages.length > 0
      ? Math.max(...existingPages.map(p => p.pageOrder || 0)) + 1
      : 0;

    const [newPage] = await db
      .insert(documents)
      .values({
        title,
        ownerId,
        parentDocumentId,
        pageOrder: nextOrder,
        content: "",
        category: "blank",
      })
      .returning();

    return newPage;
  }

  async getPageTree(rootDocumentId: string): Promise<PageTreeNode[]> {
    // Get all descendants of a document recursively
    const buildTree = async (parentId: string): Promise<PageTreeNode[]> => {
      const children = await db
        .select({
          id: documents.id,
          title: documents.title,
          pageOrder: documents.pageOrder,
          parentDocumentId: documents.parentDocumentId,
        })
        .from(documents)
        .where(eq(documents.parentDocumentId, parentId))
        .orderBy(asc(documents.pageOrder));

      const nodes: PageTreeNode[] = [];
      for (const child of children) {
        const grandchildren = await buildTree(child.id);
        nodes.push({
          id: child.id,
          title: child.title,
          pageOrder: child.pageOrder || 0,
          parentDocumentId: child.parentDocumentId,
          children: grandchildren,
        });
      }
      return nodes;
    };

    return buildTree(rootDocumentId);
  }

  async reorderPage(documentId: string, newOrder: number): Promise<Document | undefined> {
    const [updated] = await db
      .update(documents)
      .set({ pageOrder: newOrder })
      .where(eq(documents.id, documentId))
      .returning();
    return updated || undefined;
  }

  async getRootDocument(documentId: string): Promise<Document | undefined> {
    // Traverse up the hierarchy to find the root document
    let currentDoc = await this.getDocument(documentId);

    while (currentDoc && currentDoc.parentDocumentId) {
      currentDoc = await this.getDocument(currentDoc.parentDocumentId);
    }

    return currentDoc;
  }
}

export const documentStorage = new DocumentStorage();
