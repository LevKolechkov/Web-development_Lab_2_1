import { Router } from "express";

import {
  getStudentsHandler,
  getSingleStudentHandler,
  postStudentHandler,
  deleteStudentHandler,
  loginStudentHandler,
  authorisedStudentHandler,
} from "../controllers/studentsController";

const router = Router();

router.get("/", getStudentsHandler);
router.post("/", postStudentHandler);
router.get("/:studentId", getSingleStudentHandler);
router.delete("/:studentId", deleteStudentHandler);
router.post("/login", loginStudentHandler);
router.get("/auth/check", authorisedStudentHandler);

export default router;
