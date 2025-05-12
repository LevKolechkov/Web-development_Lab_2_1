import { Request, Response, NextFunction } from "express";

type Filters = {
  category?: string;
  level?: string;
  price?: { $gte?: string; $lte?: string };
  title?: string | { $regex: RegExp };
};

export const filtrateCourses = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const filters: Filters = {};
  const { category, level, price, title } = req.query;
  if (category) {
    filters.category = String(category);
  }

  if (level) {
    filters.level = String(level);
  }

  if (price && typeof price === "string") {
    if (typeof price === "string") {
      const [minPrice, maxPrice] = price.split("-");
      if (minPrice && maxPrice) {
        filters.price = { $gte: minPrice, $lte: maxPrice };
      } else if (minPrice) {
        filters.price = { $gte: minPrice };
      } else if (maxPrice) {
        filters.price = { $lte: maxPrice };
      }
    }
  }

  if (title && typeof title === "string") {
    filters.title = { $regex: new RegExp(title, "i") };
  }
  req.body.filters = filters;
  next();
};
