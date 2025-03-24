import { Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";
import { Student } from "../models/studentModel";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateJWT";
import { JWT_SECRET } from "../app";

export const loginStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { login, password } = req.body;

    const student = await Student.findOne({ login });

    if (!student) {
      throw new Error("Student not found");
    }

    if (!student) {
      throw new Error();
    }

    const isPasswordValid = compareSync(password, student.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const token = generateToken(student._id);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const authorisedStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) throw new Error();

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    res.json({ message: "Welcome, student!", userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export const getStudentsHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("Fetching students from MongoDB...");

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
    const { firstName, lastName, login, password } = req.body;

    if (!firstName || !lastName || !login || !password) {
      res.status(400).json({
        message:
          "All fields (firstName, lastName, login, password) are required",
      });
    }

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
