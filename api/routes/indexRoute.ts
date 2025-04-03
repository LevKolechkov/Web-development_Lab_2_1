import { Router } from "express";
import rootRouter from "./rootRoute";
import usersRouter from "./usersRouter";

const router: Router = Router();

router.use("/", rootRouter);
router.use("/users", usersRouter);

export default router;
