import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { requireAuth, requireCyberbayDomain, hashPassword, validatePassword, validateEmail } from "./auth";
import { insertProjectSchema, updateProjectSchema, insertTeamMemberSchema, insertGoalSchema, updateGoalSchema, insertSprintSchema, updateSprintSchema, updateUserRoleSchema, projectStatusUpdates, projectBudgets, projectCosts, workspaceProjects, projectActivities, projectAttachments, insertProjectBudgetSchema, insertProjectCostSchema, users, projects } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { z } from "zod";
import { isValidContextId } from "@shared/context-helpers";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { registerDocImportRoutes } from "./controllers/docImport";
import { registerDocNameRoutes } from "./controllers/docName";
import { registerDocsRoutes } from "./controllers/docsController";



export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      
      // Validate email domain
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return res.status(400).json({ message: emailValidation.message });
      }
      
      // Validate password
      const passwordValidation = await validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        displayName
      });
      
      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error('Login error after signup:', err);
          return res.status(500).json({ message: 'Account created but login failed. Please try logging in.' });
        }
        res.status(201).json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Failed to create account. Please try again.' });
    }
  });

  app.post('/api/auth/login', async (req, res, next) => {
    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({ message: 'Authentication system error. Please try again later.' });
      }
      if (!user) {
        const message = info?.message || 'Invalid email or password. Please check your credentials and try again.';
        return res.status(401).json({ message });
      }
      
      req.login(user, async (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.status(500).json({ message: 'Login session error. Please try again.' });
        }
        
        try {
          // Log the login activity
          await storage.logActivity({
            userId: user.id,
            action: 'login',
            details: JSON.stringify({ email: user.email }),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
          });
          
          // Update user online status
          await storage.updateUserOnlineStatus(user.id, true);
          
          res.json({ 
            user: { 
              id: user.id, 
              email: user.email, 
              displayName: user.displayName, 
              role: user.role,
              profilePicture: user.profilePicture 
            } 
          });
        } catch (logError) {
          console.error('Error logging activity:', logError);
          // Still allow login even if logging fails
          res.json({ 
            user: { 
              id: user.id, 
              email: user.email, 
              displayName: user.displayName,
              role: user.role,
              profilePicture: user.profilePicture
            } 
          });
        }
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', async (req, res) => {
    const userId = (req.user as any)?.id;
    
    req.logout(async () => {
      if (userId) {
        try {
          // Log the logout activity
          await storage.logActivity({
            userId,
            action: 'logout',
            details: JSON.stringify({ timestamp: new Date().toISOString() }),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
          });
          
          // Update user online status
          await storage.updateUserOnlineStatus(userId, false);
        } catch (error) {
          console.error('Error logging logout:', error);
        }
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      // Validate email domain
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return res.status(400).json({ message: emailValidation.message });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
      }
      
      // Generate reset token
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      await storage.updateUserResetToken(user.id, resetToken, resetExpiry);
      
      // In a real app, you'd send an email here
      // For now, just log the reset token (in production, remove this)
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to process password reset request.' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      // Validate password
      const passwordValidation = await validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
      }
      
      // Hash new password and update user
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      await storage.clearResetToken(user.id);
      
      res.json({ message: 'Password reset successfully.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Failed to reset password.' });
    }
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Onboarding Routes
  app.post('/api/onboarding/complete', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { useCase, managementArea, heardFrom, workspaceName, features, inviteEmails } = req.body;
      
      // Update user with onboarding data
      await storage.updateUser(user.id, {
        hasCompletedOnboarding: true,
        onboardingUseCase: useCase,
        onboardingManagementArea: managementArea,
        onboardingHeardFrom: heardFrom,
        onboardingWorkspaceName: workspaceName,
        onboardingInterestedFeatures: features || []
      });
      
      // Process invites if any (with role selection)
      if (inviteEmails && Array.isArray(inviteEmails) && inviteEmails.length > 0) {
        for (const invite of inviteEmails) {
          if (invite.email && validateEmail(invite.email).isValid) {
            await storage.createInvitation({
              email: invite.email,
              role: invite.role || 'user',
              invitedBy: user.id
            });
          }
        }
      }
      
      res.json({ message: 'Onboarding completed successfully' });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      res.status(500).json({ message: 'Failed to complete onboarding' });
    }
  });

  app.post('/api/onboarding/skip', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Simply mark onboarding as completed without collecting data
      await storage.updateUser(user.id, {
        hasCompletedOnboarding: true
      });
      
      res.json({ message: 'Onboarding skipped successfully' });
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      res.status(500).json({ message: 'Failed to skip onboarding' });
    }
  });

  // Admin Routes - only accessible by admin and sub-admin users
  const requireAdminAccess = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const user = req.user;
    if (user.role !== 'admin' && user.role !== 'sub-admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  app.get('/api/admin/users', requireAdminAccess, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response
      const sanitizedUsers = users.map(({ password, resetToken, resetTokenExpiry, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.get('/api/admin/users/online', requireAdminAccess, async (req, res) => {
    try {
      const onlineUsers = await storage.getOnlineUsers();
      // Remove sensitive data from response
      const sanitizedUsers = onlineUsers.map(({ password, resetToken, resetTokenExpiry, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Error fetching online users:', error);
      res.status(500).json({ message: 'Failed to fetch online users' });
    }
  });

  app.get('/api/admin/activity-logs', requireAdminAccess, async (req, res) => {
    try {
      const { userId, action, limit = 50, offset = 0 } = req.query;
      const logs = await storage.getActivityLogs({
        userId: userId as string,
        action: action as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ message: 'Failed to fetch activity logs' });
    }
  });

  app.get('/api/admin/login-stats', requireAdminAccess, async (req, res) => {
    try {
      const stats = await storage.getUserLoginStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching login stats:', error);
      res.status(500).json({ message: 'Failed to fetch login statistics' });
    }
  });

  app.put('/api/admin/users/:id/role', requireAdminAccess, async (req, res) => {
    try {
      const currentUser = req.user as any;
      const targetUserId = req.params.id;
      
      // Only admin can change roles, not sub-admin
      if (currentUser.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can change user roles' });
      }
      
      const validatedData = updateUserRoleSchema.parse(req.body);
      const updatedUser = await storage.updateUserRole(targetUserId, validatedData.role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Log the role change activity
      await storage.logActivity({
        userId: currentUser.id,
        action: 'role_change',
        details: JSON.stringify({ 
          targetUserId, 
          oldRole: 'unknown', // We'd need to fetch this first in a real implementation
          newRole: validatedData.role 
        }),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      // Remove sensitive data from response
      const { password, resetToken, resetTokenExpiry, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid role data', errors: error.errors });
      } else {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Failed to update user role' });
      }
    }
  });

  // Invitations Routes
  app.post('/api/invites', requireAdminAccess, async (req, res) => {
    try {
      const currentUser = req.user as any;
      const { emails, role } = req.body;
      
      if (!emails || typeof emails !== 'string') {
        return res.status(400).json({ message: 'Email addresses are required' });
      }
      
      // Split emails by comma or space and clean them
      const emailList = emails
        .split(/[,\s]+/)
        .map((email: string) => email.trim())
        .filter((email: string) => email.length > 0);
      
      if (emailList.length === 0) {
        return res.status(400).json({ message: 'Please provide at least one valid email address' });
      }
      
      // Create invitations for each email
      const createdInvitations = [];
      for (const email of emailList) {
        const invitation = await storage.createInvitation({
          email,
          role: role || 'user',
          invitedBy: currentUser.id,
          status: 'pending'
        });
        createdInvitations.push(invitation);
      }
      
      // Log the invitation activity
      await storage.logActivity({
        userId: currentUser.id,
        action: 'invitations_sent',
        details: JSON.stringify({ 
          emails: emailList,
          role: role || 'user',
          count: emailList.length 
        }),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      res.status(201).json({ 
        message: `${createdInvitations.length} invitation(s) sent successfully`,
        invitations: createdInvitations 
      });
    } catch (error) {
      console.error('Error creating invitations:', error);
      res.status(500).json({ message: 'Failed to send invitations' });
    }
  });

  app.get('/api/invites', requireAdminAccess, async (req, res) => {
    try {
      const invitations = await storage.getInvitations();
      res.json(invitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      res.status(500).json({ message: 'Failed to fetch invitations' });
    }
  });

  // Teams Routes
  app.get('/api/teams', async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      res.status(500).json({ message: 'Failed to fetch teams' });
    }
  });

  app.post('/api/teams', requireAdminAccess, async (req, res) => {
    try {
      const { name, icon, color, description } = req.body;
      
      if (!name || !icon || !color) {
        return res.status(400).json({ message: 'Name, icon, and color are required' });
      }

      const newTeam = await storage.createTeam({
        name,
        icon,
        color,
        description: description || null,
      });

      // Create default kanban columns for new team
      const defaultColumns = [
        { teamId: newTeam.id, name: 'New task', color: '#8B5CF6', icon: '📋', order: 0, isDefault: true },
        { teamId: newTeam.id, name: 'Scheduled', color: '#3B82F6', icon: '📅', order: 1, isDefault: true },
        { teamId: newTeam.id, name: 'In Progress', color: '#F59E0B', icon: '🔨', order: 2, isDefault: true },
        { teamId: newTeam.id, name: 'Completed', color: '#10B981', icon: '✅', order: 3, isDefault: true },
      ];

      for (const column of defaultColumns) {
        await storage.createKanbanColumn(column);
      }

      // Log activity
      const currentUser = req.user as any;
      if (currentUser) {
        await storage.logActivity({
          userId: currentUser.id,
          action: 'team_created',
          details: JSON.stringify({ teamId: newTeam.id, teamName: newTeam.name }),
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      }

      res.status(201).json(newTeam);
    } catch (error) {
      console.error('Error creating team:', error);
      res.status(500).json({ message: 'Failed to create team' });
    }
  });

  // View Preferences Routes
  app.get('/api/teams/:teamId/view-preference', requireAuth, async (req, res) => {
    try {
      const { teamId } = req.params;
      const userId = (req.user as any).id;
      
      // Validate contextId format
      if (!isValidContextId(teamId)) {
        return res.status(400).json({ message: 'Invalid context ID format. Expected "dept:<name>" or "team:<uuid>"' });
      }
      
      const preference = await storage.getViewPreference(userId, teamId);
      
      if (!preference) {
        // Return default preference if none exists
        return res.json({ viewType: 'table' });
      }
      
      res.json({ viewType: preference.viewType });
    } catch (error) {
      console.error('Error fetching view preference:', error);
      res.status(500).json({ message: 'Failed to fetch view preference' });
    }
  });

  app.post('/api/teams/:teamId/view-preference', requireAuth, async (req, res) => {
    try {
      const { teamId } = req.params;
      const { viewType } = req.body;
      const userId = (req.user as any).id;
      
      // Validate contextId format
      if (!isValidContextId(teamId)) {
        return res.status(400).json({ message: 'Invalid context ID format. Expected "dept:<name>" or "team:<uuid>"' });
      }
      
      if (!viewType || !['table', 'kanban'].includes(viewType)) {
        return res.status(400).json({ message: 'Invalid view type. Must be "table" or "kanban"' });
      }
      
      const preference = await storage.setViewPreference(userId, teamId, viewType);
      res.json(preference);
    } catch (error) {
      console.error('Error setting view preference:', error);
      res.status(500).json({ message: 'Failed to set view preference' });
    }
  });

  // Kanban Columns Routes
  app.get('/api/teams/:teamId/kanban-columns', async (req, res) => {
    try {
      const { teamId } = req.params;
      
      // Validate contextId format
      if (!isValidContextId(teamId)) {
        return res.status(400).json({ message: 'Invalid context ID format. Expected "dept:<name>" or "team:<uuid>"' });
      }
      
      const columns = await storage.getKanbanColumns(teamId);
      res.json(columns);
    } catch (error) {
      console.error('Error fetching kanban columns:', error);
      res.status(500).json({ message: 'Failed to fetch kanban columns' });
    }
  });

  app.post('/api/teams/:teamId/kanban-columns', requireAdminAccess, async (req, res) => {
    try {
      const { teamId } = req.params;
      const { name, color, order } = req.body;
      
      // Validate contextId format
      if (!isValidContextId(teamId)) {
        return res.status(400).json({ message: 'Invalid context ID format. Expected "dept:<name>" or "team:<uuid>"' });
      }
      
      if (!name) {
        return res.status(400).json({ message: 'Column name is required' });
      }
      
      const column = await storage.createKanbanColumn({
        teamId,
        name,
        color: color || '#6B7280',
        order: order || 0,
        isDefault: false,
      });
      
      res.status(201).json(column);
    } catch (error) {
      console.error('Error creating kanban column:', error);
      res.status(500).json({ message: 'Failed to create kanban column' });
    }
  });

  app.put('/api/kanban-columns/:id', requireAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const column = await storage.updateKanbanColumn(id, updates);
      
      if (!column) {
        return res.status(404).json({ message: 'Column not found' });
      }
      
      res.json(column);
    } catch (error) {
      console.error('Error updating kanban column:', error);
      res.status(500).json({ message: 'Failed to update kanban column' });
    }
  });

  app.delete('/api/kanban-columns/:id', requireAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteKanbanColumn(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Column not found' });
      }
      
      res.json({ message: 'Column deleted successfully' });
    } catch (error) {
      console.error('Error deleting kanban column:', error);
      res.status(500).json({ message: 'Failed to delete kanban column' });
    }
  });

  // Team Members Routes
  app.get("/api/team-members", async (_req, res) => {
    try {
      const members = await storage.getAllTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post("/api/team-members", async (req, res) => {
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
  });

  // Projects Routes
  app.get("/api/projects", async (req, res) => {
    try {
      const { department, status, owner, search } = req.query;
      
      let projects;
      if (search) {
        projects = await storage.searchProjects(search as string);
      } else if (department) {
        projects = await storage.getProjectsByDepartment(department as string);
      } else if (status) {
        projects = await storage.getProjectsByStatus(status as string);
      } else if (owner) {
        projects = await storage.getProjectsByOwner(owner as string);
      } else {
        projects = await storage.getAllProjects();
      }
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects", error: String(error) });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      console.log("Creating project with data:", req.body);
      const validatedData = insertProjectSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create project", error: String(error) });
      }
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const validatedData = updateProjectSchema.parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update project" });
      }
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Metrics Route
  app.get("/api/metrics", async (_req, res) => {
    try {
      const metrics = await storage.getProjectMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics", error: String(error) });
    }
  });

  // Dependency Routes
  app.get("/api/projects/:id/dependencies", async (req, res) => {
    try {
      const dependencyInfo = await storage.getDependencyInfo(req.params.id);
      res.json(dependencyInfo);
    } catch (error) {
      console.error("Error fetching dependency info:", error);
      res.status(500).json({ message: "Failed to fetch dependency information" });
    }
  });

  app.post("/api/projects/:id/validate-dependencies", async (req, res) => {
    try {
      const { dependencies } = req.body;
      await storage.validateAndBlockIfNeeded(req.params.id, dependencies);
      res.json({ success: true });
    } catch (error) {
      console.error("Error validating dependencies:", error);
      res.status(500).json({ message: "Failed to validate dependencies" });
    }
  });

  // Goals Routes
  app.get("/api/goals", async (_req, res) => {
    try {
      const goals = await storage.getAllGoals();
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.getGoal(req.params.id);
      if (!goal) {
        res.status(404).json({ message: "Goal not found" });
        return;
      }
      res.json(goal);
    } catch (error) {
      console.error("Error fetching goal:", error);
      res.status(500).json({ message: "Failed to fetch goal" });
    }
  });

  app.get("/api/goals/:id/progress", async (req, res) => {
    try {
      const progress = await storage.getGoalProgress(req.params.id);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching goal progress:", error);
      res.status(500).json({ message: "Failed to fetch goal progress" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating goal:", error);
        res.status(500).json({ message: "Failed to create goal" });
      }
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const validatedData = updateGoalSchema.parse(req.body);
      const goal = await storage.updateGoal(req.params.id, validatedData);
      if (!goal) {
        res.status(404).json({ message: "Goal not found" });
        return;
      }
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error updating goal:", error);
        res.status(500).json({ message: "Failed to update goal" });
      }
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const success = await storage.deleteGoal(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Goal not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Sprints Routes
  app.get("/api/sprints", async (_req, res) => {
    try {
      const sprints = await storage.getAllSprints();
      res.json(sprints);
    } catch (error) {
      console.error("Error fetching sprints:", error);
      res.status(500).json({ message: "Failed to fetch sprints" });
    }
  });

  app.get("/api/sprints/:id", async (req, res) => {
    try {
      const sprint = await storage.getSprint(req.params.id);
      if (!sprint) {
        res.status(404).json({ message: "Sprint not found" });
        return;
      }
      res.json(sprint);
    } catch (error) {
      console.error("Error fetching sprint:", error);
      res.status(500).json({ message: "Failed to fetch sprint" });
    }
  });

  app.get("/api/sprints/:id/progress", async (req, res) => {
    try {
      const progress = await storage.getSprintProgress(req.params.id);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching sprint progress:", error);
      res.status(500).json({ message: "Failed to fetch sprint progress" });
    }
  });

  app.post("/api/sprints", async (req, res) => {
    try {
      const validatedData = insertSprintSchema.parse(req.body);
      const sprint = await storage.createSprint(validatedData);
      res.status(201).json(sprint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating sprint:", error);
        res.status(500).json({ message: "Failed to create sprint" });
      }
    }
  });

  app.put("/api/sprints/:id", async (req, res) => {
    try {
      const validatedData = updateSprintSchema.parse(req.body);
      const sprint = await storage.updateSprint(req.params.id, validatedData);
      if (!sprint) {
        res.status(404).json({ message: "Sprint not found" });
        return;
      }
      res.json(sprint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error updating sprint:", error);
        res.status(500).json({ message: "Failed to update sprint" });
      }
    }
  });

  app.delete("/api/sprints/:id", async (req, res) => {
    try {
      const success = await storage.deleteSprint(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Sprint not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sprint:", error);
      res.status(500).json({ message: "Failed to delete sprint" });
    }
  });

  app.post("/api/sprints/:id/assign-tasks", async (req, res) => {
    try {
      const { taskIds } = req.body;
      await storage.assignTasksToSprint(req.params.id, taskIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error assigning tasks to sprint:", error);
      res.status(500).json({ message: "Failed to assign tasks to sprint" });
    }
  });

  app.post("/api/sprints/:id/auto-assign", async (req, res) => {
    try {
      const criteria = req.body;
      const assignedTaskIds = await storage.autoAssignTasksToSprint(req.params.id, criteria);
      res.json({ assignedTaskIds, count: assignedTaskIds.length });
    } catch (error) {
      console.error("Error auto-assigning tasks to sprint:", error);
      res.status(500).json({ message: "Failed to auto-assign tasks to sprint" });
    }
  });

  // Calendar Routes
  app.put("/api/projects/:id/schedule", async (req, res) => {
    try {
      const { scheduledDate } = req.body;
      const project = await storage.updateProject(req.params.id, { scheduledDate });
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      console.error("Error scheduling project:", error);
      res.status(500).json({ message: "Failed to schedule project" });
    }
  });

  // User Profile Routes
  app.patch("/api/users/profile", requireAuth, async (req, res) => {
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

  app.post("/api/users/change-password", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Verify current password
      const bcrypt = await import('bcrypt');
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }

      // Validate new password
      const passwordValidation = await validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        res.status(400).json({ message: passwordValidation.message });
        return;
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUser(userId, { password: hashedPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Public Users endpoint (for comment authors, etc)
  app.get("/api/users", requireAuth, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Only return non-sensitive user info
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

  // Workspace Projects Routes
  app.get("/api/workspace-projects", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const projects = await storage.getWorkspaceProjectsForUser(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching workspace projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/workspace-projects/:id", requireAuth, async (req, res) => {
    try {
      const project = await storage.getWorkspaceProject(req.params.id);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/workspace-projects", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const { name, color, startDate, endDate, privacy, memberIds, defaultLayout } = req.body;
      
      const project = await storage.createWorkspaceProject({
        name,
        color,
        startDate,
        endDate,
        ownerId: userId,
        privacy,
        memberIds,
        defaultLayout
      });
      
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/workspace-projects/:id", requireAuth, async (req, res) => {
    try {
      const { name, color, startDate, endDate, privacy, memberIds, defaultLayout } = req.body;
      
      const project = await storage.updateWorkspaceProject(req.params.id, {
        name,
        color,
        startDate,
        endDate,
        privacy,
        memberIds,
        defaultLayout
      });
      
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/workspace-projects/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteWorkspaceProject(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Project Sections Routes
  app.get("/api/project-sections/:projectId", requireAuth, async (req, res) => {
    try {
      const sections = await storage.getProjectSections(req.params.projectId);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  app.post("/api/project-sections", requireAuth, async (req, res) => {
    try {
      const { projectId, name, order } = req.body;
      const section = await storage.createProjectSection({
        projectId,
        name,
        order: order ?? 0,
        isCollapsed: false,
      });
      res.status(201).json(section);
    } catch (error) {
      console.error("Error creating section:", error);
      res.status(500).json({ message: "Failed to create section" });
    }
  });

  app.patch("/api/project-sections/:id", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const section = await storage.updateProjectSection(req.params.id, updates);
      if (!section) {
        res.status(404).json({ message: "Section not found" });
        return;
      }
      res.json(section);
    } catch (error) {
      console.error("Error updating section:", error);
      res.status(500).json({ message: "Failed to update section" });
    }
  });

  app.delete("/api/project-sections/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteProjectSection(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Section not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ message: "Failed to delete section" });
    }
  });

  // Project Status Updates
  app.get("/api/project-status-updates/:projectId", requireAuth, async (req, res) => {
    try {
      const updates = await db
        .select({
          id: projectStatusUpdates.id,
          projectId: projectStatusUpdates.projectId,
          status: projectStatusUpdates.status,
          description: projectStatusUpdates.description,
          userId: projectStatusUpdates.userId,
          createdAt: projectStatusUpdates.createdAt,
          userName: users.displayName,
          userEmail: users.email,
        })
        .from(projectStatusUpdates)
        .leftJoin(users, eq(projectStatusUpdates.userId, users.id))
        .where(eq(projectStatusUpdates.projectId, req.params.projectId))
        .orderBy(desc(projectStatusUpdates.createdAt));
      res.json(updates);
    } catch (error) {
      console.error("Error fetching status updates:", error);
      res.status(500).json({ message: "Failed to fetch status updates" });
    }
  });

  app.post("/api/project-status-updates", requireAuth, async (req, res) => {
    try {
      const { projectId, status, description, userId } = req.body;
      const [statusUpdate] = await db
        .insert(projectStatusUpdates)
        .values({ projectId, status, description, userId })
        .returning();
      res.status(201).json(statusUpdate);
    } catch (error) {
      console.error("Error creating status update:", error);
      res.status(500).json({ message: "Failed to create status update" });
    }
  });

  // Project Budgets
  app.get("/api/project-budgets/:projectId", requireAuth, async (req, res) => {
    try {
      const budgets = await db
        .select()
        .from(projectBudgets)
        .where(eq(projectBudgets.projectId, req.params.projectId))
        .orderBy(desc(projectBudgets.createdAt));
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/project-budgets", requireAuth, async (req, res) => {
    try {
      const { projectId, name, type, amount, currency, billDate, category, description } = req.body;
      const [budget] = await db
        .insert(projectBudgets)
        .values({ projectId, name, type, amount, currency: currency || "USD", billDate, category, description })
        .returning();
      res.status(201).json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  // Project Costs
  app.get("/api/project-costs/:projectId", requireAuth, async (req, res) => {
    try {
      const costs = await db
        .select()
        .from(projectCosts)
        .where(eq(projectCosts.projectId, req.params.projectId))
        .orderBy(desc(projectCosts.createdAt));
      res.json(costs);
    } catch (error) {
      console.error("Error fetching costs:", error);
      res.status(500).json({ message: "Failed to fetch costs" });
    }
  });

  app.post("/api/project-costs", requireAuth, async (req, res) => {
    try {
      const { projectId, name, type, amount, currency, date, category, description } = req.body;
      const [cost] = await db
        .insert(projectCosts)
        .values({ projectId, name, type, amount, currency: currency || "USD", date, category, description })
        .returning();
      res.status(201).json(cost);
    } catch (error) {
      console.error("Error creating cost:", error);
      res.status(500).json({ message: "Failed to create cost" });
    }
  });

  app.patch("/api/project-costs/:id", requireAuth, async (req, res) => {
    try {
      const { name, type, amount, currency, date, category, description } = req.body;
      const [cost] = await db
        .update(projectCosts)
        .set({ name, type, amount, currency, date, category, description })
        .where(eq(projectCosts.id, req.params.id))
        .returning();
      
      if (!cost) {
        res.status(404).json({ message: "Cost not found" });
        return;
      }
      
      res.json(cost);
    } catch (error) {
      console.error("Error updating cost:", error);
      res.status(500).json({ message: "Failed to update cost" });
    }
  });

  app.delete("/api/project-costs/:id", requireAuth, async (req, res) => {
    try {
      const [cost] = await db
        .delete(projectCosts)
        .where(eq(projectCosts.id, req.params.id))
        .returning();
      
      if (!cost) {
        res.status(404).json({ message: "Cost not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting cost:", error);
      res.status(500).json({ message: "Failed to delete cost" });
    }
  });

  // Project Activities
  app.get("/api/project-activities/:projectId", requireAuth, async (req, res) => {
    try {
      const activities = await db
        .select()
        .from(projectActivities)
        .where(eq(projectActivities.projectId, req.params.projectId))
        .orderBy(desc(projectActivities.createdAt));
      res.json(activities);
    } catch (error) {
      console.error("Error fetching project activities:", error);
      res.status(500).json({ message: "Failed to fetch project activities" });
    }
  });

  app.post("/api/project-activities", requireAuth, async (req, res) => {
    try {
      const { projectId, userId, activityType, entityName, oldValue, newValue } = req.body;
      const [activity] = await db
        .insert(projectActivities)
        .values({ projectId, userId, activityType, entityName, oldValue, newValue })
        .returning();
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating project activity:", error);
      res.status(500).json({ message: "Failed to create project activity" });
    }
  });

  // PATCH route for updating workspace project
  app.patch("/api/workspace-projects/:id", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const [project] = await db
        .update(workspaceProjects)
        .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(workspaceProjects.id, req.params.id))
        .returning();
      
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Workspace Project Tasks Routes
  app.get("/api/projects/:projectId/tasks", requireAuth, async (req, res) => {
    try {
      const tasks = await db
        .select()
        .from(projects)
        .where(eq(projects.workspaceProjectId, req.params.projectId))
        .orderBy(desc(projects.createdAt));
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      res.status(500).json({ message: "Failed to fetch project tasks" });
    }
  });

  app.post("/api/projects/:projectId/tasks", requireAuth, async (req, res) => {
    try {
      const taskData = {
        ...req.body,
        workspaceProjectId: req.params.projectId,
      };
      const validatedData = insertProjectSchema.parse(taskData);
      const [task] = await db
        .insert(projects)
        .values(validatedData)
        .returning();
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating project task:", error);
      res.status(500).json({ message: "Failed to create project task" });
    }
  });

  app.patch("/api/projects/:projectId/tasks/:taskId", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      const [task] = await db
        .update(projects)
        .set({ ...updates, lastUpdated: sql`CURRENT_TIMESTAMP` })
        .where(eq(projects.id, req.params.taskId))
        .returning();
      
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating project task:", error);
      res.status(500).json({ message: "Failed to update project task" });
    }
  });

  // Project Budgets Routes
  app.get("/api/projects/:projectId/budgets", requireAuth, async (req, res) => {
    try {
      const budgets = await db
        .select()
        .from(projectBudgets)
        .where(eq(projectBudgets.projectId, req.params.projectId))
        .orderBy(desc(projectBudgets.createdAt));
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/projects/:projectId/budgets", requireAuth, async (req, res) => {
    try {
      const validatedData = insertProjectBudgetSchema.parse(req.body);
      const [budget] = await db
        .insert(projectBudgets)
        .values(validatedData)
        .returning();
      res.status(201).json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.delete("/api/projects/:projectId/budgets/:id", requireAuth, async (req, res) => {
    try {
      await db
        .delete(projectBudgets)
        .where(eq(projectBudgets.id, req.params.id));
      res.status(200).json({ message: "Budget deleted successfully" });
    } catch (error) {
      console.error("Error deleting budget:", error);
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  // Project Costs Routes
  app.get("/api/projects/:projectId/costs", requireAuth, async (req, res) => {
    try {
      const costs = await db
        .select()
        .from(projectCosts)
        .where(eq(projectCosts.projectId, req.params.projectId))
        .orderBy(desc(projectCosts.createdAt));
      res.json(costs);
    } catch (error) {
      console.error("Error fetching costs:", error);
      res.status(500).json({ message: "Failed to fetch costs" });
    }
  });

  app.post("/api/projects/:projectId/costs", requireAuth, async (req, res) => {
    try {
      const validatedData = insertProjectCostSchema.parse(req.body);
      const [cost] = await db
        .insert(projectCosts)
        .values(validatedData)
        .returning();
      res.status(201).json(cost);
    } catch (error) {
      console.error("Error creating cost:", error);
      res.status(500).json({ message: "Failed to create cost" });
    }
  });

  app.delete("/api/projects/:projectId/costs/:id", requireAuth, async (req, res) => {
    try {
      await db
        .delete(projectCosts)
        .where(eq(projectCosts.id, req.params.id));
      res.status(200).json({ message: "Cost deleted successfully" });
    } catch (error) {
      console.error("Error deleting cost:", error);
      res.status(500).json({ message: "Failed to delete cost" });
    }
  });

  // Object Storage Routes
  app.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    const userId = (req.user as any)?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Project Attachments
  app.get("/api/project-attachments/:projectId", requireAuth, async (req, res) => {
    try {
      const attachments = await db
        .select()
        .from(projectAttachments)
        .where(eq(projectAttachments.projectId, req.params.projectId))
        .orderBy(desc(projectAttachments.createdAt));
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.post("/api/project-attachments", requireAuth, async (req, res) => {
    try {
      const { projectId, fileName, fileUrl, fileSize } = req.body;
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        fileUrl,
        {
          owner: userId,
          visibility: "public",
        },
      );

      const [attachment] = await db
        .insert(projectAttachments)
        .values({ projectId, fileName, fileUrl: objectPath, fileSize, uploadedBy: userId })
        .returning();
      
      res.status(201).json(attachment);
    } catch (error) {
      console.error("Error creating attachment:", error);
      res.status(500).json({ message: "Failed to create attachment" });
    }
  });

  app.delete("/api/project-attachments/:id", requireAuth, async (req, res) => {
    try {
      await db
        .delete(projectAttachments)
        .where(eq(projectAttachments.id, req.params.id));
      
      res.status(200).json({ message: "Attachment deleted successfully" });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // Register doc routes from controllers
  registerDocsRoutes(app);
  registerDocImportRoutes(app);
  registerDocNameRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
