import {
  type User,
  type InsertUser,
  type UpdateUser,
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
  type UserSession,
  type InsertUserSession,
  type ActivityLog,
  type InsertActivityLog,
  type Invitation,
  type InsertInvitation,
  type Team,
  type InsertTeam,
  type UpdateTeam,
  type ViewPreference,
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
  type DocumentWithOwner,
  type PageTreeNode,
} from "@shared/schema";

// Import individual storage modules
import { UserStorage, userStorage, type IUserStorage } from "./userStorage";
import { DocumentStorage, documentStorage, type IDocumentStorage } from "./documentStorage";
import { ProjectStorage, projectStorage, type IProjectStorage } from "./projectStorage";
import { GoalStorage, goalStorage, type IGoalStorage } from "./goalStorage";
import { SprintStorage, sprintStorage, type ISprintStorage } from "./sprintStorage";
import { TeamStorage, teamStorage, type ITeamStorage } from "./teamStorage";
import { WorkspaceStorage, workspaceStorage, type IWorkspaceStorage } from "./workspaceStorage";

// Re-export individual storage modules
export { UserStorage, userStorage, type IUserStorage } from "./userStorage";
export { DocumentStorage, documentStorage, type IDocumentStorage } from "./documentStorage";
export { ProjectStorage, projectStorage, type IProjectStorage } from "./projectStorage";
export { GoalStorage, goalStorage, type IGoalStorage } from "./goalStorage";
export { SprintStorage, sprintStorage, type ISprintStorage } from "./sprintStorage";
export { TeamStorage, teamStorage, type ITeamStorage } from "./teamStorage";
export { WorkspaceStorage, workspaceStorage, type IWorkspaceStorage } from "./workspaceStorage";

// Re-export helpers
export * from "./helpers";

// Combined storage interface for backward compatibility
export interface IStorage extends IUserStorage, IDocumentStorage, IProjectStorage, IGoalStorage, ISprintStorage, ITeamStorage, IWorkspaceStorage {
  // Project Status Updates (stub methods - implemented in routes directly)
  getProjectStatusUpdates(projectId: string): Promise<any[]>;
  createProjectStatusUpdate(update: any): Promise<any>;

  // Project Budgets (stub methods - implemented in routes directly)
  getProjectBudgets(projectId: string): Promise<any[]>;
  createProjectBudget(budget: any): Promise<any>;

  // Project Costs (stub methods - implemented in routes directly)
  getProjectCosts(projectId: string): Promise<any[]>;
  createProjectCost(cost: any): Promise<any>;

  // Project Attachments (stub methods - implemented in routes directly)
  getProjectAttachments(projectId: string): Promise<any[]>;
  createProjectAttachment(attachment: any): Promise<any>;

  // Document Pages (Hierarchy)
  getDocumentPages(parentDocumentId: string): Promise<Document[]>;
  createDocumentPage(parentDocumentId: string, title: string, ownerId: string): Promise<Document>;
  getPageTree(rootDocumentId: string): Promise<PageTreeNode[]>;
  reorderPage(documentId: string, newOrder: number): Promise<Document | undefined>;
  getRootDocument(documentId: string): Promise<Document | undefined>;
}

// Combined DatabaseStorage class that delegates to individual storage modules
export class DatabaseStorage implements IStorage {
  private userStorage = new UserStorage();
  private documentStorage = new DocumentStorage();
  private projectStorage = new ProjectStorage();
  private goalStorage = new GoalStorage();
  private sprintStorage = new SprintStorage();
  private teamStorage = new TeamStorage();
  private workspaceStorage = new WorkspaceStorage();

  constructor() {
    // Wire up cross-module dependencies
    this.projectStorage.setGoalProgressUpdater((goalId: string) => this.goalStorage.updateGoalProgress(goalId));
  }

  // ==================== USER STORAGE ====================
  getUser(id: string): Promise<User | undefined> {
    return this.userStorage.getUser(id);
  }

  getUserByEmail(email: string): Promise<User | undefined> {
    return this.userStorage.getUserByEmail(email);
  }

  createUser(user: InsertUser): Promise<User> {
    return this.userStorage.createUser(user);
  }

  updateUser(id: string, updates: UpdateUser): Promise<User | undefined> {
    return this.userStorage.updateUser(id, updates);
  }

  updateUserLastLogin(id: string): Promise<User> {
    return this.userStorage.updateUserLastLogin(id);
  }

  updateUserResetToken(id: string, token: string, expiry: Date): Promise<User | undefined> {
    return this.userStorage.updateUserResetToken(id, token, expiry);
  }

  getUserByResetToken(token: string): Promise<User | undefined> {
    return this.userStorage.getUserByResetToken(token);
  }

  clearResetToken(id: string): Promise<User | undefined> {
    return this.userStorage.clearResetToken(id);
  }

  updateUserRole(id: string, role: 'user' | 'admin' | 'sub-admin'): Promise<User | undefined> {
    return this.userStorage.updateUserRole(id, role);
  }

  updateUserOnlineStatus(id: string, isOnline: boolean): Promise<User | undefined> {
    return this.userStorage.updateUserOnlineStatus(id, isOnline);
  }

  updateUserActivity(id: string): Promise<User | undefined> {
    return this.userStorage.updateUserActivity(id);
  }

  getOnlineUsers(): Promise<User[]> {
    return this.userStorage.getOnlineUsers();
  }

  getUsersByRole(role: 'user' | 'admin' | 'sub-admin'): Promise<User[]> {
    return this.userStorage.getUsersByRole(role);
  }

  getAllUsers(): Promise<User[]> {
    return this.userStorage.getAllUsers();
  }

  createUserSession(session: InsertUserSession): Promise<UserSession> {
    return this.userStorage.createUserSession(session);
  }

  updateSessionActivity(sessionId: string): Promise<UserSession | undefined> {
    return this.userStorage.updateSessionActivity(sessionId);
  }

  deactivateUserSessions(userId: string): Promise<void> {
    return this.userStorage.deactivateUserSessions(userId);
  }

  getActiveUserSessions(): Promise<UserSession[]> {
    return this.userStorage.getActiveUserSessions();
  }

  logActivity(log: InsertActivityLog): Promise<ActivityLog> {
    return this.userStorage.logActivity(log);
  }

  getActivityLogs(options?: { userId?: string; action?: string; limit?: number; offset?: number }): Promise<ActivityLog[]> {
    return this.userStorage.getActivityLogs(options);
  }

  getUserLoginStats(): Promise<{ userId: string; displayName: string; email: string; lastLogin: Date; loginCount: number; }[]> {
    return this.userStorage.getUserLoginStats();
  }

  createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    return this.userStorage.createInvitation(invitation);
  }

  getInvitations(): Promise<Invitation[]> {
    return this.userStorage.getInvitations();
  }

  getInvitationByEmail(email: string): Promise<Invitation | undefined> {
    return this.userStorage.getInvitationByEmail(email);
  }

  // ==================== DOCUMENT STORAGE ====================
  getAllDocuments(): Promise<DocumentWithOwner[]> {
    return this.documentStorage.getAllDocuments();
  }

  getDocument(id: string): Promise<Document | undefined> {
    return this.documentStorage.getDocument(id);
  }

  getDocumentByPublicToken(token: string): Promise<Document | undefined> {
    return this.documentStorage.getDocumentByPublicToken(token);
  }

  getDocumentsByOwner(ownerId: string): Promise<DocumentWithOwner[]> {
    return this.documentStorage.getDocumentsByOwner(ownerId);
  }

  getDocumentsByCategory(category: 'blank' | 'meeting_notes' | 'project_overview'): Promise<DocumentWithOwner[]> {
    return this.documentStorage.getDocumentsByCategory(category as any);
  }

  createDocument(doc: InsertDocument): Promise<Document> {
    return this.documentStorage.createDocument(doc);
  }

  updateDocument(id: string, updates: UpdateDocument, updateTimestamp?: boolean): Promise<Document | undefined> {
    return this.documentStorage.updateDocument(id, updates, updateTimestamp);
  }

  deleteDocument(id: string): Promise<boolean> {
    return this.documentStorage.deleteDocument(id);
  }

  updateDocumentLastViewed(id: string): Promise<Document | undefined> {
    return this.documentStorage.updateDocumentLastViewed(id);
  }

  isDocumentNameUnique(title: string, excludeDocId?: string): Promise<boolean> {
    return this.documentStorage.isDocumentNameUnique(title, excludeDocId);
  }

  generateUniqueDocumentName(baseTitle: string): Promise<string> {
    return this.documentStorage.generateUniqueDocumentName(baseTitle);
  }

  getDocumentByTitle(title: string): Promise<Document | undefined> {
    return this.documentStorage.getDocumentByTitle(title);
  }

  shareDocument(share: { documentId: string; userId: string; permission: "view" | "edit" | "comment"; sharedBy: string }): Promise<any> {
    return this.documentStorage.shareDocument(share);
  }

  removeDocumentShare(documentId: string, userId: string): Promise<boolean> {
    return this.documentStorage.removeDocumentShare(documentId, userId);
  }

  getDocumentShares(documentId: string): Promise<any[]> {
    return this.documentStorage.getDocumentShares(documentId);
  }

  getDocumentShareForUser(documentId: string, userId: string): Promise<{ permission: "view" | "edit" | "comment" } | null> {
    return this.documentStorage.getDocumentShareForUser(documentId, userId);
  }

  getDocumentsSharedWithUser(userId: string): Promise<DocumentWithOwner[]> {
    return this.documentStorage.getDocumentsSharedWithUser(userId);
  }

  updateDocumentSharePermission(documentId: string, userId: string, permission: "view" | "edit" | "comment"): Promise<any> {
    return this.documentStorage.updateDocumentSharePermission(documentId, userId, permission);
  }

  updateSharedUserLastViewed(documentId: string, userId: string): Promise<any> {
    return this.documentStorage.updateSharedUserLastViewed(documentId, userId);
  }

  getDocumentComments(documentId: string): Promise<DocumentComment[]> {
    return this.documentStorage.getDocumentComments(documentId);
  }

  createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment> {
    return this.documentStorage.createDocumentComment(comment);
  }

  updateDocumentComment(id: string, updates: UpdateDocumentComment): Promise<DocumentComment | undefined> {
    return this.documentStorage.updateDocumentComment(id, updates);
  }

  deleteDocumentComment(id: string): Promise<boolean> {
    return this.documentStorage.deleteDocumentComment(id);
  }

  // Document Pages (Hierarchy)
  getDocumentPages(parentDocumentId: string): Promise<Document[]> {
    return this.documentStorage.getDocumentPages(parentDocumentId);
  }

  createDocumentPage(parentDocumentId: string, title: string, ownerId: string): Promise<Document> {
    return this.documentStorage.createDocumentPage(parentDocumentId, title, ownerId);
  }

  getPageTree(rootDocumentId: string): Promise<PageTreeNode[]> {
    return this.documentStorage.getPageTree(rootDocumentId);
  }

  reorderPage(documentId: string, newOrder: number): Promise<Document | undefined> {
    return this.documentStorage.reorderPage(documentId, newOrder);
  }

  getRootDocument(documentId: string): Promise<Document | undefined> {
    return this.documentStorage.getRootDocument(documentId);
  }

  // ==================== PROJECT STORAGE ====================
  getAllTeamMembers(): Promise<TeamMember[]> {
    return this.projectStorage.getAllTeamMembers();
  }

  getTeamMember(id: string): Promise<TeamMember | undefined> {
    return this.projectStorage.getTeamMember(id);
  }

  createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    return this.projectStorage.createTeamMember(member);
  }

  getAllProjects(): Promise<Project[]> {
    return this.projectStorage.getAllProjects();
  }

  getProject(id: string): Promise<Project | undefined> {
    return this.projectStorage.getProject(id);
  }

  createProject(project: InsertProject): Promise<Project> {
    return this.projectStorage.createProject(project);
  }

  updateProject(id: string, updates: UpdateProject): Promise<Project | undefined> {
    return this.projectStorage.updateProject(id, updates);
  }

  deleteProject(id: string): Promise<boolean> {
    return this.projectStorage.deleteProject(id);
  }

  getProjectsByDepartment(department: string): Promise<Project[]> {
    return this.projectStorage.getProjectsByDepartment(department);
  }

  getProjectsByStatus(status: string): Promise<Project[]> {
    return this.projectStorage.getProjectsByStatus(status);
  }

  getProjectsByOwner(owner: string): Promise<Project[]> {
    return this.projectStorage.getProjectsByOwner(owner);
  }

  searchProjects(query: string): Promise<Project[]> {
    return this.projectStorage.searchProjects(query);
  }

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
  }> {
    return this.projectStorage.getProjectMetrics();
  }

  resolveDependencies(completedTaskId: string): Promise<void> {
    return this.projectStorage.resolveDependencies(completedTaskId);
  }

  areAllDependenciesCompleted(dependencyIds: string[]): Promise<boolean> {
    return this.projectStorage.areAllDependenciesCompleted(dependencyIds);
  }

  validateAndBlockIfNeeded(projectId: string, dependencies: string[]): Promise<void> {
    return this.projectStorage.validateAndBlockIfNeeded(projectId, dependencies);
  }

  getDependencyInfo(projectId: string): Promise<{
    dependencies: Project[];
    dependents: Project[];
    blockedBy: Project[];
  }> {
    return this.projectStorage.getDependencyInfo(projectId);
  }

  // ==================== GOAL STORAGE ====================
  getAllGoals(): Promise<Goal[]> {
    return this.goalStorage.getAllGoals();
  }

  getGoal(id: string): Promise<Goal | undefined> {
    return this.goalStorage.getGoal(id);
  }

  createGoal(goal: InsertGoal): Promise<Goal> {
    return this.goalStorage.createGoal(goal);
  }

  updateGoal(id: string, updates: UpdateGoal): Promise<Goal | undefined> {
    return this.goalStorage.updateGoal(id, updates);
  }

  deleteGoal(id: string): Promise<boolean> {
    return this.goalStorage.deleteGoal(id);
  }

  getGoalProgress(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  }> {
    return this.goalStorage.getGoalProgress(id);
  }

  updateGoalProgress(goalId: string): Promise<void> {
    return this.goalStorage.updateGoalProgress(goalId);
  }

  // ==================== SPRINT STORAGE ====================
  getAllSprints(): Promise<Sprint[]> {
    return this.sprintStorage.getAllSprints();
  }

  getSprint(id: string): Promise<Sprint | undefined> {
    return this.sprintStorage.getSprint(id);
  }

  createSprint(sprint: InsertSprint): Promise<Sprint> {
    return this.sprintStorage.createSprint(sprint);
  }

  updateSprint(id: string, updates: UpdateSprint): Promise<Sprint | undefined> {
    return this.sprintStorage.updateSprint(id, updates);
  }

  deleteSprint(id: string): Promise<boolean> {
    return this.sprintStorage.deleteSprint(id);
  }

  getSprintProgress(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    totalEffort: number;
    completedEffort: number;
    progressPercentage: number;
  }> {
    return this.sprintStorage.getSprintProgress(id);
  }

  assignTasksToSprint(sprintId: string, taskIds: string[]): Promise<void> {
    return this.sprintStorage.assignTasksToSprint(sprintId, taskIds);
  }

  autoAssignTasksToSprint(sprintId: string, criteria: {
    departments?: string[];
    maxEffort?: number;
    prioritizeBy?: 'risk' | 'dueDate' | 'effort';
  }): Promise<string[]> {
    return this.sprintStorage.autoAssignTasksToSprint(sprintId, criteria);
  }

  updateSprintProgress(sprintId: string): Promise<void> {
    return this.sprintStorage.updateSprintProgress(sprintId);
  }

  // ==================== TEAM STORAGE ====================
  getAllTeams(): Promise<Team[]> {
    return this.teamStorage.getAllTeams();
  }

  getTeam(id: string): Promise<Team | undefined> {
    return this.teamStorage.getTeam(id);
  }

  createTeam(team: InsertTeam): Promise<Team> {
    return this.teamStorage.createTeam(team);
  }

  updateTeam(id: string, updates: UpdateTeam): Promise<Team | undefined> {
    return this.teamStorage.updateTeam(id, updates);
  }

  deleteTeam(id: string): Promise<boolean> {
    return this.teamStorage.deleteTeam(id);
  }

  getViewPreference(userId: string, teamId: string): Promise<ViewPreference | undefined> {
    return this.teamStorage.getViewPreference(userId, teamId);
  }

  setViewPreference(userId: string, teamId: string, viewType: 'table' | 'kanban'): Promise<ViewPreference> {
    return this.teamStorage.setViewPreference(userId, teamId, viewType);
  }

  getKanbanColumns(teamId: string): Promise<KanbanColumn[]> {
    return this.teamStorage.getKanbanColumns(teamId);
  }

  createKanbanColumn(column: InsertKanbanColumn): Promise<KanbanColumn> {
    return this.teamStorage.createKanbanColumn(column);
  }

  updateKanbanColumn(id: string, updates: UpdateKanbanColumn): Promise<KanbanColumn | undefined> {
    return this.teamStorage.updateKanbanColumn(id, updates);
  }

  deleteKanbanColumn(id: string): Promise<boolean> {
    return this.teamStorage.deleteKanbanColumn(id);
  }

  updateProjectColumn(projectId: string, columnName: string): Promise<void> {
    return this.teamStorage.updateProjectColumn(projectId, columnName);
  }

  // ==================== WORKSPACE STORAGE ====================
  getAllWorkspaceProjects(): Promise<WorkspaceProject[]> {
    return this.workspaceStorage.getAllWorkspaceProjects();
  }

  getWorkspaceProject(id: string): Promise<WorkspaceProject | undefined> {
    return this.workspaceStorage.getWorkspaceProject(id);
  }

  getWorkspaceProjectsByOwner(ownerId: string): Promise<WorkspaceProject[]> {
    return this.workspaceStorage.getWorkspaceProjectsByOwner(ownerId);
  }

  getWorkspaceProjectsForUser(userId: string): Promise<WorkspaceProject[]> {
    return this.workspaceStorage.getWorkspaceProjectsForUser(userId);
  }

  createWorkspaceProject(project: InsertWorkspaceProject): Promise<WorkspaceProject> {
    return this.workspaceStorage.createWorkspaceProject(project);
  }

  updateWorkspaceProject(id: string, updates: UpdateWorkspaceProject): Promise<WorkspaceProject | undefined> {
    return this.workspaceStorage.updateWorkspaceProject(id, updates);
  }

  deleteWorkspaceProject(id: string): Promise<boolean> {
    return this.workspaceStorage.deleteWorkspaceProject(id);
  }

  getProjectSections(projectId: string): Promise<ProjectSection[]> {
    return this.workspaceStorage.getProjectSections(projectId);
  }

  createProjectSection(section: InsertProjectSection): Promise<ProjectSection> {
    return this.workspaceStorage.createProjectSection(section);
  }

  updateProjectSection(id: string, updates: UpdateProjectSection): Promise<ProjectSection | undefined> {
    return this.workspaceStorage.updateProjectSection(id, updates);
  }

  deleteProjectSection(id: string): Promise<boolean> {
    return this.workspaceStorage.deleteProjectSection(id);
  }

  // ==================== STUB METHODS (implemented directly in routes) ====================
  async getProjectStatusUpdates(_projectId: string): Promise<any[]> {
    throw new Error("Method implemented in routes.ts using direct db queries");
  }

  async createProjectStatusUpdate(_update: any): Promise<any> {
    throw new Error("Method implemented in routes.ts using direct db queries");
  }

  async getProjectBudgets(_projectId: string): Promise<any[]> {
    throw new Error("Method implemented in routes.ts using direct db queries");
  }

  async createProjectBudget(_budget: any): Promise<any> {
    throw new Error("Method implemented in routes.ts using direct db queries");
  }

  async getProjectCosts(_projectId: string): Promise<any[]> {
    throw new Error("Method implemented in routes.ts using direct db queries");
  }

  async createProjectCost(_cost: any): Promise<any> {
    throw new Error("Method implemented in routes.ts using direct db queries");
  }

  async getProjectAttachments(_projectId: string): Promise<any[]> {
    throw new Error("Method implemented in routes.ts using direct db queries");
  }

  async createProjectAttachment(_attachment: any): Promise<any> {
    throw new Error("Method implemented in routes.ts using direct db queries");
  }
}

// Export the singleton instance for backward compatibility
export const storage = new DatabaseStorage();
