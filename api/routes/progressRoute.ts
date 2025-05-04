import { Router } from "express";
import {
  deleteCourseProgressHandler,
  getProgressHandler,
  postProgressHandler,
  updateProgressHandler,
  cancelLessonHandler,
} from "../controllers/progressController";

const router = Router();

router.get("/", getProgressHandler);
router.post("/", postProgressHandler);
router.patch("/", updateProgressHandler);
router.delete("/", deleteCourseProgressHandler);
router.patch("/cancel-lesson", cancelLessonHandler);

export default router;
