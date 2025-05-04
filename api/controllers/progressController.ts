import { Request, RequestHandler, Response } from "express";
import { Progress } from "../models/progress";
import { Lesson } from "../models/lessonModel";
import { checkCourse } from "../utils/checkCourse";
import { checkStudent } from "../utils/checkStudent";

export const getProgressHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentId, courseId } = req.body;

    const progress = await Progress.findOne({ studentId, courseId });

    checkCourse(res, courseId);
    checkStudent(res, studentId);

    if (!progress) {
      res.status(404).json({
        message: "Progress not found for this student and course",
      });
      return;
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error("Error fetching progress:");
    res.status(500).json({
      message: "Error fetching progress",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const postProgressHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentId, courseId } = req.body;

    checkCourse(res, courseId);
    checkStudent(res, studentId);

    const existingProgresss = await Progress.findOne({ studentId, courseId });

    if (existingProgresss) {
      res.status(400).json({
        message: "Progress of this course for this student already exists",
      });
      return;
    }

    const newProgress = new Progress({
      studentId,
      courseId,
    });

    const savedProgress = await newProgress.save();

    res.status(201).json(savedProgress);
  } catch (error) {
    console.error("Error creating progress:", error);

    res.status(500).json({
      message: "Error creating progress",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateProgressHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentId, lessonId, courseId } = req.body;

    checkCourse(res, courseId);
    checkStudent(res, studentId);

    const progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      res.status(404).json({
        message: "Progress not found for this student and course",
      });
      return;
    }

    const existingLesson = progress.completedLessons.includes(lessonId);

    if (!existingLesson) {
      progress.completedLessons.push(lessonId);
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedLessons = progress.completedLessons.length;
    const progressPercent =
      Math.round((completedLessons / totalLessons) * 100 * 100) / 100;

    progress.progressPercent = progressPercent;

    const updatedProgress = await progress.save();

    res.status(200).json(updatedProgress);
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      message: "Error updating progress",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const countStudentsInCourse: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;

    checkCourse(res, courseId);

    const studentsCount = await Progress.distinct("studentId", {
      courseId,
    }).countDocuments();

    res.status(200).json({ studentsCount });
  } catch (error) {
    console.error("Error counting students in course:", error);
    res.status(500).json({
      message: "Error counting students in course",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteCourseProgressHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentId, courseId } = req.body;

    checkCourse(res, courseId);
    checkStudent(res, studentId);

    const progress = await Progress.findOneAndDelete({ studentId, courseId });

    if (!progress) {
      res.status(404).json({
        message: "Progress not found for this student and course",
      });
      return;
    }

    res.status(200).json({
      message: "Course progress canceled successfully",
    });
  } catch (error) {
    console.error("Error canceling course progress:", error);
    res.status(500).json({
      message: "Error canceling course progress",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const cancelLessonHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentId, lessonId, courseId } = req.body;

    const progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      res.status(404).json({
        message: "Progress not found for this student and course",
      });
      return;
    }

    const lessonIndex = progress.completedLessons.indexOf(lessonId);

    if (lessonIndex === -1) {
      res.status(400).json({ message: "Lesson has not been completed yet" });
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

    res.status(200).json(updatedProgress);

    res.status(200).json("Lesson progress canceled successfully");
  } catch (error) {
    console.error("Error removing lesson from progress:", error);
    res.status(500).json({
      message: "Error removing lesson from progress",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
