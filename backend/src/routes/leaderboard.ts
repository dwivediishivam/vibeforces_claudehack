import { Router } from "express";
import { asyncHandler } from "../utils/http";
import {
  getContestLeaderboard,
  getPracticeLeaderboard,
} from "../services/leaderboard";

const router = Router();

router.get(
  "/practice",
  asyncHandler(async (_req, res) => {
    res.json({ leaderboard: await getPracticeLeaderboard() });
  }),
);

router.get(
  "/contest/:id",
  asyncHandler(async (req, res) => {
    res.json({ leaderboard: await getContestLeaderboard(String(req.params.id)) });
  }),
);

export default router;
