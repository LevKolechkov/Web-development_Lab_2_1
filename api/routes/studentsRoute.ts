import { Router } from "express";
import {
  getStudentsHandler,
  getSingleStudentHandler,
  postStudentHandler,
  deleteStudentHandler,
  authorisedStudentHandler,
  toggleFavoriteCourse,
} from "../controllers/studentsController";
import { loginStudentHandler } from "../middlewares/loginStudent";

const router = Router();

router.get("/", getStudentsHandler);
router.post("/", postStudentHandler);
router.get("/:studentId", getSingleStudentHandler);
router.delete("/:studentId", deleteStudentHandler);
router.put("/:studentId/favorites/", toggleFavoriteCourse);
router.post("/login", loginStudentHandler, authorisedStudentHandler);

export default router;
