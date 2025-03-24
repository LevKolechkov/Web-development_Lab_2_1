import { Router } from "express";
import studentsRouter from "./studentsRoute";
import professorsRouter from "./professorsRoute";
import rootRouter from "./rootRoute";

const router: Router = Router();

router.use("/", rootRouter);
router.use("/students", studentsRouter);
router.use("/professors", professorsRouter);

export default router;
