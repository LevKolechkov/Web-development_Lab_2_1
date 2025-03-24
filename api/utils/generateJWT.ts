import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../app";

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

export default generateToken;
