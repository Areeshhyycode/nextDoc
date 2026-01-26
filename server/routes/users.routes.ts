import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, hashPassword, validatePassword } from "../auth";

const router = Router();

// Get all users (public info only)
router.get("/", requireAuth, async (_req, res) => {
  try {
    const users = await storage.getAllUsers();
    const publicUsers = users.map(({ id, displayName, email, profilePicture }) => ({
      id,
      displayName,
      email,
      profilePicture
    }));
    res.json(publicUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Update user profile
router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const updates = req.body;
    const updatedUser = await storage.updateUser(userId, updates);

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Change password
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await storage.getUser(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const bcrypt = await import('bcrypt');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    const passwordValidation = await validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({ message: passwordValidation.message });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUser(userId, { password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

export default router;
