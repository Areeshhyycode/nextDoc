import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getAllProjectsHandler(req: Request, res: Response) {
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
}
