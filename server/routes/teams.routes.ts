import { Router } from "express";
import { requireAuth } from "../auth";
import { requireAdminAccess } from "./admin.routes";
import {
  getAllTeamsHandler,
  createTeamHandler,
  getViewPreferenceHandler,
  setViewPreferenceHandler,
  getKanbanColumnsHandler,
  createKanbanColumnHandler,
  updateKanbanColumnHandler,
  deleteKanbanColumnHandler,
  getAllTeamMembersHandler,
  createTeamMemberHandler,
} from "../controllers/teams";

const router = Router();

// Teams
router.get('/', getAllTeamsHandler);
router.post('/', requireAdminAccess, createTeamHandler);

// View Preferences
router.get('/:teamId/view-preference', requireAuth, getViewPreferenceHandler);
router.post('/:teamId/view-preference', requireAuth, setViewPreferenceHandler);

// Kanban Columns (team-scoped)
router.get('/:teamId/kanban-columns', getKanbanColumnsHandler);
router.post('/:teamId/kanban-columns', requireAdminAccess, createKanbanColumnHandler);

// Team Members
router.get('/members', getAllTeamMembersHandler);
router.post('/members', createTeamMemberHandler);

export default router;

// Kanban columns routes (separate from team-scoped)
export const kanbanRouter = Router();
kanbanRouter.put('/:id', requireAdminAccess, updateKanbanColumnHandler);
kanbanRouter.delete('/:id', requireAdminAccess, deleteKanbanColumnHandler);
