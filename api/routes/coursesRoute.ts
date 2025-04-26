import { Router } from "express";
import {
  getCoursesHandler,
  postCourseHandler,
  getCourseByIDHandler,
  deleteCourseHandler,
} from "../controllers/coursesController";
import upload from "../utils/upload";
import { postTagHandler, putTagHandler } from "../controllers/tagController";

const router = Router();

router.get("/", getCoursesHandler);
router.post("/", upload.single("image"), postCourseHandler);
router.post("/tags", postTagHandler);
router.get("/:courseId", getCourseByIDHandler);
router.delete("/:courseId", deleteCourseHandler);
router.put("/:courseId/tags", putTagHandler);

export default router;
