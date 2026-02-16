import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { createCollaborationServer } from "../collaboration/hocuspocus";
import { registerPresenceRoutes } from "../collaboration/presence-api";
import authRoutes from "./auth.routes";

// External controller imports
import { registerDocImportRoutes } from "../controllers/docImport";
import { registerDocNameRoutes } from "../controllers/docName";
import { registerDocsRoutes } from "../controllers/docsController";

export async function registerRoutes(app: Express, sessionMw?: RequestHandler): Promise<Server> {
  // Register auth routes
  app.use('/api/auth', authRoutes);

  // Register doc routes from controllers
  registerDocsRoutes(app);
  registerDocImportRoutes(app);
  registerDocNameRoutes(app);

  const httpServer = createServer(app);

  // Set up real-time collaboration via Hocuspocus WebSocket server
  const hocuspocusServer = createCollaborationServer(sessionMw!);
  registerPresenceRoutes(app, hocuspocusServer);

  // Create a WebSocket server for collaboration (no HTTP server — we handle upgrades manually)
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    const pathname = new URL(
      request.url || "",
      `http://${request.headers.host}`
    ).pathname;
    if (pathname === "/collaboration") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        hocuspocusServer.handleConnection(ws, request);
      });
    }
    // Don't destroy socket for non-matching paths (Vite HMR needs them)
  });

  return httpServer;
}
