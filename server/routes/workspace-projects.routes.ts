import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import { workspaceProjects } from "@shared/schema";
import { db } from "../db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// Get all workspace projects for user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const projects = await storage.getWorkspaceProjectsForUser(userId);
    res.json(projects);
  } catch (error) {
    console.error("Error fetching workspace projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Get single workspace project
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const project = await storage.getWorkspaceProject(req.params.id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// Create workspace project
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const { name, color, startDate, endDate, privacy, memberIds, defaultLayout } = req.body;

    const project = await storage.createWorkspaceProject({
      name,
      color,
      startDate,
      endDate,
      ownerId: userId,
      privacy,
      memberIds,
      defaultLayout
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
});

// Update workspace project (PUT)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { name, color, startDate, endDate, privacy, memberIds, defaultLayout } = req.body;

    const project = await storage.updateWorkspaceProject(req.params.id, {
      name,
      color,
      startDate,
      endDate,
      privacy,
      memberIds,
      defaultLayout
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
});

// Update workspace project (PATCH)
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    const [project] = await db
      .update(workspaceProjects)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(workspaceProjects.id, req.params.id))
      .returning();

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
});

// Delete workspace project
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteWorkspaceProject(req.params.id);
    if (!success) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

export default router;

// Project sections routes
export const projectSectionsRouter = Router();

projectSectionsRouter.get("/:projectId", requireAuth, async (req, res) => {
  try {
    const sections = await storage.getProjectSections(req.params.projectId);
    res.json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ message: "Failed to fetch sections" });
  }
});

projectSectionsRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { projectId, name, order } = req.body;
    const section = await storage.createProjectSection({
      projectId,
      name,
      order: order ?? 0,
      isCollapsed: false,
    });
    res.status(201).json(section);
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(500).json({ message: "Failed to create section" });
  }
});

projectSectionsRouter.patch("/:id", requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    const section = await storage.updateProjectSection(req.params.id, updates);
    if (!section) {
      res.status(404).json({ message: "Section not found" });
      return;
    }
    res.json(section);
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({ message: "Failed to update section" });
  }
});

projectSectionsRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteProjectSection(req.params.id);
    if (!success) {
      res.status(404).json({ message: "Section not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({ message: "Failed to delete section" });
  }
});
