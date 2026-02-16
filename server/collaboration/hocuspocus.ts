import { Hocuspocus } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import * as Y from "yjs";
import { storage } from "../storage";
import type { IncomingMessage } from "http";
import type { RequestHandler } from "express";

// Authenticate the WebSocket request using the Express session middleware
function authenticateRequest(
  request: IncomingMessage,
  sessionMiddleware: RequestHandler
): Promise<any> {
  return new Promise((resolve) => {
    // Run session middleware on the raw request to populate req.session
    const req = request as any;
    const res = { end: () => {} } as any;
    sessionMiddleware(req, res, () => {
      // After session middleware, check for passport user in session
      const passportData = req.session?.passport;
      if (passportData?.user) {
        // Fetch the full user from storage using the serialized user id
        storage.getUser(passportData.user).then((user) => {
          resolve(user || null);
        }).catch(() => {
          resolve(null);
        });
      } else {
        resolve(null);
      }
    });
  });
}

// Extract HTML from a Yjs document's ProseMirror XML fragment
function extractHtmlFromYDoc(ydoc: Y.Doc): string {
  const xmlFragment = ydoc.getXmlFragment("default");
  if (xmlFragment.length === 0) return "";

  let html = "";
  xmlFragment.toArray().forEach((node) => {
    html += xmlNodeToHtml(node);
  });
  return html;
}

function xmlNodeToHtml(node: any): string {
  if (node instanceof Y.XmlText) {
    return escapeHtml(node.toString());
  }

  if (node instanceof Y.XmlElement) {
    const tag = node.nodeName;
    const attrs = node.getAttributes();
    let attrStr = "";
    for (const [key, value] of Object.entries(attrs)) {
      attrStr += ` ${key}="${escapeHtml(String(value))}"`;
    }

    const children = node
      .toArray()
      .map((child: any) => xmlNodeToHtml(child))
      .join("");

    if (["br", "hr", "img", "input"].includes(tag)) {
      return `<${tag}${attrStr} />`;
    }

    return `<${tag}${attrStr}>${children}</${tag}>`;
  }

  return String(node);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function createCollaborationServer(sessionMiddleware: RequestHandler) {
  const hocuspocus = new Hocuspocus({
    debounce: 3000,
    maxDebounce: 10000,
    quiet: false,

    async onAuthenticate(data: any) {
      const { request, documentName } = data;
      const user = await authenticateRequest(request, sessionMiddleware);
      if (!user) {
        console.log(`[Collaboration] Auth failed: no user for doc ${documentName}`);
        throw new Error("Unauthorized");
      }

      const doc = await storage.getDocument(documentName);
      if (!doc) {
        console.log(`[Collaboration] Auth failed: doc ${documentName} not found`);
        throw new Error("Document not found");
      }

      let permission: string = "none";
      if (doc.ownerId === user.id) {
        permission = "owner";
      } else {
        const share = await storage.getShareInDocumentTree(
          documentName,
          user.id
        );
        if (share) {
          permission = share.permission;
        }
      }

      if (permission === "none") {
        console.log(`[Collaboration] Auth failed: no permission for user ${user.id} on doc ${documentName}`);
        throw new Error("Access denied");
      }

      console.log(`[Collaboration] Auth OK: user ${user.displayName} (${permission}) on doc ${documentName}`);

      return {
        user: {
          id: user.id,
          displayName: user.displayName,
          email: user.email,
          profilePicture: user.profilePicture || null,
          permission,
        },
      };
    },

    async onConnect(data: any) {
      const user = data.context?.user;
      console.log(`[Collaboration] onConnect: user context =`, user ? user.displayName : 'none');
      if (
        user &&
        (user.permission === "view" || user.permission === "comment")
      ) {
        data.connectionConfig = data.connectionConfig || {};
        data.connectionConfig.readOnly = true;
      }
    },

    extensions: [
      new Database({
        async fetch(data: any) {
          const { documentName } = data;
          try {
            const doc = await storage.getDocument(documentName);
            if (!doc) {
              console.log(`[Collaboration] DB fetch: doc ${documentName} not found`);
              return null;
            }

            // Always start fresh from HTML content — never use stored yjsState.
            // The yjsState can become stale when solo autosave updates the content
            // column via HTTP but doesn't update yjsState. Loading stale yjsState
            // would overwrite the user's latest content.
            // The editor will seed the Y.Doc from the HTML content prop instead.
            if (doc.yjsState) {
              console.log(`[Collaboration] DB fetch: clearing stale yjsState for ${documentName}`);
              await storage.updateDocument(documentName, { yjsState: null as any }, false);
            }

            console.log(`[Collaboration] DB fetch: doc ${documentName} — starting fresh (editor will seed from HTML)`);
            return null;
          } catch (error) {
            console.error(
              `[Collaboration] Error fetching document ${documentName}:`,
              error
            );
            return null;
          }
        },

        async store(data: any) {
          const { documentName, state, document: hocusDoc } = data;
          try {
            const yjsStateBase64 = Buffer.from(state).toString("base64");

            // Check how many connections this document has
            const connectionCount = hocusDoc?.getConnectionsCount?.() ?? 0;

            // Only extract and write HTML content when multiple users are connected.
            // For solo users (0-1 connections), the HTTP autosave handles content —
            // writing Yjs-derived HTML here would race with autosave and overwrite it.
            if (connectionCount > 1) {
              const ydoc = new Y.Doc();
              Y.applyUpdate(ydoc, state);

              let htmlContent: string;
              try {
                htmlContent = extractHtmlFromYDoc(ydoc);
              } catch {
                htmlContent = "";
              }

              console.log(`[Collaboration] DB store (multi-user): doc ${documentName} (HTML: ${htmlContent.length} chars, Yjs: ${yjsStateBase64.length} chars)`);

              await storage.updateDocument(
                documentName,
                {
                  ...(htmlContent ? { content: htmlContent } : {}),
                  yjsState: yjsStateBase64,
                },
                true
              );

              ydoc.destroy();
            } else {
              // Solo: don't persist Yjs state at all. The HTTP autosave handles
              // content persistence. Storing yjsState here would create a stale
              // copy that could overwrite newer content on next load.
              console.log(`[Collaboration] DB store (solo): doc ${documentName} — skipping (autosave handles content)`);
            }
          } catch (error) {
            console.error(
              `[Collaboration] Error storing document ${documentName}:`,
              error
            );
          }
        },
      }),
    ],
  });

  return hocuspocus;
}
