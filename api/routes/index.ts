import { Router } from "express";
import studentsRouter from "./students";
import professorsRouter from "./professors";
import rootRouter from "./root";

const router: Router = Router();

router.use("/", rootRouter);
router.use("/students", studentsRouter);
router.use("/professors", professorsRouter);

export default router;
