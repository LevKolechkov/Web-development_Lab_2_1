import { Request, RequestHandler, Response } from "express";
import { Tag } from "../models/tagsModel";
import { Course } from "../models/courseModel";

export const postTagHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const name = req.body.name;

    if (!name) {
      res.status(400).json({
        message: "Name for tag is required",
      });
    }

    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      res.status(409).json({
        message: `Tag ${name} already exists`,
      });
    }

    const newTag = new Tag({
      name,
    });

    const savedTag = await newTag.save();

    const tagResponse = {
      _id: savedTag._id,
      name: savedTag.name,
    };

    res.status(201).json(tagResponse);
  } catch (error) {
    console.error("Error creating tag:", error);

    res.status(500).json({
      message: "Error creating tag",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const putTagHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      res.status(400).json({ message: "Need to provide array of tags" });
      return;
    }
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const existingTags = await Tag.find({ name: { $in: tags } });
    if (existingTags.length !== tags.length) {
      res.status(400).json({ message: "Some tags are missing" });
      return;
    }

    course.tags = tags;
    const updatedCourse = await course.save();

    res.status(200).json({
      message: "Course tags updated",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error putting course's tag:", error);

    res.status(500).json({
      message: "Error putting course's tag:",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
