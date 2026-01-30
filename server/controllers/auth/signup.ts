import type { Request, Response } from "express";
import { storage } from "../../storage";
import { hashPassword, validatePassword, validateEmail } from "../../auth";

export async function signupHandler(req: Request, res: Response) {
  try {
    const { email, password, displayName } = req.body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const passwordValidation = await validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      displayName
    });

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
}
