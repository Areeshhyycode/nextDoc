import { Router } from "express";
import { requireAuth } from "../auth";
import {
  getAllProjectsHandler,
  getProjectHandler,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  getDependenciesHandler,
  validateDependenciesHandler,
  scheduleProjectHandler,
  getProjectTasksHandler,
  createProjectTaskHandler,
  updateProjectTaskHandler,
  getProjectBudgetsHandler,
  createProjectBudgetHandler,
  deleteProjectBudgetHandler,
  getProjectCostsHandler,
  createProjectCostHandler,
  deleteProjectCostHandler,
  getStatusUpdatesHandler,
  createStatusUpdateHandler,
  getBudgetsDirectHandler,
  createBudgetDirectHandler,
  getCostsDirectHandler,
  createCostDirectHandler,
  updateCostDirectHandler,
  deleteCostDirectHandler,
  getProjectActivitiesHandler,
  createProjectActivityHandler,
  getProjectAttachmentsHandler,
  deleteProjectAttachmentHandler,
} from "../controllers/projects";

const router = Router();

// Core CRUD
router.get("/", getAllProjectsHandler);
router.get("/:id", getProjectHandler);
router.post("/", createProjectHandler);
router.patch("/:id", updateProjectHandler);
router.delete("/:id", deleteProjectHandler);

// Dependencies
router.get("/:id/dependencies", getDependenciesHandler);
router.post("/:id/validate-dependencies", validateDependenciesHandler);

// Schedule
router.put("/:id/schedule", scheduleProjectHandler);

// Tasks
router.get("/:projectId/tasks", requireAuth, getProjectTasksHandler);
router.post("/:projectId/tasks", requireAuth, createProjectTaskHandler);
router.patch("/:projectId/tasks/:taskId", requireAuth, updateProjectTaskHandler);

// Budgets (nested)
router.get("/:projectId/budgets", requireAuth, getProjectBudgetsHandler);
router.post("/:projectId/budgets", requireAuth, createProjectBudgetHandler);
router.delete("/:projectId/budgets/:id", requireAuth, deleteProjectBudgetHandler);

// Costs (nested)
router.get("/:projectId/costs", requireAuth, getProjectCostsHandler);
router.post("/:projectId/costs", requireAuth, createProjectCostHandler);
router.delete("/:projectId/costs/:id", requireAuth, deleteProjectCostHandler);

export default router;

// Project status updates routes (direct path)
export const projectStatusRouter = Router();
projectStatusRouter.get("/:projectId", requireAuth, getStatusUpdatesHandler);
projectStatusRouter.post("/", requireAuth, createStatusUpdateHandler);

// Project budgets routes (direct path)
export const projectBudgetsRouter = Router();
projectBudgetsRouter.get("/:projectId", requireAuth, getBudgetsDirectHandler);
projectBudgetsRouter.post("/", requireAuth, createBudgetDirectHandler);

// Project costs routes (direct path)
export const projectCostsRouter = Router();
projectCostsRouter.get("/:projectId", requireAuth, getCostsDirectHandler);
projectCostsRouter.post("/", requireAuth, createCostDirectHandler);
projectCostsRouter.patch("/:id", requireAuth, updateCostDirectHandler);
projectCostsRouter.delete("/:id", requireAuth, deleteCostDirectHandler);

// Project activities routes
export const projectActivitiesRouter = Router();
projectActivitiesRouter.get("/:projectId", requireAuth, getProjectActivitiesHandler);
projectActivitiesRouter.post("/", requireAuth, createProjectActivityHandler);

// Project attachments routes
export const projectAttachmentsRouter = Router();
projectAttachmentsRouter.get("/:projectId", requireAuth, getProjectAttachmentsHandler);
projectAttachmentsRouter.delete("/:id", requireAuth, deleteProjectAttachmentHandler);
