import { Request, Response, NextFunction } from "express";

export const sortCourses = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { sortBy = "createdAt", order = "desc" } = req.query;

  const validSortFields = ["createdAt", "price", "title"];
  const validOrder = ["asc", "desc"];

  if (!validSortFields.includes(sortBy as string)) {
    res.status(400).json({ message: "Invalid sort field" });
    return;
  }

  if (!validOrder.includes(order as string)) {
    res.status(400).json({ message: "Invalid order direction" });
    return;
  }

  const sortOrder = order === "asc" ? 1 : -1;
  req.body.sortOrder = sortOrder;
  next();
};
