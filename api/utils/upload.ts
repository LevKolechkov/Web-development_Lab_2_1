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

export default upload;
