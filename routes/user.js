const { Router } = require("express");
const userRouter = Router();
const { userModel, purchaseModel, courseModel } = require("../db");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");

userRouter.post("/signup", async (req, res) => {
    const userSchema = z.object({
        email: z.string().email().max(50),
        password: z.string().min(8).max(50),
        firstName: z.string().max(50),
        lastName: z.string().max(50),
    });

    const parsedData = userSchema.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({
            message: "Incorrect format",
            error: parsedData.error,
        });
    }

    const { email, password, firstName, lastName } = parsedData.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await userModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
        });

        return res.json({
            message: "You are signed up",
        });
    }
    catch(e) {
        if (e.code === 11000) {
            return res.status(409).json({
                message: "User already exists",
            });
        }
        else {
            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
});

userRouter.post("/signin", async (req, res) => {
    const signinSchema = z.object({
        email: z.string().email().max(50),
        password: z.string().min(8).max(50),
    });

    const parsed = signinSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Incorrect username or password",
        });
    }

    const {email, password} = parsed.data;

    try {
        const response = await userModel.findOne({
            email,
        });

        if (!response) {
            return res.status(403).json({
                message: "Incorrect username or password",
            });
        }

        const passwordMatch = await bcrypt.compare(password, response.password);

        if (!passwordMatch) {
            return res.status(403).json({
                message: "Incorrect username or password",
            });
        }

        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_USER_PASSWORD);

        return res.json({
            token: token,
        });
    }
    catch(e) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

userRouter.get("/purchases", userMiddleware, async (req, res) => {
    const userId = req.userId;

    try {
        const purchases = await purchaseModel.find({
            userId,
        });

        const courseData = await courseModel.find({
            _id: { $in: purchases.map(x => x.courseId) }
        })

        res.json({
            purchases,
            courseData,
        });
    }
    catch(e) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

module.exports = {
    userRouter
};