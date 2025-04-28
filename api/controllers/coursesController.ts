import { Request, RequestHandler, Response } from "express";
import { Course } from "../models/courseModel";
import slugify from "slugify";
import path from "path";
import sharp from "sharp";
import { ICourse } from "../models/courseModel";

type Filters = {
  category?: string;
  level?: string;
  price?: { $gte?: string; $lte?: string };
  title?: string | { $regex: RegExp };
};

export const getCoursesHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("Fetching courses from database...");

    const {
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
      category,
      level,
      price,
      title,
    } = req.query;
    // Sorting

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

    // Pagination
    const pageNumber = parseInt(String(page), 10);
    const pageSize = parseInt(String(limit), 10);
    const skip = (pageNumber - 1) * pageSize;

    // Filtration
    const filters: Filters = {};

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

    // Final request
    const courses = await Course.find(filters)
      .sort({ [String(sortBy)]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    console.log(`Successfully fetched ${courses.length} courses`);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error });
  }
};

export const getCourseByIDHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    console.log(`Course not found with ID: ${courseId}`);
    res.status(404).json({ message: "Course not found" });
  }

  res.json(course);
};

export const postCourseHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { ...courseData } = req.body;

    const missingField = Object.keys(courseData).find(
      (key) => !courseData[key]
    );

    const watermarkBuffer = await sharp("assets/uploads/watermark.png")
      .resize(100)
      .toBuffer();

    if (missingField) {
      res.status(400).json({
        message: `${missingField} is missing`,
      });
    }

    const imagePath = req.file
      ? path.join(req.file.destination, req.file.filename)
      : "assets/uploads/courseDefaultImage";

    if (req.file) {
      const watermarkedPath = path.join(
        req.file.destination,
        "watermarked-" + req.file.filename
      );

      await sharp(imagePath)
        .composite([
          {
            input: watermarkBuffer,
            gravity: "southeast",
            blend: "overlay",
          },
        ])
        .jpeg({ quality: 70 })
        .toFile(watermarkedPath);
    }

    const newCourse = new Course({
      title: courseData.title,
      slug: slugify(courseData.title, { lower: true }),
      description: courseData.description,
      price: courseData.price,
      image: imagePath,
      category: courseData.category,
      level: courseData.level,
      published: courseData.published,
      author: `${courseData.firstName} ${courseData.lastName}`,
    });

    const savedCourse = await newCourse.save();

    const courseResponse = {
      title: savedCourse.title,
      author: savedCourse.author,
      status: "saved",
    };

    res.status(201).json(courseResponse);
  } catch (error) {
    console.error("Error creating course:", error);

    res.status(500).json({
      message: "Error creating course",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteCourseHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;

    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      console.log(`Course not found with ID: ${courseId}`);
      res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error creating course:", error);

    res.status(500).json({
      message: "Error creating course",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateCourseHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;
    const updatedData: Partial<ICourse> = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    course.set(updatedData);

    await course.save();

    res.status(200).json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({
      message: "Error updating course",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
