import type { Request, Response } from "express";
import { storage } from "../../storage";
import { insertTeamMemberSchema } from "@shared/schema";
import { z } from "zod";

export async function getAllTeamMembersHandler(_req: Request, res: Response) {
  try {
    const members = await storage.getAllTeamMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch team members" });
  }
}

export async function createTeamMemberHandler(req: Request, res: Response) {
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
}
