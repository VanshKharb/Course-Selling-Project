const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middleware/admin");

adminRouter.post("/signup", async (req, res) => {
    const requiredData = z.object({
        email: z.string().email().max(50),
        password: z.string().min(8).max(50),
        firstName: z.string().max(50),
        lastName: z.string().max(50),
    });

    const parsedData = requiredData.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({
            message: "Incorrect format",
            error: parsedData.error,
        })
    }

    const {email, password, firstName, lastName} = parsedData.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await adminModel.create({
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
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }
});

adminRouter.post("/signin", async (req, res) => {
    const signinSchema = z.object({
        email: z.string().email().max(50),
        password: z.string().min(8).max(50),
    });

    const parsed = signinSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Incorrect username or password",
            error: parsed.error,
        });
    }

    const {email, password} = parsed.data;

    try {
        const response = await adminModel.findOne({
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
        }, JWT_ADMIN_PASSWORD);

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

adminRouter.post("/course", adminMiddleware, async (req, res) => {
    const adminId = req.userId;

    const courseData = z.object({
        title: z.string().max(20),
        description: z.string().max(100),
        price: z.number(),
        imageURL: z.string(),
    });

    const parsedContent = courseData.safeParse(req.body);

    if (!parsedContent.success) {
        return res.status(400).json({
            message: "Incorrect format",
            error: parsedContent.error,
        });
    }

    const { title, description, price, imageURL } = parsedContent.data;

    try {
        const course = await courseModel.create({
            title: title,
            description: description,
            price: price,
            imageURL: imageURL,
            creatorId: adminId,
        });

        res.json({
            message: "Course Created",
            courseId: course._id,
        });
    }
    catch(e) {
        return res.status(500).json({
            message: "Internal Server error",
        });
    }
});

adminRouter.put("/course", adminMiddleware, async (req, res) => {
    const adminId = req.userId;

    const schema = z.object({
        title: z.string().max(20),
        description: z.string().max(100),
        imageURL: z.string(),
        price: z.number(),
        courseId: z.string().regex(/^[a-f\d]{24}$/i),
    });

    const parsedData = schema.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid input",
            error: parsedData.error,
        });
    }

    const { title, description, imageURL, price, courseId } = parsedData.data;

    try {
        const course = await courseModel.updateOne({
            _id: courseId,
            creatorId: adminId,
        }, {
            title: title,
            description: description,
            imageURL: imageURL,
            price: price,
        });

        res.json({
            message: "Course updated",
            courseId: courseId,
        });
    }
    catch(e) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
});

adminRouter.get("/course/bulk", adminMiddleware, async (req, res) => {
    const adminId = req.userId;

    try {
        const courses = await courseModel.find({
            creatorId: adminId,
        });

        res.json({
            message: "List of the courses: ",
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
    adminRouter,
};