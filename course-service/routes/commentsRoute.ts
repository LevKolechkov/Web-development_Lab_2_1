import { Router } from "express";
import {
  deleteCommentHandler,
  getCommentsHandler,
  postCommentHandler,
  updateCommentHandler,
} from "../controllers/commentsController";

const router = Router();

router.get("/", getCommentsHandler);
router.post("/", postCommentHandler);
router.patch("/:commentId", updateCommentHandler);
router.delete("/:commentId", deleteCommentHandler);

export default router;
