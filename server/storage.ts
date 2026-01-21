import { 
  projects, 
  teamMembers, 
  users,
  userSessions,
  activityLogs,
  goals,
  sprints,
  invitations,
  teams,
  viewPreferences,
  kanbanColumns,
  documents,
  documentComments,
  workspaceProjects,
  projectSections,
  type User, 
  type InsertUser, 
  type TeamMember, 
  type InsertTeamMember, 
  type Project, 
  type InsertProject, 
  type UpdateProject,
  type Goal,
  type InsertGoal,
  type UpdateGoal,
  type Sprint,
  type InsertSprint,
  type UpdateSprint,
  type UpdateUser,
  type UserSession,
  type InsertUserSession,
  type ActivityLog,
  type InsertActivityLog,
  type UpdateUserRole,
  type Invitation,
  type InsertInvitation,
  type Team,
  type InsertTeam,
  type UpdateTeam,
  type ViewPreference,
  type InsertViewPreference,
  type KanbanColumn,
  type InsertKanbanColumn,
  type UpdateKanbanColumn,
  type Document,
  type InsertDocument,
  type UpdateDocument,
  type DocumentComment,
  type InsertDocumentComment,
  type UpdateDocumentComment,
  type WorkspaceProject,
  type InsertWorkspaceProject,
  type UpdateWorkspaceProject,
  type ProjectSection,
  type InsertProjectSection,
  type UpdateProjectSection,
  type DocumentWithOwner
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ilike, desc, sql } from "drizzle-orm";

// Helper function to escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUser): Promise<User | undefined>;
  updateUserLastLogin(id: string): Promise<User>;
  updateUserResetToken(id: string, token: string, expiry: Date): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearResetToken(id: string): Promise<User | undefined>;
  
  // Admin functionality
  updateUserRole(id: string, role: 'user' | 'admin' | 'sub-admin'): Promise<User | undefined>;
  updateUserOnlineStatus(id: string, isOnline: boolean): Promise<User | undefined>;
  updateUserActivity(id: string): Promise<User | undefined>;
  getOnlineUsers(): Promise<User[]>;
  getUsersByRole(role: 'user' | 'admin' | 'sub-admin'): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  // User Sessions
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateSessionActivity(sessionId: string): Promise<UserSession | undefined>;
  deactivateUserSessions(userId: string): Promise<void>;
  getActiveUserSessions(): Promise<UserSession[]>;
  
  // Activity Logs
  logActivity(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(options?: { userId?: string; action?: string; limit?: number; offset?: number }): Promise<ActivityLog[]>;
  getUserLoginStats(): Promise<{ userId: string; displayName: string; email: string; lastLogin: Date; loginCount: number; }[]>;
  
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

  // Goals
  getAllGoals(): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: UpdateGoal): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  getGoalProgress(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  }>;
  updateGoalProgress(goalId: string): Promise<void>;

  // Sprints
  getAllSprints(): Promise<Sprint[]>;
  getSprint(id: string): Promise<Sprint | undefined>;
  createSprint(sprint: InsertSprint): Promise<Sprint>;
  updateSprint(id: string, updates: UpdateSprint): Promise<Sprint | undefined>;
  deleteSprint(id: string): Promise<boolean>;
  getSprintProgress(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    totalEffort: number;
    completedEffort: number;
    progressPercentage: number;
  }>;
  assignTasksToSprint(sprintId: string, taskIds: string[]): Promise<void>;
  autoAssignTasksToSprint(sprintId: string, criteria: {
    departments?: string[];
    maxEffort?: number;
    prioritizeBy?: 'risk' | 'dueDate' | 'effort';
  }): Promise<string[]>; // Returns assigned task IDs
  updateSprintProgress(sprintId: string): Promise<void>;

  // Invitations
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getInvitations(): Promise<Invitation[]>;
  getInvitationByEmail(email: string): Promise<Invitation | undefined>;
  
  // Teams
  getAllTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: UpdateTeam): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;
  
  // View Preferences
  getViewPreference(userId: string, teamId: string): Promise<ViewPreference | undefined>;
  setViewPreference(userId: string, teamId: string, viewType: 'table' | 'kanban'): Promise<ViewPreference>;
  
  // Kanban Columns
  getKanbanColumns(teamId: string): Promise<KanbanColumn[]>;
  createKanbanColumn(column: InsertKanbanColumn): Promise<KanbanColumn>;
  updateKanbanColumn(id: string, updates: UpdateKanbanColumn): Promise<KanbanColumn | undefined>;
  deleteKanbanColumn(id: string): Promise<boolean>;
  updateProjectColumn(projectId: string, columnName: string): Promise<void>;
  
  // Documents
  getAllDocuments(): Promise<DocumentWithOwner[]>;
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByOwner(ownerId: string): Promise<DocumentWithOwner[]>;
  getDocumentsByCategory(category: 'blank' | 'meeting_notes' | 'project_overview'): Promise<DocumentWithOwner[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: UpdateDocument, updateTimestamp?: boolean): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  updateDocumentLastViewed(id: string): Promise<Document | undefined>;

  // Document Name Uniqueness
  isDocumentNameUnique(title: string, excludeDocId?: string): Promise<boolean>;
  generateUniqueDocumentName(baseTitle: string): Promise<string>;
  getDocumentByTitle(title: string): Promise<Document | undefined>;
  
  // Document Comments
  getDocumentComments(documentId: string): Promise<DocumentComment[]>;
  createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment>;
  updateDocumentComment(id: string, updates: UpdateDocumentComment): Promise<DocumentComment | undefined>;
  deleteDocumentComment(id: string): Promise<boolean>;
  
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
  
  // Project Status Updates
  getProjectStatusUpdates(projectId: string): Promise<any[]>;
  createProjectStatusUpdate(update: any): Promise<any>;
  
  // Project Budgets
  getProjectBudgets(projectId: string): Promise<any[]>;
  createProjectBudget(budget: any): Promise<any>;
  
  // Project Costs
  getProjectCosts(projectId: string): Promise<any[]>;
  createProjectCost(cost: any): Promise<any>;
  
  // Project Attachments
  getProjectAttachments(projectId: string): Promise<any[]>;
  createProjectAttachment(attachment: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async updateUserLastLogin(id: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        lastLogin: sql`CURRENT_TIMESTAMP`,
        isOnline: true,
        lastActivity: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserResetToken(id: string, token: string, expiry: Date): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        resetToken: token, 
        resetTokenExpiry: expiry
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.resetToken, token),
        sql`${users.resetTokenExpiry} > NOW()`
      ));
    return user || undefined;
  }

  async clearResetToken(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        resetToken: null, 
        resetTokenExpiry: null
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Admin functionality
  async updateUserRole(id: string, role: 'user' | 'admin' | 'sub-admin'): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserOnlineStatus(id: string, isOnline: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        isOnline,
        lastActivity: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserActivity(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ lastActivity: sql`CURRENT_TIMESTAMP` })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getOnlineUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isOnline, true))
      .orderBy(desc(users.lastActivity));
  }

  async getUsersByRole(role: 'user' | 'admin' | 'sub-admin'): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .orderBy(desc(users.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  // User Sessions
  async createUserSession(insertSession: InsertUserSession): Promise<UserSession> {
    const [session] = await db
      .insert(userSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateSessionActivity(sessionId: string): Promise<UserSession | undefined> {
    const [session] = await db
      .update(userSessions)
      .set({ lastActivity: sql`CURRENT_TIMESTAMP` })
      .where(eq(userSessions.sessionId, sessionId))
      .returning();
    return session || undefined;
  }

  async deactivateUserSessions(userId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));
  }

  async getActiveUserSessions(): Promise<UserSession[]> {
    return await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.isActive, true))
      .orderBy(desc(userSessions.lastActivity));
  }

  // Activity Logs
  async logActivity(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getActivityLogs(options: { userId?: string; action?: string; limit?: number; offset?: number } = {}): Promise<ActivityLog[]> {
    const whereConditions = [];
    
    if (options.userId) {
      whereConditions.push(eq(activityLogs.userId, options.userId));
    }
    
    if (options.action) {
      whereConditions.push(eq(activityLogs.action, options.action));
    }
    
    const baseQuery = db.select().from(activityLogs);
    
    const queryWithWhere = whereConditions.length > 0 
      ? baseQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
      : baseQuery;
    
    const queryWithOrder = queryWithWhere.orderBy(desc(activityLogs.timestamp));
    
    const queryWithLimit = options.limit 
      ? queryWithOrder.limit(options.limit)
      : queryWithOrder;
    
    const finalQuery = options.offset 
      ? queryWithLimit.offset(options.offset)
      : queryWithLimit;
    
    return await finalQuery;
  }

  async getUserLoginStats(): Promise<{ userId: string; displayName: string; email: string; lastLogin: Date; loginCount: number; }[]> {
    const result = await db
      .select({
        userId: users.id,
        displayName: users.displayName,
        email: users.email,
        lastLogin: users.lastLogin,
        loginCount: sql<number>`COUNT(${activityLogs.id})`.as('loginCount')
      })
      .from(users)
      .leftJoin(activityLogs, and(
        eq(users.id, activityLogs.userId),
        eq(activityLogs.action, 'login')
      ))
      .groupBy(users.id, users.displayName, users.email, users.lastLogin)
      .orderBy(desc(users.lastLogin));
    
    return result.map(row => ({
      ...row,
      lastLogin: row.lastLogin || new Date(),
      loginCount: row.loginCount || 0
    }));
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
      if (updatedProject.linkedGoalId) {
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

  // Goal Management Methods
  async getAllGoals(): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .orderBy(desc(goals.createdAt));
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal || undefined;
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values(insertGoal)
      .returning();
    return goal;
  }

  async updateGoal(id: string, updates: UpdateGoal): Promise<Goal | undefined> {
    const [goal] = await db
      .update(goals)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getGoalProgress(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  }> {
    const goal = await this.getGoal(id);
    if (!goal || !goal.taskIds || goal.taskIds.length === 0) {
      return { totalTasks: 0, completedTasks: 0, progressPercentage: 0 };
    }

    const linkedTasks = await db
      .select()
      .from(projects)
      .where(sql`${projects.id} = ANY(${goal.taskIds})`);

    const totalTasks = linkedTasks.length;
    const completedTasks = linkedTasks.filter(task => task.status === 'Completed').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalTasks, completedTasks, progressPercentage };
  }

  async updateGoalProgress(goalId: string): Promise<void> {
    // This method is called when a task status changes
    // The progress calculation is done dynamically in getGoalProgress
    // We just update the goal's updatedAt timestamp to indicate recent activity
    await db
      .update(goals)
      .set({ updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(goals.id, goalId));
  }

  // Sprint Management Methods
  async getAllSprints(): Promise<Sprint[]> {
    return await db
      .select()
      .from(sprints)
      .orderBy(desc(sprints.createdAt));
  }

  async getSprint(id: string): Promise<Sprint | undefined> {
    const [sprint] = await db.select().from(sprints).where(eq(sprints.id, id));
    return sprint || undefined;
  }

  async createSprint(insertSprint: InsertSprint): Promise<Sprint> {
    const [sprint] = await db
      .insert(sprints)
      .values(insertSprint)
      .returning();
    return sprint;
  }

  async updateSprint(id: string, updates: UpdateSprint): Promise<Sprint | undefined> {
    const [sprint] = await db
      .update(sprints)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(sprints.id, id))
      .returning();
    return sprint || undefined;
  }

  async deleteSprint(id: string): Promise<boolean> {
    // Remove sprint assignments from tasks first
    await db
      .update(projects)
      .set({ sprintId: null })
      .where(eq(projects.sprintId, id));

    const result = await db.delete(sprints).where(eq(sprints.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSprintProgress(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    totalEffort: number;
    completedEffort: number;
    progressPercentage: number;
  }> {
    const sprint = await this.getSprint(id);
    if (!sprint || !sprint.taskIds || sprint.taskIds.length === 0) {
      return { 
        totalTasks: 0, 
        completedTasks: 0, 
        totalEffort: 0, 
        completedEffort: 0, 
        progressPercentage: 0 
      };
    }

    const sprintTasks = await db
      .select()
      .from(projects)
      .where(sql`${projects.id} = ANY(${sprint.taskIds})`);

    const totalTasks = sprintTasks.length;
    const completedTasks = sprintTasks.filter(task => task.status === 'Completed').length;
    const totalEffort = sprintTasks.reduce((sum, task) => sum + (task.effortEstimate || 1), 0);
    const completedEffort = sprintTasks
      .filter(task => task.status === 'Completed')
      .reduce((sum, task) => sum + (task.effortEstimate || 1), 0);

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalTasks, completedTasks, totalEffort, completedEffort, progressPercentage };
  }

  async assignTasksToSprint(sprintId: string, taskIds: string[]): Promise<void> {
    // Update tasks to assign them to the sprint
    await db
      .update(projects)
      .set({ sprintId })
      .where(sql`${projects.id} = ANY(${taskIds})`);

    // Update sprint to include these task IDs
    const sprint = await this.getSprint(sprintId);
    if (sprint) {
      const existingTaskIds = sprint.taskIds || [];
      const allTaskIds = [...existingTaskIds, ...taskIds];
      const updatedTaskIds = Array.from(new Set(allTaskIds));
      await this.updateSprint(sprintId, { taskIds: updatedTaskIds });
    }
  }

  async autoAssignTasksToSprint(sprintId: string, criteria: {
    departments?: string[];
    maxEffort?: number;
    prioritizeBy?: 'risk' | 'dueDate' | 'effort';
  }): Promise<string[]> {
    const sprint = await this.getSprint(sprintId);
    if (!sprint) return [];

    // Build query conditions
    let whereConditions = sql`${projects.sprintId} IS NULL AND ${projects.status} != 'Completed'`;
    
    if (criteria.departments && criteria.departments.length > 0) {
      whereConditions = sql`${whereConditions} AND ${projects.department} = ANY(${criteria.departments})`;
    }

    // Get available tasks
    let availableTasks = await db
      .select()
      .from(projects)
      .where(whereConditions);

    // Sort by priority criteria
    switch (criteria.prioritizeBy) {
      case 'risk':
        availableTasks = availableTasks.sort((a, b) => {
          const riskOrder = { 'High': 3, 'Medium': 2, 'Low': 1, '': 0 };
          return (riskOrder[b.risk as keyof typeof riskOrder] || 0) - (riskOrder[a.risk as keyof typeof riskOrder] || 0);
        });
        break;
      case 'dueDate':
        availableTasks = availableTasks.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'effort':
        availableTasks = availableTasks.sort((a, b) => (a.effortEstimate || 1) - (b.effortEstimate || 1));
        break;
    }

    // Select tasks within effort limit
    const selectedTasks: string[] = [];
    let totalEffort = 0;
    const maxEffortLimit = criteria.maxEffort || 50; // Default sprint capacity

    for (const task of availableTasks) {
      const taskEffort = task.effortEstimate || 1;
      if (totalEffort + taskEffort <= maxEffortLimit) {
        selectedTasks.push(task.id);
        totalEffort += taskEffort;
      }
    }

    // Assign selected tasks to sprint
    if (selectedTasks.length > 0) {
      await this.assignTasksToSprint(sprintId, selectedTasks);
    }

    return selectedTasks;
  }

  async updateSprintProgress(sprintId: string): Promise<void> {
    const progress = await this.getSprintProgress(sprintId);
    
    // Update sprint with calculated progress
    await db
      .update(sprints)
      .set({ 
        totalEffort: progress.totalEffort,
        completedEffort: progress.completedEffort,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(sprints.id, sprintId));
  }

  // Invitation methods
  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const [newInvitation] = await db.insert(invitations).values(invitation).returning();
    return newInvitation;
  }

  async getInvitations(): Promise<Invitation[]> {
    return await db.select().from(invitations).orderBy(desc(invitations.createdAt));
  }

  async getInvitationByEmail(email: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.email, email));
    return invitation || undefined;
  }

  // Teams methods
  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(teams.createdAt);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async updateTeam(id: string, updates: UpdateTeam): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(teams)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam || undefined;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const result = await db.delete(teams).where(eq(teams.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // View Preferences Implementation
  async getViewPreference(userId: string, teamId: string): Promise<ViewPreference | undefined> {
    const [preference] = await db
      .select()
      .from(viewPreferences)
      .where(and(
        eq(viewPreferences.userId, userId),
        eq(viewPreferences.teamId, teamId)
      ));
    return preference || undefined;
  }

  async setViewPreference(userId: string, teamId: string, viewType: 'table' | 'kanban'): Promise<ViewPreference> {
    // Check if preference exists
    const existing = await this.getViewPreference(userId, teamId);
    
    if (existing) {
      // Update existing preference
      const [updated] = await db
        .update(viewPreferences)
        .set({ viewType, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(
          eq(viewPreferences.userId, userId),
          eq(viewPreferences.teamId, teamId)
        ))
        .returning();
      return updated;
    } else {
      // Create new preference
      const [created] = await db
        .insert(viewPreferences)
        .values({ userId, teamId, viewType })
        .returning();
      return created;
    }
  }

  // Kanban Columns Implementation
  async getKanbanColumns(teamId: string): Promise<KanbanColumn[]> {
    // Fetch existing columns
    const columns = await db
      .select()
      .from(kanbanColumns)
      .where(eq(kanbanColumns.teamId, teamId))
      .orderBy(kanbanColumns.order);
    
    // Lazy create default columns if none exist
    if (columns.length === 0) {
      const defaultColumns = [
        { teamId, name: 'New task', color: '#8B5CF6', icon: '📋', order: 0, isDefault: true },
        { teamId, name: 'Scheduled', color: '#3B82F6', icon: '📅', order: 1, isDefault: true },
        { teamId, name: 'In Progress', color: '#F59E0B', icon: '🔨', order: 2, isDefault: true },
        { teamId, name: 'Completed', color: '#10B981', icon: '✅', order: 3, isDefault: true },
      ];
      
      for (const column of defaultColumns) {
        await db.insert(kanbanColumns).values(column);
      }
      
      // Fetch and return the newly created columns
      const newColumns = await db
        .select()
        .from(kanbanColumns)
        .where(eq(kanbanColumns.teamId, teamId))
        .orderBy(kanbanColumns.order);
      
      return newColumns;
    }
    
    return columns;
  }

  async createKanbanColumn(column: InsertKanbanColumn): Promise<KanbanColumn> {
    const [newColumn] = await db
      .insert(kanbanColumns)
      .values(column)
      .returning();
    return newColumn;
  }

  async updateKanbanColumn(id: string, updates: UpdateKanbanColumn): Promise<KanbanColumn | undefined> {
    const [updated] = await db
      .update(kanbanColumns)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(kanbanColumns.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteKanbanColumn(id: string): Promise<boolean> {
    const result = await db.delete(kanbanColumns).where(eq(kanbanColumns.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updateProjectColumn(projectId: string, columnName: string): Promise<void> {
    // This method updates the project's status or notes to reflect its kanban column
    // For now, we'll just update the project to mark it as updated
    await db
      .update(projects)
      .set({ lastUpdated: sql`CURRENT_TIMESTAMP` })
      .where(eq(projects.id, projectId));
  }

  // Documents Implementation
  async getAllDocuments(): Promise<DocumentWithOwner[]> {
    const rows = await db
      .select({
        doc: documents,
        ownerId: users.id,
        ownerDisplayName: users.displayName,
        ownerEmail: users.email,
        ownerProfilePicture: users.profilePicture,
      })
      .from(documents)
      .leftJoin(users, eq(documents.ownerId, users.id))
      .orderBy(desc(documents.updatedAt));

    console.log("[getAllDocuments] First row sample:", rows[0] ? {
      docOwnerId: rows[0].doc.ownerId,
      joinedOwnerId: rows[0].ownerId,
      ownerName: rows[0].ownerDisplayName
    } : 'no rows');

    return rows.map(row => ({
      ...row.doc,
      owner: row.ownerId ? {
        id: row.ownerId,
        displayName: row.ownerDisplayName!,
        email: row.ownerEmail!,
        profilePicture: row.ownerProfilePicture,
      } : null,
    }));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return doc || undefined;
  }

  async getDocumentsByOwner(ownerId: string): Promise<DocumentWithOwner[]> {
    const rows = await db
      .select({
        doc: documents,
        ownerId: users.id,
        ownerDisplayName: users.displayName,
        ownerEmail: users.email,
        ownerProfilePicture: users.profilePicture,
      })
      .from(documents)
      .leftJoin(users, eq(documents.ownerId, users.id))
      .where(eq(documents.ownerId, ownerId))
      .orderBy(desc(documents.updatedAt));

    return rows.map(row => ({
      ...row.doc,
      owner: row.ownerId ? {
        id: row.ownerId,
        displayName: row.ownerDisplayName!,
        email: row.ownerEmail!,
        profilePicture: row.ownerProfilePicture,
      } : null,
    }));
  }

  async getDocumentsByCategory(category: 'blank' | 'meeting_notes'): Promise<DocumentWithOwner[]> {
    const rows = await db
      .select({
        doc: documents,
        ownerId: users.id,
        ownerDisplayName: users.displayName,
        ownerEmail: users.email,
        ownerProfilePicture: users.profilePicture,
      })
      .from(documents)
      .leftJoin(users, eq(documents.ownerId, users.id))
      .where(eq(documents.category, category))
      .orderBy(desc(documents.updatedAt));

    return rows.map(row => ({
      ...row.doc,
      owner: row.ownerId ? {
        id: row.ownerId,
        displayName: row.ownerDisplayName!,
        email: row.ownerEmail!,
        profilePicture: row.ownerProfilePicture,
      } : null,
    }));
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [newDoc] = await db
      .insert(documents)
      .values(doc)
      .returning();
    return newDoc;
  }

  async updateDocument(id: string, updates: UpdateDocument, updateTimestamp: boolean = false): Promise<Document | undefined> {
    // Only update updatedAt if content or title changed (passed via updateTimestamp flag)
    const setData = updateTimestamp
      ? { ...updates, updatedAt: sql`CURRENT_TIMESTAMP` }
      : { ...updates };

    const [updated] = await db
      .update(documents)
      .set(setData)
      .where(eq(documents.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDocument(id: string): Promise<boolean> {
    // Delete all comments first
    await db.delete(documentComments).where(eq(documentComments.documentId, id));
    // Then delete the document
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updateDocumentLastViewed(id: string): Promise<Document | undefined> {
    const [updated] = await db
      .update(documents)
      .set({ lastViewedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(documents.id, id))
      .returning();
    return updated || undefined;
  }

  // Document Name Uniqueness Implementation
  async isDocumentNameUnique(title: string, excludeDocId?: string): Promise<boolean> {
    // Case-insensitive check for document name
    const normalizedTitle = title.trim().toLowerCase();

    const existingDocs = await db
      .select()
      .from(documents)
      .where(sql`LOWER(TRIM(${documents.title})) = ${normalizedTitle}`);

    // If excluding a specific document (for update scenarios)
    if (excludeDocId) {
      const filteredDocs = existingDocs.filter(doc => doc.id !== excludeDocId);
      return filteredDocs.length === 0;
    }

    return existingDocs.length === 0;
  }

  async generateUniqueDocumentName(baseTitle: string): Promise<string> {
    const trimmedTitle = baseTitle.trim();

    // Check if original title is unique
    const isUnique = await this.isDocumentNameUnique(trimmedTitle);
    if (isUnique) {
      return trimmedTitle;
    }

    // Find all documents with similar names (base title or base title with number)
    const normalizedBase = trimmedTitle.toLowerCase();
    const existingDocs = await db
      .select({ title: documents.title })
      .from(documents)
      .where(sql`LOWER(TRIM(${documents.title})) LIKE ${normalizedBase + '%'}`);

    // Extract existing numbers from titles like "My Doc (1)", "My Doc (2)", etc.
    const existingNumbers: number[] = [];
    const pattern = new RegExp(`^${escapeRegex(normalizedBase)}\\s*\\((\\d+)\\)$`, 'i');

    for (const doc of existingDocs) {
      const match = doc.title.trim().toLowerCase().match(pattern);
      if (match) {
        existingNumbers.push(parseInt(match[1], 10));
      }
    }

    // Find the next available number
    let nextNumber = 1;
    if (existingNumbers.length > 0) {
      nextNumber = Math.max(...existingNumbers) + 1;
    }

    // Generate unique name
    const uniqueTitle = `${trimmedTitle} (${nextNumber})`;

    // Double-check that the generated name is unique
    const isNewUnique = await this.isDocumentNameUnique(uniqueTitle);
    if (!isNewUnique) {
      // Recursively try with the new title
      return this.generateUniqueDocumentName(uniqueTitle);
    }

    return uniqueTitle;
  }

  async getDocumentByTitle(title: string): Promise<Document | undefined> {
    const normalizedTitle = title.trim().toLowerCase();

    const [doc] = await db
      .select()
      .from(documents)
      .where(sql`LOWER(TRIM(${documents.title})) = ${normalizedTitle}`);

    return doc || undefined;
  }

  // Document Comments Implementation
  async getDocumentComments(documentId: string): Promise<DocumentComment[]> {
    const comments = await db
      .select()
      .from(documentComments)
      .where(eq(documentComments.documentId, documentId))
      .orderBy(documentComments.createdAt);
    return comments;
  }

  async createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment> {
    const [newComment] = await db
      .insert(documentComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async updateDocumentComment(id: string, updates: UpdateDocumentComment): Promise<DocumentComment | undefined> {
    const [updated] = await db
      .update(documentComments)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(documentComments.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDocumentComment(id: string): Promise<boolean> {
    const result = await db.delete(documentComments).where(eq(documentComments.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

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
    return result.rowCount !== null && result.rowCount > 0;
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
    await db
      .update(projects)
      .set({ sectionId: null })
      .where(eq(projects.sectionId, id));

    const result = await db.delete(projectSections).where(eq(projectSections.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

}

export const storage = new DatabaseStorage();
