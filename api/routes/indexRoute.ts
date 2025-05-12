import { Router, Request, Response } from "express";
import { sendToQueue } from "../utils/rabbitmqSender";
import rootRouter from "../routes/rootRoute";

const router: Router = Router();

router.get("/", rootRouter);
router.all("/users", async (req: Request, res: Response) => {
  const message = {
    method: req.method,
    path: req.originalUrl,
    body: req.body,
  };

  try {
    await sendToQueue("user-service", JSON.stringify(message));
    console.log("Message sent to user-service");
    res.status(200).send("Message successfully sent to user-service");
  } catch (err) {
    console.error("Error sending message to user-service:", err);
    res.status(500).send("Failed to send message to user-service");
  }
});
router.all("/courses", async (req: Request, res: Response) => {
  const message = {
    method: req.method,
    path: req.originalUrl,
    body: req.body,
  };

  try {
    await sendToQueue("course-service", JSON.stringify(message));
    console.log("Message sent to course-service");
    res.status(200).send("Message successfully sent to course-service");
  } catch (err) {
    console.error("Error sending message to course-service:", err);
    res.status(500).send("Failed to send message to course-service");
  }
});

export default router;
