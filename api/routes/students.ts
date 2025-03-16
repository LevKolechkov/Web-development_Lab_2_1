import { Router } from "express";

import {
  getStudentsHandler,
  getSingleStudentHandler,
  postStudentHandler,
  deleteStudentHandler,
} from "../controllers/students";

const router = Router();

router.get("/", getStudentsHandler);
router.post("/", postStudentHandler);
router.get("/:studentId", getSingleStudentHandler);
router.delete("/:studentId", deleteStudentHandler);

export default router;
