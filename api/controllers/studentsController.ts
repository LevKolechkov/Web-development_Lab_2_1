import { Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { IStudent, Student } from "../models/studentModel";
import { JWT_SECRET } from "../app";
import jwt from "jsonwebtoken";
import { extractUserData } from "../utils/extractUserData";

export const getStudentsHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("Fetching students from database...");

    const students = await Student.find({});
    console.log(`Successfully fetched ${students.length} students`);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};

export const getSingleStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    res.status(400).json({ message: "Invalid student ID format" });
  }

  const student = await Student.findById(studentId);

  if (!student) {
    console.log(`Student not found with ID: ${studentId}`);
    res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
};

export const postStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { isValid, data, message } = extractUserData(req.body as IStudent);

    if (!isValid || !data) {
      res.status(400).json({ message });
      return;
    }

    const { firstName, lastName, login, password, role } = data;

    const existingStudent = await Student.findOne({ login });
    if (existingStudent) {
      res.status(409).json({
        message: "Student with this login already exists",
      });
    }

    const hashedPassword = hashSync(password, genSaltSync(10));

    const newStudent = new Student({
      firstName,
      lastName,
      login,
      password: hashedPassword,
      role: role,
    });

    const savedStudent = await newStudent.save();

    const studentResponse = {
      _id: savedStudent._id,
      firstName: savedStudent.firstName,
      lastName: savedStudent.lastName,
      login: savedStudent.login,
    };

    res.status(201).json(studentResponse);
  } catch (error) {
    console.error("Error creating student:", error);

    res.status(500).json({
      message: "Error creating student",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400).json({
        message: "Invalid student ID format",
      });
    }

    const deletedStudent = await Student.findByIdAndDelete(studentId);

    if (!deletedStudent) {
      console.log(`Student not found with ID: ${studentId}`);
      res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);

    res.status(500).json({
      message: "Error deleting student",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const authorisedStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const token = req.body;

    if (!token) {
      res.status(401).json({ message: "Authorization token required" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    res.json({ message: "Welcome, student!", userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token", error });
  }
};

export const toggleFavoriteCourse: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { studentId } = req.params;
  const courseId = req.body.courseId;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      res.status(404).json({ message: "Student not found" });
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
    res.status(200).json({
      message: "Successfully toggled favorite course",
    });
  } catch (error) {
    console.error("Error toggling favorite course:", error);

    res.status(500).json({
      message: "Error toggling favorite course:",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
