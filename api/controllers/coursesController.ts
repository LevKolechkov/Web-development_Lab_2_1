import { Request, RequestHandler, Response } from "express";
import { Course } from "../models/courseModel";
import slugify from "slugify";
import path from "path";
import sharp from "sharp";

export const getCoursesHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("Fetching courses from database...");

    const courses = await Course.find({});
    console.log(`Successfully fetched ${courses.length}`);
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

// Проверка req.file
// export const postCourseHandler: RequestHandler = async (
//   req: Request,
//   res: Response
// ) => {
//   const formData = req.body;
//   res.json({
//     file_info: req.file,
//     form_data: formData,
//     status: "Success",
//   });
// };

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
