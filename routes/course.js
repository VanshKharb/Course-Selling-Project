const { Router } = require("express");
const courseRouter = Router();
const { courseModel } = require("../db");

courseRouter.post("/purchase", (req, res) => {

});

courseRouter.get("/", (req, res) => {

});

module.exports = {
    courseRouter,
};