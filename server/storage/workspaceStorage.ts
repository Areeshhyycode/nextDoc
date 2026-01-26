import {
  workspaceProjects,
  projectSections,
  projects,
  type WorkspaceProject,
  type InsertWorkspaceProject,
  type UpdateWorkspaceProject,
  type ProjectSection,
  type InsertProjectSection,
  type UpdateProjectSection,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { wasDeleted } from "./helpers";

export interface IWorkspaceStorage {
  // Workspace Projects
  getAllWorkspaceProjects(): Promise<WorkspaceProject[]>;
  getWorkspaceProject(id: string): Promise<WorkspaceProject | undefined>;
  getWorkspaceProjectsByOwner(ownerId: string): Promise<WorkspaceProject[]>;
  getWorkspaceProjectsForUser(userId: string): Promise<WorkspaceProject[]>;
  createWorkspaceProject(project: InsertWorkspaceProject): Promise<WorkspaceProject>;
  updateWorkspaceProject(id: string, updates: UpdateWorkspaceProject): Promise<WorkspaceProject | undefined>;
  deleteWorkspaceProject(id: string): Promise<boolean>;

  // Project Sections
  getProjectSections(projectId: string): Promise<ProjectSection[]>;
  createProjectSection(section: InsertProjectSection): Promise<ProjectSection>;
  updateProjectSection(id: string, updates: UpdateProjectSection): Promise<ProjectSection | undefined>;
  deleteProjectSection(id: string): Promise<boolean>;
}

export class WorkspaceStorage implements IWorkspaceStorage {
  // Workspace Projects Implementation
  async getAllWorkspaceProjects(): Promise<WorkspaceProject[]> {
    const allProjects = await db
      .select()
      .from(workspaceProjects)
      .orderBy(desc(workspaceProjects.updatedAt));
    return allProjects;
  }

  async getWorkspaceProject(id: string): Promise<WorkspaceProject | undefined> {
    const [project] = await db
      .select()
      .from(workspaceProjects)
      .where(eq(workspaceProjects.id, id));
    return project || undefined;
  }

  async getWorkspaceProjectsByOwner(ownerId: string): Promise<WorkspaceProject[]> {
    const projects = await db
      .select()
      .from(workspaceProjects)
      .where(eq(workspaceProjects.ownerId, ownerId))
      .orderBy(desc(workspaceProjects.updatedAt));
    return projects;
  }

  async getWorkspaceProjectsForUser(userId: string): Promise<WorkspaceProject[]> {
    // Get all projects and filter based on access rights
    const allProjects = await db
      .select()
      .from(workspaceProjects)
      .orderBy(desc(workspaceProjects.updatedAt));

    // Filter based on privacy settings
    const accessibleProjects = allProjects.filter(project => {
      // Owner has access
      if (project.ownerId === userId) return true;

      // Everyone has access if privacy is 'everyone'
      if (project.privacy === 'everyone') return true;

      // Check if user is in memberIds for 'specific_people' privacy
      if (project.privacy === 'specific_people' && project.memberIds) {
        return project.memberIds.includes(userId);
      }

      // Private projects only accessible to owner
      return false;
    });

    return accessibleProjects;
  }

  async createWorkspaceProject(project: InsertWorkspaceProject): Promise<WorkspaceProject> {
    const [newProject] = await db
      .insert(workspaceProjects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateWorkspaceProject(id: string, updates: UpdateWorkspaceProject): Promise<WorkspaceProject | undefined> {
    const [updated] = await db
      .update(workspaceProjects)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(workspaceProjects.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteWorkspaceProject(id: string): Promise<boolean> {
    const result = await db.delete(workspaceProjects).where(eq(workspaceProjects.id, id));
    return wasDeleted(result);
  }

  // Project Sections Implementation
  async getProjectSections(projectId: string): Promise<ProjectSection[]> {
    const sections = await db
      .select()
      .from(projectSections)
      .where(eq(projectSections.projectId, projectId))
      .orderBy(projectSections.order);
    return sections;
  }

  async createProjectSection(section: InsertProjectSection): Promise<ProjectSection> {
    const [newSection] = await db
      .insert(projectSections)
      .values(section)
      .returning();
    return newSection;
  }

  async updateProjectSection(id: string, updates: UpdateProjectSection): Promise<ProjectSection | undefined> {
    const [updated] = await db
      .update(projectSections)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(projectSections.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProjectSection(id: string): Promise<boolean> {
    await db.update(projects).set({ sectionId: null }).where(eq(projects.sectionId, id));
    const result = await db.delete(projectSections).where(eq(projectSections.id, id));
    return wasDeleted(result);
  }
}

export const workspaceStorage = new WorkspaceStorage();
