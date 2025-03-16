import { Request, Response } from "express";

export const getProfessorsHandler = (req: Request, res: Response) => {
  res.send("Get professors route");
};

export const getSingleProfessorHandler = (req: Request, res: Response) => {
  res.send("Get professor route");
};

export const postProfessorHandler = (req: Request, res: Response) => {
  res.send("Post professor route");
};

export const deleteProfessorHandler = (req: Request, res: Response) => {
  res.send("Delete professor route");
};
