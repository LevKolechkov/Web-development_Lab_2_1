import { NextFunction, Request, RequestHandler, Response } from "express";
import { compareSync } from "bcrypt-ts";
import generateToken from "../utils/generateJWT";
import { Student } from "../models/studentModel";

export const loginStudentHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { login, password } = req.body;

  if (!login || !password) {
    res.status(400).json({ message: "Login and password are required" });
  }

  const student = await Student.findOne({ login });

  if (!student) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  const isPasswordValid = compareSync(password, student.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: "Invalid credentials" });
  }

  try {
    const token = generateToken(student._id, student.role);
    req.body = token;
    next();
  } catch (error) {
    console.error("Token generation failed:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
