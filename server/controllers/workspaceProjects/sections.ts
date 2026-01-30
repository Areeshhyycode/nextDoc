import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getProjectSectionsHandler(req: Request, res: Response) {
  try {
    const sections = await storage.getProjectSections(req.params.projectId);
    res.json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ message: "Failed to fetch sections" });
  }
}

export async function createProjectSectionHandler(req: Request, res: Response) {
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
}

export async function updateProjectSectionHandler(req: Request, res: Response) {
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
}

export async function deleteProjectSectionHandler(req: Request, res: Response) {
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
}
