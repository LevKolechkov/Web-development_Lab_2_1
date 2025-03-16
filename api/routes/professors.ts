import { Router } from "express";

import {
  getProfessorsHandler,
  getSingleProfessorHandler,
  postProfessorHandler,
  deleteProfessorHandler,
} from "../controllers/professors";

const router = Router();

router.get("/", getProfessorsHandler);
router.post("/", postProfessorHandler);
router.get("/:professorId", getSingleProfessorHandler);
router.delete("/:professorId", deleteProfessorHandler);

export default router;
