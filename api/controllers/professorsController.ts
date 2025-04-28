import { Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { IProfessor, Professor } from "../models/professorModel";
import { JWT_SECRET } from "../app";
import jwt from "jsonwebtoken";
import { extractUserData } from "../utils/extractUserData";

export const getProfessorsHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("Fetching professors from database...");

    const professors = await Professor.find({});
    console.log(`Successfully fetched ${professors.length} professors`);
    res.json(professors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching professors", error });
  }
};

export const getSingleProfessorHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { professorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(professorId)) {
    res.status(400).json({ message: "Invalid professor ID format" });
  }

  const professor = await Professor.findById(professorId);

  if (!professor) {
    console.log(`Professor not found with ID: ${professorId}`);
    res.status(404).json({ message: "Professor not found" });
  }

  res.json(professor);
};

export const postProfessorHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { isValid, data, message } = extractUserData(req.body as IProfessor);

    if (!isValid || !data) {
      res.status(400).json({ message });
      return;
    }

    const { firstName, lastName, login, password } = data;

    const existingProfessor = await Professor.findOne({ login });
    if (existingProfessor) {
      res.status(409).json({
        message: "Professor with this login already exists",
      });
    }

    const hashedPassword = hashSync(password, genSaltSync(10));

    const newProfessor = new Professor({
      firstName,
      lastName,
      login,
      password: hashedPassword,
    });

    const savedProfessor = await newProfessor.save();

    const professorResponse = {
      _id: savedProfessor._id,
      firstName: savedProfessor.firstName,
      lastName: savedProfessor.lastName,
      login: savedProfessor.login,
    };

    res.status(201).json(professorResponse);
  } catch (error) {
    console.error("Error creating professor:", error);

    res.status(500).json({
      message: "Error creating professor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteProfessorHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { professorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(professorId)) {
      res.status(400).json({
        message: "Invalid professor ID format",
      });
    }

    const deletedProfessor = await Professor.findByIdAndDelete(professorId);

    if (!deletedProfessor) {
      console.log(`Professor not found with ID: ${professorId}`);
      res.status(404).json({
        message: "Professor not found",
      });
    }

    res.status(200).json({
      message: "Professor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting professor:", error);

    res.status(500).json({
      message: "Error deleting professor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const authorisedProfessorHandler: RequestHandler = async (
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

    res.json({ message: "Welcome, professor!", userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token", error });
  }
};
