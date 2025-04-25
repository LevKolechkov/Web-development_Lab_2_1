import { Router } from "express";
import {
  getCoursesHandler,
  postCourseHandler,
  getCourseByIDHandler,
  deleteCourseHandler,
} from "../controllers/coursesController";
import upload from "../utils/upload";

const router = Router();

router.get("/", getCoursesHandler);
router.post("/", upload.single("image"), postCourseHandler);
router.get("/:courseId", getCourseByIDHandler);
router.delete("/:courseId", deleteCourseHandler);

export default router;
