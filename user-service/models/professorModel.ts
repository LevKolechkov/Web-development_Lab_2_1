import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/IUser";

export interface IProfessor extends IUser {
  _id: string;
  firstName: string;
  lastName: string;
  login: string;
  password: string;
  role: string;
}

const professorSchema = new Schema<IProfessor>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  login: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

export const Professor = model<IProfessor>(
  "Professor",
  professorSchema,
  "professors"
);
