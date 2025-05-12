import { Request, Response, NextFunction } from "express";

export const paginateCourses = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(String(page), 10);
  const pageSize = parseInt(String(limit), 10);
  const skip = (pageNumber - 1) * pageSize;
  req.body.skip = skip;
  req.body.pageSize = pageSize;
  next();
};
