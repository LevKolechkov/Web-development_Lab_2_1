import { Router } from "express";
import {
  getProfessorsHandler,
  getSingleProfessorHandler,
  postProfessorHandler,
  deleteProfessorHandler,
} from "../controllers/professorsController";
import { loginProfessorHandler } from "../middlewares/loginProfessor";

const router = Router();

router.get("/", getProfessorsHandler);
router.post("/", postProfessorHandler);
router.get("/:professorId", getSingleProfessorHandler);
router.delete("/:professorId", deleteProfessorHandler);
router.post("/login", loginProfessorHandler);

export default router;
