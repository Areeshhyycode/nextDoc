import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import { requireAdminAccess } from "./admin.routes";
import { insertTeamMemberSchema } from "@shared/schema";
import { isValidContextId } from "@shared/context-helpers";
import { z } from "zod";

const router = Router();

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await storage.getAllTeams();
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
});

// Create team
router.post('/', requireAdminAccess, async (req, res) => {
  try {
    const { name, icon, color, description } = req.body;

    if (!name || !icon || !color) {
      return res.status(400).json({ message: 'Name, icon, and color are required' });
    }

    const newTeam = await storage.createTeam({
      name,
      icon,
      color,
      description: description || null,
    });

    const defaultColumns = [
      { teamId: newTeam.id, name: 'New task', color: '#8B5CF6', icon: '📋', order: 0, isDefault: true },
      { teamId: newTeam.id, name: 'Scheduled', color: '#3B82F6', icon: '📅', order: 1, isDefault: true },
      { teamId: newTeam.id, name: 'In Progress', color: '#F59E0B', icon: '🔨', order: 2, isDefault: true },
      { teamId: newTeam.id, name: 'Completed', color: '#10B981', icon: '✅', order: 3, isDefault: true },
    ];

    for (const column of defaultColumns) {
      await storage.createKanbanColumn(column);
    }

    const currentUser = req.user as any;
    if (currentUser) {
      await storage.logActivity({
        userId: currentUser.id,
        action: 'team_created',
        details: JSON.stringify({ teamId: newTeam.id, teamName: newTeam.name }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.status(201).json(newTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Failed to create team' });
  }
});

// Get view preference
router.get('/:teamId/view-preference', requireAuth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = (req.user as any).id;

    if (!isValidContextId(teamId)) {
      return res.status(400).json({ message: 'Invalid context ID format. Expected "dept:<name>" or "team:<uuid>"' });
    }

    const preference = await storage.getViewPreference(userId, teamId);

    if (!preference) {
      return res.json({ viewType: 'table' });
    }

    res.json({ viewType: preference.viewType });
  } catch (error) {
    console.error('Error fetching view preference:', error);
    res.status(500).json({ message: 'Failed to fetch view preference' });
  }
});

// Set view preference
router.post('/:teamId/view-preference', requireAuth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { viewType } = req.body;
    const userId = (req.user as any).id;

    if (!isValidContextId(teamId)) {
      return res.status(400).json({ message: 'Invalid context ID format. Expected "dept:<name>" or "team:<uuid>"' });
    }

    if (!viewType || !['table', 'kanban'].includes(viewType)) {
      return res.status(400).json({ message: 'Invalid view type. Must be "table" or "kanban"' });
    }

    const preference = await storage.setViewPreference(userId, teamId, viewType);
    res.json(preference);
  } catch (error) {
    console.error('Error setting view preference:', error);
    res.status(500).json({ message: 'Failed to set view preference' });
  }
});

// Get kanban columns
router.get('/:teamId/kanban-columns', async (req, res) => {
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
});

// Create kanban column
router.post('/:teamId/kanban-columns', requireAdminAccess, async (req, res) => {
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
});

// Team Members
router.get('/members', async (_req, res) => {
  try {
    const members = await storage.getAllTeamMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch team members" });
  }
});

router.post('/members', async (req, res) => {
  try {
    const validatedData = insertTeamMemberSchema.parse(req.body);
    const member = await storage.createTeamMember(validatedData);
    res.status(201).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create team member" });
    }
  }
});

export default router;

// Kanban columns routes (separate from team-scoped)
export const kanbanRouter = Router();

kanbanRouter.put('/:id', requireAdminAccess, async (req, res) => {
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
});

kanbanRouter.delete('/:id', requireAdminAccess, async (req, res) => {
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
});
