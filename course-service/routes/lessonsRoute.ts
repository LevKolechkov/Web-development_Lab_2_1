import { Router } from "express";
import {
  deleteLessonHandler,
  getLessonHandler,
  getLessonsHandler,
  postLessonHandler,
} from "../controllers/lessonsController";
import {
  deleteCommentHandler,
  getCommentsHandler,
  postCommentHandler,
  updateCommentHandler,
} from "../controllers/commentsController";
import { updateCourseHandler } from "../controllers/coursesController";

const router = Router();

router.get("/", getLessonsHandler);
router.get("/:lessonId", getLessonHandler);
router.post("/", postLessonHandler);
router.patch("/:lessonId", updateCourseHandler);
router.delete("/:lessonId", deleteLessonHandler);

router.get("/:lessonId/comments", getCommentsHandler);
router.post("/:lessonId/comments", postCommentHandler);
router.patch("/:lessonId/comments", updateCommentHandler);
router.delete("/:lessonId/comments", deleteCommentHandler);

export default router;
