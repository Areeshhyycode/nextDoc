import { Router } from "express";
import { requireAuth } from "../auth";
import {
  signupHandler,
  loginHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  getUserHandler,
  onboardingCompleteHandler,
  onboardingSkipHandler,
} from "../controllers/auth";

const router = Router();

// Auth
router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/logout', logoutHandler);

// Password Reset
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);

// Current User
router.get('/user', getUserHandler);

// Onboarding
router.post('/onboarding/complete', requireAuth, onboardingCompleteHandler);
router.post('/onboarding/skip', requireAuth, onboardingSkipHandler);

export default router;
