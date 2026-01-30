import type { Request, Response } from "express";
import { projectStatusUpdates, users } from "@shared/schema";
import { db } from "../../db";
import { eq, desc } from "drizzle-orm";

export async function getStatusUpdatesHandler(req: Request, res: Response) {
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
}

export async function createStatusUpdateHandler(req: Request, res: Response) {
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
}
