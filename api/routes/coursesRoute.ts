import { Router } from "express";
import {
  getCoursesHandler,
  postCourseHandler,
  getCourseByIDHandler,
  deleteCourseHandler,
} from "../controllers/coursesController";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "./assets/uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage: storage });

const router = Router();

router.get("/", getCoursesHandler);
router.post("/", upload.single("image"), postCourseHandler);
router.get("/:courseId", getCourseByIDHandler);
router.delete("/:courseId", deleteCourseHandler);

export default router;
