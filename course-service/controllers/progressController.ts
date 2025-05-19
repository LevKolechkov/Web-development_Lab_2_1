import { Request, RequestHandler, Response } from "express";
import { Progress } from "../models/progress";
import { Lesson } from "../models/lessonModel";
import { checkCourse } from "../utils/checkCourse";
import { checkStudent } from "../utils/checkStudent";
import { sendToQueue } from "../utils/rabbitmqSender";
import { v4 as uuidv4 } from "uuid";

export const getProgressHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { studentId, courseId } = req.body;

    await checkCourse(res, courseId);
    await checkStudent(res, studentId);

    const progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Progress not found for this student and course",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({
        message: "Progress not found for this student and course",
        requestId,
      });
      return;
    }

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: progress,
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
    console.error("Error fetching progress:", error);

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
      message: "Error fetching progress",
      requestId,
    });
  }
};

export const postProgressHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { studentId, courseId } = req.body;

    await checkCourse(res, courseId);
    await checkStudent(res, studentId);

    const existingProgress = await Progress.findOne({ studentId, courseId });

    if (existingProgress) {
      const duplicatePayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 400,
        error: "Progress of this course for this student already exists",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(duplicatePayload)
      );

      res.status(400).json({
        message: "Progress already exists",
        requestId,
      });
      return;
    }

    const newProgress = new Progress({
      studentId,
      courseId,
    });

    const savedProgress = await newProgress.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 201,
      result: savedProgress,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Progress created and response is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error creating progress:", error);

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
      message: "Error creating progress",
      requestId,
    });
  }
};

export const updateProgressHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { studentId, lessonId, courseId } = req.body;

    await checkCourse(res, courseId);
    await checkStudent(res, studentId);

    const progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Progress not found for this student and course",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({
        message: "Progress not found",
        requestId,
      });
      return;
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedLessons = progress.completedLessons.length;

    progress.progressPercent =
      Math.round((completedLessons / totalLessons) * 100 * 100) / 100;

    const updatedProgress = await progress.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: updatedProgress,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Progress updated and response is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error updating progress:", error);

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
      message: "Error updating progress",
      requestId,
    });
  }
};

export const countStudentsInCourse: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { courseId } = req.params;

    await checkCourse(res, courseId);

    const studentsCount = await Progress.countDocuments({ courseId });

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: { studentsCount },
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Student count is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error counting students in course:", error);

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
      message: "Error occurred while counting students",
      requestId,
    });
  }
};

export const deleteCourseProgressHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { studentId, courseId } = req.body;

    await checkCourse(res, courseId);
    await checkStudent(res, studentId);

    const progress = await Progress.findOneAndDelete({ studentId, courseId });

    if (!progress) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Progress not found for this student and course",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({
        message: "Progress not found for this student and course",
        requestId,
      });
      return;
    }

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: { message: "Course progress canceled successfully" },
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Progress deletion is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error canceling course progress:", error);

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
      message: "Error canceling course progress",
      requestId,
    });
  }
};

export const cancelLessonHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { studentId, lessonId, courseId } = req.body;

    const progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Progress not found for this student and course",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({
        message: "Progress not found for this student and course",
        requestId,
      });
      return;
    }

    const lessonIndex = progress.completedLessons.indexOf(lessonId);

    if (lessonIndex === -1) {
      const notCompletedPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 400,
        error: "Lesson has not been completed yet",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notCompletedPayload)
      );

      res.status(400).json({
        message: "Lesson has not been completed yet",
        requestId,
      });
      return;
    }

    progress.completedLessons = progress.completedLessons.filter(
      (id) => id !== lessonId
    );

    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedLessons = progress.completedLessons.length;
    const progressPercent =
      Math.round((completedLessons / totalLessons) * 100 * 100) / 100;

    progress.progressPercent = progressPercent;

    const updatedProgress = await progress.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: updatedProgress,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Lesson progress cancellation is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error removing lesson from progress:", error);

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
      message: "Error removing lesson from progress",
      requestId,
    });
  }
};
