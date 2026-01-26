import { Router } from "express";
import { storage } from "../storage";
import { insertSprintSchema, updateSprintSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all sprints
router.get("/", async (_req, res) => {
  try {
    const sprints = await storage.getAllSprints();
    res.json(sprints);
  } catch (error) {
    console.error("Error fetching sprints:", error);
    res.status(500).json({ message: "Failed to fetch sprints" });
  }
});

// Get single sprint
router.get("/:id", async (req, res) => {
  try {
    const sprint = await storage.getSprint(req.params.id);
    if (!sprint) {
      res.status(404).json({ message: "Sprint not found" });
      return;
    }
    res.json(sprint);
  } catch (error) {
    console.error("Error fetching sprint:", error);
    res.status(500).json({ message: "Failed to fetch sprint" });
  }
});

// Get sprint progress
router.get("/:id/progress", async (req, res) => {
  try {
    const progress = await storage.getSprintProgress(req.params.id);
    res.json(progress);
  } catch (error) {
    console.error("Error fetching sprint progress:", error);
    res.status(500).json({ message: "Failed to fetch sprint progress" });
  }
});

// Create sprint
router.post("/", async (req, res) => {
  try {
    const validatedData = insertSprintSchema.parse(req.body);
    const sprint = await storage.createSprint(validatedData);
    res.status(201).json(sprint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("Error creating sprint:", error);
      res.status(500).json({ message: "Failed to create sprint" });
    }
  }
});

// Update sprint
router.put("/:id", async (req, res) => {
  try {
    const validatedData = updateSprintSchema.parse(req.body);
    const sprint = await storage.updateSprint(req.params.id, validatedData);
    if (!sprint) {
      res.status(404).json({ message: "Sprint not found" });
      return;
    }
    res.json(sprint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("Error updating sprint:", error);
      res.status(500).json({ message: "Failed to update sprint" });
    }
  }
});

// Delete sprint
router.delete("/:id", async (req, res) => {
  try {
    const success = await storage.deleteSprint(req.params.id);
    if (!success) {
      res.status(404).json({ message: "Sprint not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting sprint:", error);
    res.status(500).json({ message: "Failed to delete sprint" });
  }
});

// Assign tasks to sprint
router.post("/:id/assign-tasks", async (req, res) => {
  try {
    const { taskIds } = req.body;
    await storage.assignTasksToSprint(req.params.id, taskIds);
    res.json({ success: true });
  } catch (error) {
    console.error("Error assigning tasks to sprint:", error);
    res.status(500).json({ message: "Failed to assign tasks to sprint" });
  }
});

// Auto-assign tasks to sprint
router.post("/:id/auto-assign", async (req, res) => {
  try {
    const criteria = req.body;
    const assignedTaskIds = await storage.autoAssignTasksToSprint(req.params.id, criteria);
    res.json({ assignedTaskIds, count: assignedTaskIds.length });
  } catch (error) {
    console.error("Error auto-assigning tasks to sprint:", error);
    res.status(500).json({ message: "Failed to auto-assign tasks to sprint" });
  }
});

export default router;
