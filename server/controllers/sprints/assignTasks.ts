import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function assignTasksHandler(req: Request, res: Response) {
  try {
    const { taskIds } = req.body;
    await storage.assignTasksToSprint(req.params.id, taskIds);
    res.json({ success: true });
  } catch (error) {
    console.error("Error assigning tasks to sprint:", error);
    res.status(500).json({ message: "Failed to assign tasks to sprint" });
  }
}

export async function autoAssignTasksHandler(req: Request, res: Response) {
  try {
    const criteria = req.body;
    const assignedTaskIds = await storage.autoAssignTasksToSprint(req.params.id, criteria);
    res.json({ assignedTaskIds, count: assignedTaskIds.length });
  } catch (error) {
    console.error("Error auto-assigning tasks to sprint:", error);
    res.status(500).json({ message: "Failed to auto-assign tasks to sprint" });
  }
}
