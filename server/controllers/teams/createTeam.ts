import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function createTeamHandler(req: Request, res: Response) {
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
}
