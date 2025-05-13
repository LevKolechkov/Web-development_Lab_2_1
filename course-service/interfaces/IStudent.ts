import { IUser } from "../interfaces/IUser";
export interface IStudent extends IUser {
  favoriteCourses: string[];
}
