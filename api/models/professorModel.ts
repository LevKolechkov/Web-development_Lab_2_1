import { Schema, model } from "mongoose";

interface IProfessor {
  firstName: string;
  lastName: string;
  login: string;
  password: string;
}

const professorSchema = new Schema<IProfessor>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  login: { type: String, required: true },
  password: { type: String, required: true },
});

export const Professor = model<IProfessor>(
  "Professor",
  professorSchema,
  "professors"
);
