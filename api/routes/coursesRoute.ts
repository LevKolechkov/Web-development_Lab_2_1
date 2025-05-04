import { Router } from "express";
import {
  getCoursesHandler,
  postCourseHandler,
  getCourseByIDHandler,
  deleteCourseHandler,
  updateCourseHandler,
} from "../controllers/coursesController";
import upload from "../utils/upload";
import { postTagHandler, putTagHandler } from "../controllers/tagController";
import lessonsRouter from "./lessonsRoute";
import progressRouter from "./progressRoute";
import { extractCourseId } from "../middlewares/extractCourseId";

const router = Router();

router.get("/", getCoursesHandler);
router.post("/", upload.single("image"), postCourseHandler);
router.post("/tags", postTagHandler);
router.get("/:courseId", getCourseByIDHandler);
router.delete("/:courseId", deleteCourseHandler);
router.patch("/:courseId/tags", putTagHandler);
router.patch("/:courseId", updateCourseHandler);

router.use("/:courseId/lessons", lessonsRouter);

router.use("/:courseId/progress", extractCourseId, progressRouter);

export default router;
