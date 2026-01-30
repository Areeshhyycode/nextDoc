/**
 * Get Public Document Handler
 *
 * GET /api/public/docs/:token
 *
 * Production-grade implementation:
 * - No authentication required
 * - Validates token format
 * - Checks expiry and returns 410 Gone for expired links
 * - Logs access for analytics (document ID, timestamp, IP)
 * - Returns appropriate cache headers
 * - Rate limited to prevent brute-force attacks
 */

import type { Request, Response } from "express";
import { publicDocumentService, PublicDocumentError } from "../../services/publicDocumentService";
import { getClientIp } from "../../middleware/rateLimiter";

export async function getPublicDocumentHandler(req: Request, res: Response) {
  try {
    const { token } = req.params;

    // Get client information for logging
    const clientIp = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "unknown";

    // Use service to get document (handles validation, expiry, logging)
    const document = await publicDocumentService.getPublicDocument(token, {
      ip: clientIp,
      userAgent,
    });

    // Set cache headers for better performance
    const cacheHeaders = publicDocumentService.getCacheHeaders();
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Return document data
    res.json({
      id: document.id,
      title: document.title,
      content: document.content,
      pageStyles: document.pageStyles,
      updatedAt: document.updatedAt,
      createdAt: document.createdAt,
      ownerName: document.ownerName,
      expiresAt: document.expiresAt,
      // Always read-only for public documents
      isReadOnly: true,
    });
  } catch (error) {
    if (error instanceof PublicDocumentError) {
      // Return appropriate status codes
      // 400 - Invalid token format
      // 403 - Public link disabled
      // 404 - Document not found
      // 410 - Link expired (Gone)
      return res.status(error.statusCode).json({
        message: error.message,
        code: error.statusCode === 410 ? "LINK_EXPIRED" : undefined,
      });
    }

    console.error("Error fetching public document:", error);
    res.status(500).json({ message: "Failed to fetch document" });
  }
}
