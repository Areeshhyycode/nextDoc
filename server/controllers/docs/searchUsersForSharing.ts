import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Search users for sharing (autocomplete)
 * GET /api/users/search?q=query
 */
export async function searchUsersForSharingHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const { q } = req.query;

    console.log("[SearchUsers] Query:", q, "Current User ID:", userId);

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json([]);
    }

    const allUsers = await storage.getAllUsers();
    console.log("[SearchUsers] Total users found:", allUsers.length);
    console.log("[SearchUsers] All user emails:", allUsers.map(u => u.email));

    const filteredUsers = allUsers
      .filter(user => {
        const isNotCurrentUser = user.id !== userId;
        const matchesQuery = user.email.toLowerCase().includes(q.toLowerCase()) ||
          user.displayName.toLowerCase().includes(q.toLowerCase());
        console.log(`[SearchUsers] User ${user.email}: notCurrentUser=${isNotCurrentUser}, matchesQuery=${matchesQuery}`);
        return isNotCurrentUser && matchesQuery;
      })
      .slice(0, 10) // Limit to 10 results
      .map(user => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        profilePicture: user.profilePicture
      }));

    console.log("[SearchUsers] Filtered users:", filteredUsers.length);
    res.json(filteredUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
}
