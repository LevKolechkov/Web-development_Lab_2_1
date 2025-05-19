import { Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { Student } from "../models/studentModel";
import { IStudent } from "../interfaces/IStudent";
import { JWT_SECRET } from "../app";
import jwt from "jsonwebtoken";
import { extractUserData } from "../utils/extractUserData";
import { sendToQueue } from "../utils/rabbitmqSender";
import { v4 as uuidv4 } from "uuid";

export const getStudentsHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    console.log("Fetching students from database...");

    const students = await Student.find({});
    console.log(`Successfully fetched ${students.length} students`);

    const successPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: students,
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
    console.error("Error fetching students:", error);

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
      message: "Error occurred while fetching students",
      requestId,
    });
  }
};

export const getSingleStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  const { studentId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 400,
        error: "Invalid student ID format",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(400).json({ message: "Invalid student ID format", requestId });
      return;
    }

    const student = await Student.findById(studentId);

    if (!student) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Student not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(404).json({ message: "Student not found", requestId });
      return;
    }

    const successPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: student,
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
    console.error("Error fetching student:", error);

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
      message: "Error occurred while fetching student",
      requestId,
    });
  }
};

export const postStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { isValid, data, message } = extractUserData(req.body as IStudent);

    if (!isValid || !data) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 400,
        error: message || "Invalid student data",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(400).json({ message: errorPayload.error, requestId });
      return;
    }

    const { firstName, lastName, login, password, role } = data;

    const existingStudent = await Student.findOne({ login });
    if (existingStudent) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 409,
        error: "Student with this login already exists",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(409).json({ message: errorPayload.error, requestId });
      return;
    }

    const hashedPassword = hashSync(password, genSaltSync(10));

    const newStudent = new Student({
      firstName,
      lastName,
      login,
      password: hashedPassword,
      role,
    });

    const savedStudent = await newStudent.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 201,
      result: JSON.stringify({
        _id: savedStudent._id,
        firstName: savedStudent.firstName,
        lastName: savedStudent.lastName,
        login: savedStudent.login,
      }),
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Response is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error creating student:", error);

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
      message: "Error creating student",
      requestId,
    });
  }
};

export const deleteStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 400,
        error: "Invalid student ID format",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(400).json({ message: errorPayload.error, requestId });
      return;
    }

    const deletedStudent = await Student.findByIdAndDelete(studentId);

    if (!deletedStudent) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Student not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(404).json({ message: errorPayload.error, requestId });
      return;
    }

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: deletedStudent._id,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Response is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error deleting student:", error);

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
      message: "Error deleting student",
      requestId,
    });
  }
};

export const authorisedStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const token = req.body.token;

    if (!token) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 401,
        error: "Authorization token required",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(401).json({ message: errorPayload.error, requestId });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: decoded.userId,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Response is being processed",
      requestId,
    });
  } catch (error) {
    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 401,
      error:
        error instanceof Error ? error.message : "Unauthorized: Invalid token",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(401).json({
      message: "Unauthorized: Invalid token",
      requestId,
    });
  }
};

export const toggleFavoriteCourse: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { studentId } = req.params;
  const { courseId } = req.body;
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Student not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(404).json({ message: errorPayload.error, requestId });
      return;
    }

    const alreadyFavorite = student.favoriteCourses.includes(courseId);

    if (alreadyFavorite) {
      student.favoriteCourses = student.favoriteCourses.filter(
        (id) => id !== courseId
      );
    } else {
      student.favoriteCourses.push(courseId);
    }

    await student.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: student.favoriteCourses,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Response is being processed",
      requestId,
    });
  } catch (error) {
    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error toggling favorite course",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Error toggling favorite course",
      requestId,
    });
  }
};
