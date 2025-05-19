import { Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { Professor } from "../models/professorModel";
import { JWT_SECRET } from "../app";
import jwt from "jsonwebtoken";
import { extractUserData } from "../utils/extractUserData";
import { sendToQueue } from "../utils/rabbitmqSender";
import { v4 as uuidv4 } from "uuid";

export const getProfessorsHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    console.log("Fetching professors from database...");

    const professors = await Professor.find({});
    console.log(`Successfully fetched ${professors.length} professors`);

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: professors,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Professors are being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error fetching professors:", error);

    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Error fetching professors",
      requestId,
    });
  }
};

export const getSingleProfessorHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  const { professorId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(professorId)) {
      const badPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 400,
        error: "Invalid professor ID format",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(badPayload)
      );

      res
        .status(400)
        .json({ message: "Invalid professor ID format", requestId });
      return;
    }

    const professor = await Professor.findById(professorId);

    if (!professor) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Professor not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({ message: "Professor not found", requestId });
      return;
    }

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: professor,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Professor data is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error fetching professor:", error);

    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Error fetching professor",
      requestId,
    });
  }
};

export const postProfessorHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { isValid, data, message } = extractUserData(req.body);

    if (!isValid || !data) {
      const payload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 400,
        error: message,
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(payload)
      );

      res.status(400).json({ message, requestId });
      return;
    }

    const { firstName, lastName, login, password } = data;

    const existingProfessor = await Professor.findOne({ login });
    if (existingProfessor) {
      const conflictPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 409,
        error: "Professor with this login already exists",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(conflictPayload)
      );

      res.status(409).json({
        message: "Professor with this login already exists",
        requestId,
      });
      return;
    }

    const hashedPassword = hashSync(password, genSaltSync(10));

    const newProfessor = new Professor({
      firstName,
      lastName,
      login,
      password: hashedPassword,
    });

    const savedProfessor = await newProfessor.save();

    const responsePayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 201,
      result: JSON.stringify({
        _id: savedProfessor._id,
        firstName: savedProfessor.firstName,
        lastName: savedProfessor.lastName,
        login: savedProfessor.login,
      }),
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(responsePayload)
    );

    res.status(202).json({
      message: "Professor creation is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error creating professor:", error);

    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Error creating professor",
      requestId,
    });
  }
};

export const deleteProfessorHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { professorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(professorId)) {
      const payload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 400,
        error: "Invalid professor ID format",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(payload)
      );

      res.status(400).json({ message: payload.error, requestId });
      return;
    }

    const deletedProfessor = await Professor.findByIdAndDelete(professorId);

    if (!deletedProfessor) {
      const notFoundPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 404,
        error: "Professor not found",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(notFoundPayload)
      );

      res.status(404).json({ message: notFoundPayload.error, requestId });
      return;
    }

    const successPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: "Professor deleted successfully",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(successPayload)
    );

    res.status(202).json({
      message: "Professor deletion is being processed",
      requestId,
    });
  } catch (error) {
    console.error("Error deleting professor:", error);

    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(500).json({
      message: "Error deleting professor",
      requestId,
    });
  }
};

export const authorisedProfessorHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestId = req.headers["x-request-id"] || uuidv4();

  try {
    const { token } = req.body;

    if (!token) {
      const errorPayload = {
        requestId,
        path: req.originalUrl,
        method: req.method,
        status: 401,
        error: "Authorization token required",
      };

      await sendToQueue(
        "response-service",
        "response-service-routing",
        JSON.stringify(errorPayload)
      );

      res.status(401).json({ message: errorPayload.error, requestId });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const successPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 200,
      result: decoded.userId,
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(successPayload)
    );

    res.status(202).json({
      message: "Authorization is being processed",
      requestId,
    });
  } catch (error) {
    const errorPayload = {
      requestId,
      path: req.originalUrl,
      method: req.method,
      status: 401,
      error: "Unauthorized: Invalid token",
    };

    await sendToQueue(
      "response-service",
      "response-service-routing",
      JSON.stringify(errorPayload)
    );

    res.status(401).json({
      message: "Unauthorized",
      requestId,
    });

    console.error(error);
  }
};
