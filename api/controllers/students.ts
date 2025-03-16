import { Request, Response } from "express";

export const getStudentsHandler = (req: Request, res: Response) => {
  res.send("Get students route");
};

export const getSingleStudentHandler = (req: Request, res: Response) => {
  res.send("Get student route.");
};

export const postStudentHandler = (req: Request, res: Response) => {
  res.send("Post student route");
};

export const deleteStudentHandler = (req: Request, res: Response) => {
  res.send("Delete student route");
};
