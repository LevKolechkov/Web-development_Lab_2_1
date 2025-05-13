import { IUser } from "./IUser";

export interface ICourse extends IUser {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  category: string;
  level: string;
  published: boolean;
  author: string;
  createdAt: string;
  tags: string[];
}
