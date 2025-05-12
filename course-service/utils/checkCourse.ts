import { Response } from "express";
export const checkCourse = (res: Response, courseId: string) => {
  if (!courseId) {
    res.status(404).json({
      message: "Course not found",
    });
    return;
  }
};
