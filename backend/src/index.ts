import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRateLimit } from "./middleware/rateLimit";
import challengesRouter from "./routes/challenges";
import submissionsRouter from "./routes/submissions";
import leaderboardRouter from "./routes/leaderboard";
import contestsRouter from "./routes/contests";
import testsRouter from "./routes/tests";
import adminRouter from "./routes/admin";

const app = express();

app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "8mb" }));
app.use(morgan("dev"));
app.use(apiRateLimit);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "vibeforces-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/challenges", challengesRouter);
app.use("/api/v1/submissions", submissionsRouter);
app.use("/api/v1/leaderboard", leaderboardRouter);
app.use("/api/v1/contests", contestsRouter);
app.use("/api/v1/tests", testsRouter);
app.use("/api/v1/admin", adminRouter);

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(error?.status ?? 500).json({
    error: error?.message ?? "Unexpected server error.",
  });
});

app.listen(env.PORT, () => {
  console.log(`VibeForces API listening on port ${env.PORT}`);
});
