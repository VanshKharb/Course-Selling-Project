const { Router } = require("express");
const courseRouter = Router();
const { courseModel } = require("../db");
const { userMiddleware } = require("../middleware/user");
const { purchaseModel } = require("../db");

courseRouter.post("/purchase", userMiddleware, async (req, res) => {
    const userId = req.userId;
    const courseId = req.body.userId;

    await purchaseModel.create({
        userId,
        courseId,
    });

    res.json({
        message: "You have successfully bought the course",
    });
});

courseRouter.get("/", async (req, res) => {
    const courses = await courseModel.find({});

    res.json({
        courses,
    });
});

module.exports = {
    courseRouter,
};