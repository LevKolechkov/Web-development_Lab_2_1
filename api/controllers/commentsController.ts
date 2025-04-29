import { Request, Response, RequestHandler } from "express";
import { Comment } from "../models/commentModel";
import { Lesson } from "../models/lessonModel";
import { Student } from "../models/studentModel";

export const postCommentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { lessonId } = req.params;
    const { studentId, text } = req.body;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      res.status(404).json({ message: "Lesson not found" });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const newComment = new Comment({
      student: studentId,
      lesson: lessonId,
      text,
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      message: "Error creating comment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getCommentsHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { lessonId } = req.params;

    const comments = await Comment.find({ lesson: lessonId }).populate(
      "student"
    );

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      message: "Error fetching comments",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateCommentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    comment.text = text || comment.text;

    const updatedComment = await comment.save();
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Error updating comment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteCommentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Error updating comment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
