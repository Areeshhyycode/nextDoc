import {
  projects,
  teamMembers,
  type Project,
  type InsertProject,
  type UpdateProject,
  type TeamMember,
  type InsertTeamMember,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, sql, ilike } from "drizzle-orm";

export interface IProjectStorage {
  // Team Members
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;

  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: UpdateProject): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  getProjectsByDepartment(department: string): Promise<Project[]>;
  getProjectsByStatus(status: string): Promise<Project[]>;
  getProjectsByOwner(owner: string): Promise<Project[]>;
  searchProjects(query: string): Promise<Project[]>;
  getProjectMetrics(): Promise<{
    totalTasks: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    blocked: number;
    reviewing: number;
    overdue: number;
    temporaryHold: number;
    completionPercentage: number;
  }>;

  // Dependency Management
  resolveDependencies(completedTaskId: string): Promise<void>;
  areAllDependenciesCompleted(dependencyIds: string[]): Promise<boolean>;
  validateAndBlockIfNeeded(projectId: string, dependencies: string[]): Promise<void>;
  getDependencyInfo(projectId: string): Promise<{
    dependencies: Project[];
    dependents: Project[];
    blockedBy: Project[];
  }>;
}

export class ProjectStorage implements IProjectStorage {
  // Reference to goal storage for updating goal progress (will be injected)
  private updateGoalProgress?: (goalId: string) => Promise<void>;

  setGoalProgressUpdater(updater: (goalId: string) => Promise<void>) {
    this.updateGoalProgress = updater;
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers);
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member || undefined;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db
      .insert(teamMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async getAllProjects(): Promise<Project[]> {
    const result = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.lastUpdated));

    return result;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [result] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    return result || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();

    return newProject;
  }

  async updateProject(id: string, updates: UpdateProject): Promise<Project | undefined> {
    const oldProject = await this.getProject(id);

    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, lastUpdated: sql`CURRENT_TIMESTAMP` })
      .where(eq(projects.id, id))
      .returning();

    if (updatedProject) {
      // Check if this update affects dependency resolution
      if (updates.status === 'Completed' && oldProject?.status !== 'Completed') {
        // This task was just completed, check for dependent tasks
        await this.resolveDependencies(id);
      }

      // Handle goal progress update if the task is linked to a goal
      if (updatedProject.linkedGoalId && this.updateGoalProgress) {
        await this.updateGoalProgress(updatedProject.linkedGoalId);
      }

      // If dependencies were updated, validate blocking status
      if (updates.dependencies) {
        await this.validateAndBlockIfNeeded(id, updates.dependencies);
      }
    }

    return updatedProject || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getProjectsByDepartment(department: string): Promise<Project[]> {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.department, department as any))
      .orderBy(desc(projects.lastUpdated));

    return result;
  }

  async getProjectsByStatus(status: string): Promise<Project[]> {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.status, status as any))
      .orderBy(desc(projects.lastUpdated));

    return result;
  }

  async getProjectsByOwner(owner: string): Promise<Project[]> {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.owner, owner))
      .orderBy(desc(projects.lastUpdated));

    return result;
  }

  async searchProjects(query: string): Promise<Project[]> {
    const result = await db
      .select()
      .from(projects)
      .where(ilike(projects.task, `%${query}%`))
      .orderBy(desc(projects.lastUpdated));

    return result;
  }

  async getProjectMetrics() {
    const allProjects = await db.select().from(projects);

    const metrics = {
      totalTasks: allProjects.length,
      completed: allProjects.filter(p => p.status === 'Completed').length,
      inProgress: allProjects.filter(p => p.status === 'In Progress').length,
      notStarted: allProjects.filter(p => p.status === 'Not Started').length,
      blocked: allProjects.filter(p => p.status === 'Blocked').length,
      reviewing: allProjects.filter(p => p.status === 'Reviewing' || p.status === 'Design Approval Needed').length,
      overdue: 0, // Will implement date checking later
      temporaryHold: allProjects.filter(p => p.status === 'Temporary Hold').length,
      completionPercentage: allProjects.length > 0
        ? Math.round((allProjects.filter(p => p.status === 'Completed').length / allProjects.length) * 100)
        : 0,
    };

    return metrics;
  }

  // Dependency Management Methods
  async resolveDependencies(completedTaskId: string): Promise<void> {
    // Find all projects that depend on this completed task
    const dependentProjects = await db
      .select()
      .from(projects)
      .where(sql`${completedTaskId} = ANY(${projects.dependencies})`);

    for (const project of dependentProjects) {
      // Check if all dependencies are now completed
      const allDependenciesCompleted = await this.areAllDependenciesCompleted(project.dependencies || []);

      if (allDependenciesCompleted && project.status === 'Blocked') {
        // Unblock the project
        await db
          .update(projects)
          .set({ status: 'Not Started', lastUpdated: sql`CURRENT_TIMESTAMP` })
          .where(eq(projects.id, project.id));
      }
    }
  }

  async areAllDependenciesCompleted(dependencyIds: string[]): Promise<boolean> {
    if (!dependencyIds || dependencyIds.length === 0) return true;

    const dependencies = await db
      .select()
      .from(projects)
      .where(sql`${projects.id} = ANY(${dependencyIds})`);

    return dependencies.every(dep => dep.status === 'Completed');
  }

  async validateAndBlockIfNeeded(projectId: string, dependencies: string[] = []): Promise<void> {
    if (!dependencies || dependencies.length === 0) return;

    const allDependenciesCompleted = await this.areAllDependenciesCompleted(dependencies);

    if (!allDependenciesCompleted) {
      await db
        .update(projects)
        .set({ status: 'Blocked', lastUpdated: sql`CURRENT_TIMESTAMP` })
        .where(eq(projects.id, projectId));
    }
  }

  async getDependencyInfo(projectId: string): Promise<{
    dependencies: Project[];
    dependents: Project[];
    blockedBy: Project[];
  }> {
    const project = await this.getProject(projectId);
    if (!project) {
      return { dependencies: [], dependents: [], blockedBy: [] };
    }

    // Get tasks this project depends on
    const dependencies = project.dependencies && project.dependencies.length > 0
      ? await db
          .select()
          .from(projects)
          .where(sql`${projects.id} = ANY(${project.dependencies})`)
      : [];

    // Get tasks that depend on this project
    const dependents = await db
      .select()
      .from(projects)
      .where(sql`${projectId} = ANY(${projects.dependencies})`);

    // Get incomplete dependencies (blocking this task)
    const blockedBy = dependencies.filter(dep => dep.status !== 'Completed');

    return { dependencies, dependents, blockedBy };
  }
}

export const projectStorage = new ProjectStorage();
