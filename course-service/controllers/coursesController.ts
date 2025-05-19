import { Request, RequestHandler, Response } from "express";
import { Course } from "../models/courseModel";
import slugify from "slugify";
import path from "path";
import sharp from "sharp";
import { ICourse } from "../interfaces/ICourse";
import { sendToQueue } from "../utils/rabbitmqSender";
import { v4 as uuidv4 } from "uuid";

export const getCoursesHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("Fetching courses from database...");

    const { sortOrder, skip, pageSize, filters } = req.body;

    const { sortBy = "createdAt" } = req.query;

    const courses = await Course.find(filters)
      .sort({ [String(sortBy)]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    console.log(`Successfully fetched ${courses.length} courses`);

    const responsePayload = {
      requestId: req.headers["x-request-id"] || uuidv4(),
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: courses,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );
    console.log("Successfully send response to response-service");

    res.status(202).json({
      message: "Response is being processed",
      requestId: responsePayload.requestId,
    });
  } catch (error) {
    console.error("Caught error in getCoursesHandler:", error);
    const errorPayload = {
      requestId: req.headers["x-request-id"] || null,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error in fetching courses",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Error occurred while fetching courses",
      requestId: errorPayload.requestId,
    });
  }
};

export const getCourseByIDHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Course not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({
        message: "Course not found",
        requestId,
      });
      return;
    }

    const successPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: course,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(successPayload)
    );

    res.status(202).json({
      message: "Response is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error in getCourseByIDHandler:", error);

    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error in fetching course",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Internal server error",
      requestId,
    });
  }
};

export const postCourseHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { ...courseData } = req.body;

    const missingField = Object.keys(courseData).find(
      (key) => !courseData[key]
    );

    const watermarkBuffer = await sharp("assets/uploads/watermark.png")
      .resize(100)
      .toBuffer();

    if (missingField) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 400,
        error: `${missingField} is missing`,
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(400).json({
        message: `${missingField} is missing`,
        requestId,
      });
      return;
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

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 201,
      result: savedCourse,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Course is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error creating course:", error);

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
      message: "Error creating course",
      requestId,
    });
  }
};

export const deleteCourseHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { courseId } = req.params;

    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Course not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(404).json({
        message: "Course not found",
        requestId,
      });
      return;
    }

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: deletedCourse,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Course deletion is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error deleting course:", error);

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
      message: "Error deleting course",
      requestId,
    });
  }
};

export const updateCourseHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { courseId } = req.params;
    const updatedData: Partial<ICourse> = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Course not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({
        message: "Course not found",
        requestId,
      });
      return;
    }

    course.set(updatedData);
    const updatedCourse = await course.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: updatedCourse,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Course update is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error updating course:", error);

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
      message: "Error updating course",
      requestId,
    });
  }
};
