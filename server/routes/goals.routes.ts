import { Router } from "express";
import { storage } from "../storage";
import { insertGoalSchema, updateGoalSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all goals
router.get("/", async (_req, res) => {
  try {
    const goals = await storage.getAllGoals();
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
});

// Get single goal
router.get("/:id", async (req, res) => {
  try {
    const goal = await storage.getGoal(req.params.id);
    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }
    res.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ message: "Failed to fetch goal" });
  }
});

// Get goal progress
router.get("/:id/progress", async (req, res) => {
  try {
    const progress = await storage.getGoalProgress(req.params.id);
    res.json(progress);
  } catch (error) {
    console.error("Error fetching goal progress:", error);
    res.status(500).json({ message: "Failed to fetch goal progress" });
  }
});

// Create goal
router.post("/", async (req, res) => {
  try {
    const validatedData = insertGoalSchema.parse(req.body);
    const goal = await storage.createGoal(validatedData);
    res.status(201).json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  }
});

// Update goal
router.put("/:id", async (req, res) => {
  try {
    const validatedData = updateGoalSchema.parse(req.body);
    const goal = await storage.updateGoal(req.params.id, validatedData);
    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }
    res.json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  }
});

// Delete goal
router.delete("/:id", async (req, res) => {
  try {
    const success = await storage.deleteGoal(req.params.id);
    if (!success) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ message: "Failed to delete goal" });
  }
});

export default router;
