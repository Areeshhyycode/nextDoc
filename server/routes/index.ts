import type { Express } from "express";
import { createServer, type Server } from "http";

// Route imports
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import teamsRoutes, { kanbanRouter } from "./teams.routes";
import projectsRoutes, {
  projectStatusRouter,
  projectBudgetsRouter,
  projectCostsRouter,
  projectActivitiesRouter,
  projectAttachmentsRouter
} from "./projects.routes";
import goalsRoutes from "./goals.routes";
import sprintsRoutes from "./sprints.routes";
import usersRoutes from "./users.routes";
import workspaceProjectsRoutes, { projectSectionsRouter } from "./workspace-projects.routes";
import storageRoutes, { uploadRouter, attachmentsRouter } from "./storage.routes";
import { storage } from "../storage";

// External controller imports
import { registerDocImportRoutes } from "../controllers/docImport";
import { registerDocNameRoutes } from "../controllers/docName";
import { registerDocsRoutes } from "../controllers/docsController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.use('/api/auth', authRoutes);
  app.use('/api/onboarding', authRoutes);

  // Admin routes
  app.use('/api/admin', adminRoutes);
  app.use('/api/invites', adminRoutes);

  // Teams routes
  app.use('/api/teams', teamsRoutes);
  app.use('/api/team-members', teamsRoutes);
  app.use('/api/kanban-columns', kanbanRouter);

  // Projects routes
  app.use('/api/projects', projectsRoutes);
  app.use('/api/project-status-updates', projectStatusRouter);
  app.use('/api/project-budgets', projectBudgetsRouter);
  app.use('/api/project-costs', projectCostsRouter);
  app.use('/api/project-activities', projectActivitiesRouter);
  app.use('/api/project-attachments', projectAttachmentsRouter);

  // Goals routes
  app.use('/api/goals', goalsRoutes);

  // Sprints routes
  app.use('/api/sprints', sprintsRoutes);

  // Users routes
  app.use('/api/users', usersRoutes);

  // Workspace projects routes
  app.use('/api/workspace-projects', workspaceProjectsRoutes);
  app.use('/api/project-sections', projectSectionsRouter);

  // Metrics route
  app.get("/api/metrics", async (_req, res) => {
    try {
      const metrics = await storage.getProjectMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics", error: String(error) });
    }
  });

  // Storage routes
  app.use('/objects', storageRoutes);
  app.use('/api/objects', uploadRouter);
  app.post('/api/project-attachments', attachmentsRouter);

  // Register doc routes from controllers
  registerDocsRoutes(app);
  registerDocImportRoutes(app);
  registerDocNameRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
