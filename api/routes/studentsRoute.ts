import { Router } from "express";
import {
  getStudentsHandler,
  getSingleStudentHandler,
  postStudentHandler,
  deleteStudentHandler,
} from "../controllers/studentsController";
import { loginStudentHandler } from "../middlewares/loginStudent";

const router = Router();

router.get("/", getStudentsHandler);
router.post("/", postStudentHandler);
router.get("/:studentId", getSingleStudentHandler);
router.delete("/:studentId", deleteStudentHandler);
router.post("/login", loginStudentHandler);

export default router;
