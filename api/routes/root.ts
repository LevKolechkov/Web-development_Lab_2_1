import { Router } from "express";
import { getRootHandler } from "../controllers/root";

const router: Router = Router();

router.get("/", getRootHandler);

export default router;
