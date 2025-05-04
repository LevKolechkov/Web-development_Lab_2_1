import { Router } from "express";
import {
  deleteCourseProgressHandler,
  countStudentsInCourse,
  getProgressHandler,
  postProgressHandler,
  updateProgressHandler,
} from "../controllers/progressController";

const router = Router();

router.get("/", getProgressHandler);
router.post("/", postProgressHandler);
router.patch("/", updateProgressHandler);
router.delete("/", deleteCourseProgressHandler);
router.delete("/students/count", countStudentsInCourse);

export default router;
