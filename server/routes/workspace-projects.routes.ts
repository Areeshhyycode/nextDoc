import { Router } from "express";
import { requireAuth } from "../auth";
import {
  getAllWorkspaceProjectsHandler,
  getWorkspaceProjectHandler,
  createWorkspaceProjectHandler,
  updateWorkspaceProjectPutHandler,
  updateWorkspaceProjectPatchHandler,
  deleteWorkspaceProjectHandler,
  getProjectSectionsHandler,
  createProjectSectionHandler,
  updateProjectSectionHandler,
  deleteProjectSectionHandler,
} from "../controllers/workspaceProjects";

const router = Router();

router.get("/", requireAuth, getAllWorkspaceProjectsHandler);
router.get("/:id", requireAuth, getWorkspaceProjectHandler);
router.post("/", requireAuth, createWorkspaceProjectHandler);
router.put("/:id", requireAuth, updateWorkspaceProjectPutHandler);
router.patch("/:id", requireAuth, updateWorkspaceProjectPatchHandler);
router.delete("/:id", requireAuth, deleteWorkspaceProjectHandler);

export default router;

// Project sections routes
export const projectSectionsRouter = Router();
projectSectionsRouter.get("/:projectId", requireAuth, getProjectSectionsHandler);
projectSectionsRouter.post("/", requireAuth, createProjectSectionHandler);
projectSectionsRouter.patch("/:id", requireAuth, updateProjectSectionHandler);
projectSectionsRouter.delete("/:id", requireAuth, deleteProjectSectionHandler);
