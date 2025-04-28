import { NextFunction, Request, RequestHandler, Response } from "express";
import { compareSync } from "bcrypt-ts";
import generateToken from "../utils/generateJWT";
import { Student } from "../models/studentModel";
import { Professor } from "../models/professorModel";

type UserModel = typeof Professor | typeof Student;

const loginHandler = (User: UserModel): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(400).json({ message: "Login and password are required" });
      return;
    }

    let user;

    try {
      switch (User) {
        case Professor:
          user = await Professor.findOne({ login });
          break;
        case Student:
          user = await Student.findOne({ login });
          break;
        default:
          break;
      }

      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const isPasswordValid = compareSync(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const token = generateToken(user._id, user.role);
      console.log(`[server] Generated token: ${token}`);
      req.body.token = token;

      next();
    } catch (error) {
      console.error("Token generation failed:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  };
};

export const loginProfessorHandler = loginHandler(Professor);
export const loginStudentHandler = loginHandler(Student);
