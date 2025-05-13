import { Request, Response } from "express";

export const getRootHandler = (req: Request, res: Response) => {
  res.send("Get root route");
};
