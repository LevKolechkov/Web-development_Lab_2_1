import { Request, RequestHandler, Response } from "express";
import { compareSync } from "bcrypt-ts";
import generateToken from "../utils/generateJWT";
import { Student } from "../models/studentModel";

export const loginStudentHandler: RequestHandler = async (
  req: Request,
  res: Response
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
    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Token generation failed:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
