import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User } from "@shared/schema";

export function setupAuth() {
  // Local Strategy for email/password authentication
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email: string, password: string, done) => {
    try {
      // Check if email is from @cyberbay.tech domain
      if (!email.endsWith("@cyberbay.tech")) {
        return done(null, false, { message: "Access denied. Only @cyberbay.tech emails are allowed." });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: "Invalid email or password." });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return done(null, false, { message: "Invalid email or password." });
      }
      
      // Update last login
      const updatedUser = await storage.updateUserLastLogin(user.id);
      
      return done(null, updatedUser);
    } catch (error) {
      console.error("Error in local authentication strategy:", error);
      return done(error, false);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

// Middleware to check if user is authenticated
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Helper functions for password operations
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function validatePassword(password: string): Promise<{ isValid: boolean; message?: string }> {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter, one lowercase letter, and one number." };
  }
  return { isValid: true };
}

export function validateEmail(email: string): { isValid: boolean; message?: string } {
  if (!email.endsWith("@cyberbay.tech")) {
    return { isValid: false, message: "Only @cyberbay.tech email addresses are allowed." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address." };
  }
  return { isValid: true };
}

// Middleware to check Cyberbay domain
export function requireCyberbayDomain(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user?.email?.endsWith("@cyberbay.tech")) {
    return next();
  }
  res.status(403).json({ message: "Access denied. Only @cyberbay.tech emails are allowed." });
}