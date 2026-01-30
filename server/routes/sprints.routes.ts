import { Router } from "express";
import {
  getAllSprintsHandler,
  getSprintHandler,
  getSprintProgressHandler,
  createSprintHandler,
  updateSprintHandler,
  deleteSprintHandler,
  assignTasksHandler,
  autoAssignTasksHandler,
} from "../controllers/sprints";

const router = Router();

router.get("/", getAllSprintsHandler);
router.get("/:id", getSprintHandler);
router.get("/:id/progress", getSprintProgressHandler);
router.post("/", createSprintHandler);
router.put("/:id", updateSprintHandler);
router.delete("/:id", deleteSprintHandler);
router.post("/:id/assign-tasks", assignTasksHandler);
router.post("/:id/auto-assign", autoAssignTasksHandler);

export default router;
