import { Request, RequestHandler, Response } from "express";
import { Professor } from "../models/professorModel";

export const getProfessorsHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const professors = Professor.find({});
    res.json(professors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching professors", error });
  }
};

export const getSingleProfessorHandler: RequestHandler = (
  req: Request,
  res: Response
) => {
  res.send("Get professor route");
};

export const postProfessorHandler: RequestHandler = (
  req: Request,
  res: Response
) => {
  res.send("Post professor route");
};

export const deleteProfessorHandler: RequestHandler = (
  req: Request,
  res: Response
) => {
  res.send("Delete professor route");
};
