import type { Request, Response } from "express";
import { projectActivities } from "@shared/schema";
import { db } from "../../db";
import { eq, desc } from "drizzle-orm";

export async function getProjectActivitiesHandler(req: Request, res: Response) {
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
}

export async function createProjectActivityHandler(req: Request, res: Response) {
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
}
