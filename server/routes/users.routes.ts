import { Router } from "express";
import { requireAuth } from "../auth";
import {
  getAllUsersHandler,
  updateProfileHandler,
  changePasswordHandler,
} from "../controllers/users";

const router = Router();

router.get("/", requireAuth, getAllUsersHandler);
router.patch("/profile", requireAuth, updateProfileHandler);
router.post("/change-password", requireAuth, changePasswordHandler);

export default router;
