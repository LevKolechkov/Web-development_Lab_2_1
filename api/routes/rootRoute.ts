import { Router } from "express";
import { getRootHandler } from "../controllers/rootController";

const router: Router = Router();

router.get("/", getRootHandler);

export default router;
