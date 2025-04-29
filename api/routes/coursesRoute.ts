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

const router = Router();

router.get("/", getCoursesHandler);
router.post("/", upload.single("image"), postCourseHandler);
router.post("/tags", postTagHandler);
router.get("/:courseId", getCourseByIDHandler);
router.delete("/:courseId", deleteCourseHandler);
router.patch("/:courseId/tags", putTagHandler);
router.patch("/:courseId", updateCourseHandler);
router.use("/:courseId/lessons", lessonsRouter);

export default router;
