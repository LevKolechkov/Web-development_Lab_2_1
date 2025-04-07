import { Router } from "express";
import rootRouter from "./rootRoute";
import usersRouter from "./usersRouter";
import coursesRouter from "./coursesRoute";

const router: Router = Router();

router.use("/", rootRouter);
router.use("/users", usersRouter);
router.use("/courses", coursesRouter);

export default router;
