const { Router } = require("express");
const courseRouter = Router();
const { courseModel, purchaseModel } = require("../db");
const { userMiddleware } = require("../middleware/user");

courseRouter.post("/purchase", userMiddleware, async (req, res) => {
    const userId = req.userId;
    const courseId = req.body.courseId;

    try {
        const exist = await courseModel.findOne({
            _id: courseId,
        });

        if (!exist) {
            return res.status(404).json({
                message: "The course does not exist",
            });
        }

        const response = await purchaseModel.findOne({
            userId: userId,
            courseId: courseId
        });

        if (response) {
            return res.status(409).json({
                message: "User has already bought the course",
            });
        }

        await purchaseModel.create({
            userId,
            courseId,
        });

        res.json({
            message: "You have successfully bought the course",
        });
    }
    catch(e) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

courseRouter.get("/", async (req, res) => {
    try {
        const courses = await courseModel.find({});

        res.json({
            courses,
        });
    }
    catch(e) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

module.exports = {
    courseRouter,
};