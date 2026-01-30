import type { Request, Response } from "express";
import { storage } from "../../storage";
import { isValidContextId } from "@shared/context-helpers";

export async function getKanbanColumnsHandler(req: Request, res: Response) {
  try {
    const { teamId } = req.params;

    if (!isValidContextId(teamId)) {
      return res.status(400).json({ message: 'Invalid context ID format. Expected "dept:<name>" or "team:<uuid>"' });
    }

    const columns = await storage.getKanbanColumns(teamId);
    res.json(columns);
  } catch (error) {
    console.error('Error fetching kanban columns:', error);
    res.status(500).json({ message: 'Failed to fetch kanban columns' });
  }
}

export async function createKanbanColumnHandler(req: Request, res: Response) {
  try {
    const { teamId } = req.params;
    const { name, color, order } = req.body;

    if (!isValidContextId(teamId)) {
      return res.status(400).json({ message: 'Invalid context ID format. Expected "dept:<name>" or "team:<uuid>"' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Column name is required' });
    }

    const column = await storage.createKanbanColumn({
      teamId,
      name,
      color: color || '#6B7280',
      order: order || 0,
      isDefault: false,
    });

    res.status(201).json(column);
  } catch (error) {
    console.error('Error creating kanban column:', error);
    res.status(500).json({ message: 'Failed to create kanban column' });
  }
}

export async function updateKanbanColumnHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const column = await storage.updateKanbanColumn(id, updates);

    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    res.json(column);
  } catch (error) {
    console.error('Error updating kanban column:', error);
    res.status(500).json({ message: 'Failed to update kanban column' });
  }
}

export async function deleteKanbanColumnHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteKanbanColumn(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Column not found' });
    }

    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Error deleting kanban column:', error);
    res.status(500).json({ message: 'Failed to delete kanban column' });
  }
}
