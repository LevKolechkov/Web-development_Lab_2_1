import { Request, RequestHandler, Response } from "express";
import { compareSync } from "bcrypt-ts";
import generateToken from "../utils/generateJWT";
import { Professor } from "../models/professorModel";

export const loginProfessorHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { login, password } = req.body;

  if (!login || !password) {
    res.status(400).json({ message: "Login and password are required" });
  }

  const professor = await Professor.findOne({ login });

  if (!professor) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  const isPasswordValid = compareSync(password, professor.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: "Invalid credentials" });
  }

  try {
    const token = generateToken(professor._id);
    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Token generation failed:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
