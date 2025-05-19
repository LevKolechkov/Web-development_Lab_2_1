import { Request, Response, RequestHandler } from "express";
import { Comment } from "../models/commentModel";
import { Lesson } from "../models/lessonModel";
import { Student } from "../models/studentModel";
import { sendToQueue } from "../utils/rabbitmqSender";
import { v4 as uuidv4 } from "uuid";

export const postCommentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { lessonId } = req.params;
    const { studentId, text } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Lesson not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({
        message: "Lesson not found",
        requestId,
      });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Student not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({
        message: "Student not found",
        requestId,
      });
      return;
    }

    const newComment = new Comment({
      student: studentId,
      lesson: lessonId,
      text,
    });

    const savedComment = await newComment.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 201,
      result: savedComment,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Comment is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error creating comment:", error);

    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Error creating comment",
      requestId,
    });
  }
};

export const getCommentsHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { lessonId } = req.params;

    const comments = await Comment.find({ lesson: lessonId }).populate(
      "student"
    );

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: comments,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Response is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);

    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Error occurred while fetching comments",
      requestId,
    });
  }
};

export const updateCommentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Comment not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({ message: "Comment not found", requestId });
      return;
    }

    comment.text = text || comment.text;

    const updatedComment = await comment.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: updatedComment,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Response is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error updating comment:", error);

    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Error updating comment",
      requestId,
    });
  }
};

export const deleteCommentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { commentId } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Comment not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({ message: "Comment not found", requestId });
      return;
    }

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: { message: "Comment deleted successfully" },
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Response is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);

    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Error deleting comment",
      requestId,
    });
  }
};
