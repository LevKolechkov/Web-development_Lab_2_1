import { Request, Response, RequestHandler } from "express";
import { Lesson } from "../models/lessonModel";

export const postLessonHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { title, content, videoUrl, order, course } = req.body;

    if (!title || !course) {
      res.status(400).json({ message: "Title and course are required" });
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
    res.status(201).json(savedLesson);
  } catch (error) {
    console.error("Error creating lesson:", error);

    res.status(500).json({
      message: "Error creating lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getLessonsHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const lessons = await Lesson.find().populate("course");

    if (!lessons) {
      res.status(404).json({ message: "Lesson not found" });
      return;
    }

    res.status(200).json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({
      message: "Error fetching lessons",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getLessonHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId).populate("course");

    if (!lesson) {
      res.status(404).json({ message: "Lesson not found" });
      return;
    }

    res.status(200).json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({
      message: "Error fetching lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateLessonHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { lessonId } = req.params;
    const { title, content, videoUrl, course, order } = req.body;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      res.status(404).json({ message: "Lesson not found" });
      return;
    }

    lesson.title = title || lesson.title;
    lesson.content = content || lesson.content;
    lesson.videoUrl = videoUrl || lesson.videoUrl;
    lesson.course = course || lesson.course;
    lesson.order = order || lesson.order;

    const updatedLesson = await lesson.save();

    res.status(200).json(updatedLesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({
      message: "Error updating lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteLessonHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findByIdAndDelete(lessonId);

    if (!lesson) {
      res.status(404).json({ message: "Lesson not found" });
      return;
    }

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({
      message: "Error deleting lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
