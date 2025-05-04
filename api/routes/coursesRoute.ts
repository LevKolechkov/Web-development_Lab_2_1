import { Router } from "express";
import {
  getCoursesHandler,
  postCourseHandler,
  getCourseByIDHandler,
  deleteCourseHandler,
  updateCourseHandler,
} from "../controllers/coursesController";
import { countStudentsInCourse } from "../controllers/progressController";
import upload from "../utils/upload";
import { postTagHandler, putTagHandler } from "../controllers/tagController";
import lessonsRouter from "./lessonsRoute";
import progressRouter from "./progressRoute";
import { extractCourseId } from "../middlewares/extractCourseId";
import { sortCourses } from "../middlewares/get-courses/sortCourses";
import { paginateCourses } from "../middlewares/get-courses/paginateCourses";

const router = Router();

router.get("/", sortCourses, paginateCourses, getCoursesHandler);
router.post("/", upload.single("image"), postCourseHandler);
router.post("/tags", postTagHandler);
router.get("/:courseId", getCourseByIDHandler);
router.delete("/:courseId", deleteCourseHandler);
router.patch("/:courseId/tags", putTagHandler);
router.patch("/:courseId", updateCourseHandler);

router.use("/:courseId/lessons", lessonsRouter);

router.get("/:courseId/students/count", countStudentsInCourse);
router.use("/:courseId/progress", extractCourseId, progressRouter);

export default router;
