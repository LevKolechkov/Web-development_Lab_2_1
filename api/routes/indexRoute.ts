import { Router, Request, Response } from "express";
import { sendToQueue } from "../utils/rabbitmqSender";
import rootRouter from "../routes/rootRoute";
import multer from "multer";

const router: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", rootRouter);
router.all(
  "/users",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const message = {
      method: req.method,
      path: req.originalUrl,
      body: req.body,
    };

    try {
      await sendToQueue(
        "user-service",
        "user-service-routing",
        JSON.stringify(message)
      );
      console.log("Message sent to user-service");
      res.status(200).send("Message successfully sent to user-service");
    } catch (err) {
      console.error("Error sending message to user-service:", err);
      res.status(500).send("Failed to send message to user-service");
    }
  }
);
router.all(
  "/courses",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const message = {
      method: req.method,
      path: req.originalUrl,
      body: req.body,
    };

    try {
      await sendToQueue(
        "course-service",
        "course-service-routing",
        JSON.stringify(message)
      );
      console.log("Message sent to course-service");
      res.status(200).send("Message successfully sent to course-service");
    } catch (err) {
      console.error("Error sending message to course-service:", err);
      res.status(500).send("Failed to send message to course-service");
    }
  }
);

export default router;
