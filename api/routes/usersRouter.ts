import { Router } from "express";
import studentsRouter from "./studentsRoute";
import professorsRouter from "./professorsRoute";

const router: Router = Router();

router.use("/students", studentsRouter);
router.use("/professors", professorsRouter);

export default router;
