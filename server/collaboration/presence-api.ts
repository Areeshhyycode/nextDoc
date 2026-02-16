import type { Express } from "express";
import type { Hocuspocus } from "@hocuspocus/server";
import { requireAuth } from "../auth";

export function registerPresenceRoutes(
  app: Express,
  hocuspocusServer: Hocuspocus
) {
  app.get("/api/docs/:id/presence", requireAuth, (req, res) => {
    const docId = req.params.id;

    const document = hocuspocusServer.documents.get(docId);

    if (!document) {
      return res.json({ users: [] });
    }

    const users: any[] = [];
    const seen = new Set<string>();

    document.awareness.getStates().forEach((state: any) => {
      if (state.user && !seen.has(state.user.id)) {
        seen.add(state.user.id);
        users.push({
          id: state.user.id,
          displayName: state.user.displayName,
          email: state.user.email,
          profilePicture: state.user.profilePicture,
          color: state.user.color,
          permission: state.user.permission,
        });
      }
    });

    res.json({ users });
  });
}
