import { Router } from "express";
import {
  getAllGoalsHandler,
  getGoalHandler,
  getGoalProgressHandler,
  createGoalHandler,
  updateGoalHandler,
  deleteGoalHandler,
} from "../controllers/goals";

const router = Router();

router.get("/", getAllGoalsHandler);
router.get("/:id", getGoalHandler);
router.get("/:id/progress", getGoalProgressHandler);
router.post("/", createGoalHandler);
router.put("/:id", updateGoalHandler);
router.delete("/:id", deleteGoalHandler);

export default router;
