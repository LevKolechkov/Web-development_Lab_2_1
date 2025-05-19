import { Router } from "express";
import { ResponseLog } from "../models/responseModel";
import { Request, Response } from "express";

const router = Router();

router.get("/responses/:requestId", async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const log = await ResponseLog.findOne({ requestId });

    if (!log) {
      res.status(404).json({ message: "Response not found" });
      return;
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: "Error fetching response", error });
  }
});

export default router;
