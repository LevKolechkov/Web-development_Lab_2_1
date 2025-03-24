import { Router } from "express";

import {
  getProfessorsHandler,
  getSingleProfessorHandler,
  postProfessorHandler,
  deleteProfessorHandler,
  loginProfessorHandler,
  authorisedProfessorHandler,
} from "../controllers/professorsController";

const router = Router();

router.get("/", getProfessorsHandler);
router.post("/", postProfessorHandler);
router.get("/:professorId", getSingleProfessorHandler);
router.delete("/:professorId", deleteProfessorHandler);
router.post("/login", loginProfessorHandler);
router.get("/auth/check", authorisedProfessorHandler);

export default router;
