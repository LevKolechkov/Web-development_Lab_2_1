import { Request, Response, RequestHandler } from "express";
import { Lesson } from "../models/lessonModel";
import { sendToQueue } from "../utils/rabbitmqSender";
import { v4 as uuidv4 } from "uuid";

export const postLessonHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { title, content, videoUrl, order, course } = req.body;

    if (!title || !course) {
      const badRequestPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 400,
        error: "Title and course are required",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(badRequestPayload)
      );

      res
        .status(400)
        .json({ message: "Title and course are required", requestId });
      return;
    }

    const newLesson = new Lesson({
      title,
      content,
      videoUrl,
      course,
      order,
    });

    const savedLesson = await newLesson.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 201,
      result: savedLesson,
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
    console.error("Error creating lesson:", error);

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
      message: "Error creating lesson",
      requestId,
    });
  }
};

export const getLessonsHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const lessons = await Lesson.find().populate("course");

    if (!lessons || lessons.length === 0) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Lessons not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({ message: "Lessons not found", requestId });
      return;
    }

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: lessons,
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
    console.error("Error fetching lessons:", error);

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
      message: "Error fetching lessons",
      requestId,
    });
  }
};

export const getLessonHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId).populate("course");

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

      res.status(404).json({ message: "Lesson not found", requestId });
      return;
    }

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: lesson,
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
    console.error("Error fetching lesson:", error);

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
      message: "Error fetching lesson",
      requestId,
    });
  }
};

export const updateLessonHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { lessonId } = req.params;
    const { title, content, videoUrl, course, order } = req.body;

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

      res.status(404).json({ message: "Lesson not found", requestId });
      return;
    }

    lesson.title = title || lesson.title;
    lesson.content = content || lesson.content;
    lesson.videoUrl = videoUrl || lesson.videoUrl;
    lesson.course = course || lesson.course;
    lesson.order = order || lesson.order;

    const updatedLesson = await lesson.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: updatedLesson,
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
    console.error("Error updating lesson:", error);

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
      message: "Error updating lesson",
      requestId,
    });
  }
};

export const deleteLessonHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findByIdAndDelete(lessonId);

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

      res.status(404).json({ message: "Lesson not found", requestId });
      return;
    }

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: { message: "Lesson deleted successfully" },
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
    console.error("Error deleting lesson:", error);

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
      message: "Error deleting lesson",
      requestId,
    });
  }
};
