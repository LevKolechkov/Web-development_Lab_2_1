import { Response } from "express";
export const checkStudent = (res: Response, studentId: string) => {
  if (!studentId) {
    res.status(404).json({
      message: "Student not found",
    });
    return;
  }
};
