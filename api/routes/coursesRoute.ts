import { Router } from "express";

import {
  getCoursesHandler,
  postCourseHandler,
  getCourseHandler,
  deleteCourseHandler,
} from "../controllers/coursesController";

const router = Router();

router.get("/", getCoursesHandler);
router.post("/", postCourseHandler);
router.get("/:courseId", getCourseHandler);
router.delete("/:courseId", deleteCourseHandler);

export default router;
