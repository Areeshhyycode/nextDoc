import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import { insertProjectSchema, updateProjectSchema, projectStatusUpdates, projectBudgets, projectCosts, projectActivities, projectAttachments, insertProjectBudgetSchema, insertProjectCostSchema, users, projects } from "@shared/schema";
import { z } from "zod";
import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

// Get all projects
router.get("/", async (req, res) => {
  try {
    const { department, status, owner, search } = req.query;

    let projectList;
    if (search) {
      projectList = await storage.searchProjects(search as string);
    } else if (department) {
      projectList = await storage.getProjectsByDepartment(department as string);
    } else if (status) {
      projectList = await storage.getProjectsByStatus(status as string);
    } else if (owner) {
      projectList = await storage.getProjectsByOwner(owner as string);
    } else {
      projectList = await storage.getAllProjects();
    }

    res.json(projectList);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects", error: String(error) });
  }
});

// Get single project
router.get("/:id", async (req, res) => {
  try {
    const project = await storage.getProject(req.params.id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// Create project
router.post("/", async (req, res) => {
  try {
    console.log("Creating project with data:", req.body);
    const validatedData = insertProjectSchema.parse(req.body);
    console.log("Validated data:", validatedData);
    const project = await storage.createProject(validatedData);
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create project", error: String(error) });
    }
  }
});

// Update project
router.patch("/:id", async (req, res) => {
  try {
    const validatedData = updateProjectSchema.parse(req.body);
    const project = await storage.updateProject(req.params.id, validatedData);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to update project" });
    }
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  try {
    const success = await storage.deleteProject(req.params.id);
    if (!success) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project" });
  }
});

// Get dependencies
router.get("/:id/dependencies", async (req, res) => {
  try {
    const dependencyInfo = await storage.getDependencyInfo(req.params.id);
    res.json(dependencyInfo);
  } catch (error) {
    console.error("Error fetching dependency info:", error);
    res.status(500).json({ message: "Failed to fetch dependency information" });
  }
});

// Validate dependencies
router.post("/:id/validate-dependencies", async (req, res) => {
  try {
    const { dependencies } = req.body;
    await storage.validateAndBlockIfNeeded(req.params.id, dependencies);
    res.json({ success: true });
  } catch (error) {
    console.error("Error validating dependencies:", error);
    res.status(500).json({ message: "Failed to validate dependencies" });
  }
});

// Schedule project
router.put("/:id/schedule", async (req, res) => {
  try {
    const { scheduledDate } = req.body;
    const project = await storage.updateProject(req.params.id, { scheduledDate });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error("Error scheduling project:", error);
    res.status(500).json({ message: "Failed to schedule project" });
  }
});

// Get project tasks
router.get("/:projectId/tasks", requireAuth, async (req, res) => {
  try {
    const tasks = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceProjectId, req.params.projectId))
      .orderBy(desc(projects.createdAt));
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    res.status(500).json({ message: "Failed to fetch project tasks" });
  }
});

// Create project task
router.post("/:projectId/tasks", requireAuth, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      workspaceProjectId: req.params.projectId,
    };
    const validatedData = insertProjectSchema.parse(taskData);
    const [task] = await db
      .insert(projects)
      .values(validatedData)
      .returning();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating project task:", error);
    res.status(500).json({ message: "Failed to create project task" });
  }
});

// Update project task
router.patch("/:projectId/tasks/:taskId", requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    const [task] = await db
      .update(projects)
      .set({ ...updates, lastUpdated: sql`CURRENT_TIMESTAMP` })
      .where(eq(projects.id, req.params.taskId))
      .returning();

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error("Error updating project task:", error);
    res.status(500).json({ message: "Failed to update project task" });
  }
});

// Get project budgets
router.get("/:projectId/budgets", requireAuth, async (req, res) => {
  try {
    const budgets = await db
      .select()
      .from(projectBudgets)
      .where(eq(projectBudgets.projectId, req.params.projectId))
      .orderBy(desc(projectBudgets.createdAt));
    res.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ message: "Failed to fetch budgets" });
  }
});

// Create project budget
router.post("/:projectId/budgets", requireAuth, async (req, res) => {
  try {
    const validatedData = insertProjectBudgetSchema.parse(req.body);
    const [budget] = await db
      .insert(projectBudgets)
      .values(validatedData)
      .returning();
    res.status(201).json(budget);
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ message: "Failed to create budget" });
  }
});

// Delete project budget
router.delete("/:projectId/budgets/:id", requireAuth, async (req, res) => {
  try {
    await db
      .delete(projectBudgets)
      .where(eq(projectBudgets.id, req.params.id));
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ message: "Failed to delete budget" });
  }
});

// Get project costs
router.get("/:projectId/costs", requireAuth, async (req, res) => {
  try {
    const costs = await db
      .select()
      .from(projectCosts)
      .where(eq(projectCosts.projectId, req.params.projectId))
      .orderBy(desc(projectCosts.createdAt));
    res.json(costs);
  } catch (error) {
    console.error("Error fetching costs:", error);
    res.status(500).json({ message: "Failed to fetch costs" });
  }
});

// Create project cost
router.post("/:projectId/costs", requireAuth, async (req, res) => {
  try {
    const validatedData = insertProjectCostSchema.parse(req.body);
    const [cost] = await db
      .insert(projectCosts)
      .values(validatedData)
      .returning();
    res.status(201).json(cost);
  } catch (error) {
    console.error("Error creating cost:", error);
    res.status(500).json({ message: "Failed to create cost" });
  }
});

// Delete project cost
router.delete("/:projectId/costs/:id", requireAuth, async (req, res) => {
  try {
    await db
      .delete(projectCosts)
      .where(eq(projectCosts.id, req.params.id));
    res.status(200).json({ message: "Cost deleted successfully" });
  } catch (error) {
    console.error("Error deleting cost:", error);
    res.status(500).json({ message: "Failed to delete cost" });
  }
});

export default router;

// Project status updates routes
export const projectStatusRouter = Router();

projectStatusRouter.get("/:projectId", requireAuth, async (req, res) => {
  try {
    const updates = await db
      .select({
        id: projectStatusUpdates.id,
        projectId: projectStatusUpdates.projectId,
        status: projectStatusUpdates.status,
        description: projectStatusUpdates.description,
        userId: projectStatusUpdates.userId,
        createdAt: projectStatusUpdates.createdAt,
        userName: users.displayName,
        userEmail: users.email,
      })
      .from(projectStatusUpdates)
      .leftJoin(users, eq(projectStatusUpdates.userId, users.id))
      .where(eq(projectStatusUpdates.projectId, req.params.projectId))
      .orderBy(desc(projectStatusUpdates.createdAt));
    res.json(updates);
  } catch (error) {
    console.error("Error fetching status updates:", error);
    res.status(500).json({ message: "Failed to fetch status updates" });
  }
});

projectStatusRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { projectId, status, description, userId } = req.body;
    const [statusUpdate] = await db
      .insert(projectStatusUpdates)
      .values({ projectId, status, description, userId })
      .returning();
    res.status(201).json(statusUpdate);
  } catch (error) {
    console.error("Error creating status update:", error);
    res.status(500).json({ message: "Failed to create status update" });
  }
});

// Project budgets routes (direct path)
export const projectBudgetsRouter = Router();

projectBudgetsRouter.get("/:projectId", requireAuth, async (req, res) => {
  try {
    const budgets = await db
      .select()
      .from(projectBudgets)
      .where(eq(projectBudgets.projectId, req.params.projectId))
      .orderBy(desc(projectBudgets.createdAt));
    res.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ message: "Failed to fetch budgets" });
  }
});

projectBudgetsRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { projectId, name, type, amount, currency, billDate, category, description } = req.body;
    const [budget] = await db
      .insert(projectBudgets)
      .values({ projectId, name, type, amount, currency: currency || "USD", billDate, category, description })
      .returning();
    res.status(201).json(budget);
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ message: "Failed to create budget" });
  }
});

// Project costs routes (direct path)
export const projectCostsRouter = Router();

projectCostsRouter.get("/:projectId", requireAuth, async (req, res) => {
  try {
    const costs = await db
      .select()
      .from(projectCosts)
      .where(eq(projectCosts.projectId, req.params.projectId))
      .orderBy(desc(projectCosts.createdAt));
    res.json(costs);
  } catch (error) {
    console.error("Error fetching costs:", error);
    res.status(500).json({ message: "Failed to fetch costs" });
  }
});

projectCostsRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { projectId, name, type, amount, currency, date, category, description } = req.body;
    const [cost] = await db
      .insert(projectCosts)
      .values({ projectId, name, type, amount, currency: currency || "USD", date, category, description })
      .returning();
    res.status(201).json(cost);
  } catch (error) {
    console.error("Error creating cost:", error);
    res.status(500).json({ message: "Failed to create cost" });
  }
});

projectCostsRouter.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { name, type, amount, currency, date, category, description } = req.body;
    const [cost] = await db
      .update(projectCosts)
      .set({ name, type, amount, currency, date, category, description })
      .where(eq(projectCosts.id, req.params.id))
      .returning();

    if (!cost) {
      res.status(404).json({ message: "Cost not found" });
      return;
    }

    res.json(cost);
  } catch (error) {
    console.error("Error updating cost:", error);
    res.status(500).json({ message: "Failed to update cost" });
  }
});

projectCostsRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const [cost] = await db
      .delete(projectCosts)
      .where(eq(projectCosts.id, req.params.id))
      .returning();

    if (!cost) {
      res.status(404).json({ message: "Cost not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting cost:", error);
    res.status(500).json({ message: "Failed to delete cost" });
  }
});

// Project activities routes
export const projectActivitiesRouter = Router();

projectActivitiesRouter.get("/:projectId", requireAuth, async (req, res) => {
  try {
    const activities = await db
      .select()
      .from(projectActivities)
      .where(eq(projectActivities.projectId, req.params.projectId))
      .orderBy(desc(projectActivities.createdAt));
    res.json(activities);
  } catch (error) {
    console.error("Error fetching project activities:", error);
    res.status(500).json({ message: "Failed to fetch project activities" });
  }
});

projectActivitiesRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { projectId, userId, activityType, entityName, oldValue, newValue } = req.body;
    const [activity] = await db
      .insert(projectActivities)
      .values({ projectId, userId, activityType, entityName, oldValue, newValue })
      .returning();
    res.status(201).json(activity);
  } catch (error) {
    console.error("Error creating project activity:", error);
    res.status(500).json({ message: "Failed to create project activity" });
  }
});

// Project attachments routes
export const projectAttachmentsRouter = Router();

projectAttachmentsRouter.get("/:projectId", requireAuth, async (req, res) => {
  try {
    const attachments = await db
      .select()
      .from(projectAttachments)
      .where(eq(projectAttachments.projectId, req.params.projectId))
      .orderBy(desc(projectAttachments.createdAt));
    res.json(attachments);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    res.status(500).json({ message: "Failed to fetch attachments" });
  }
});

projectAttachmentsRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    await db
      .delete(projectAttachments)
      .where(eq(projectAttachments.id, req.params.id));

    res.status(200).json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ message: "Failed to delete attachment" });
  }
});
