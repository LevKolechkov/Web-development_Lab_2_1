import { Request, Response, NextFunction } from "express";

export const extractCourseId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body.courseId = req.params.courseId;
  next();
};
