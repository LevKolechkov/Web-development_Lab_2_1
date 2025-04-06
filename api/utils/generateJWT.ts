import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../app";

const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "1h" });
};

export default generateToken;
