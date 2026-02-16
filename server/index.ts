import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import { pool } from "./db";

// Run database migrations for enum updates
async function runMigrations() {
  try {
    // Add project_overview to doc_category enum if not exists
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'project_overview' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'doc_category')) THEN
          ALTER TYPE doc_category ADD VALUE 'project_overview';
        END IF;
      END $$;
    `);
    log("Database migrations completed");
  } catch (error) {
    console.error("Migration error:", error);
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy for deployments
app.set('trust proxy', 1);

// Session configuration
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

app.use(sessionMiddleware);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Setup authentication
setupAuth();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Run migrations before starting server
  await runMigrations();

  const server = await registerRoutes(app, sessionMiddleware);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
