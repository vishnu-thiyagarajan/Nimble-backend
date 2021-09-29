const express = require("express");
const mongoose = require("mongoose");
const ProjectsModel = mongoose.model("Projects");
const passport = require("passport");
const UsersModel = mongoose.model("Users");
const router = express.Router();

router.post(
    "/project",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const user = await UsersModel.findOne({
                email: req.user.email,
            }).exec();
            if (user.projects.length >= 1)
                return res.status(200).send("A default project already exists");
            const project = await ProjectsModel.create({
                projectName: "Default Project",
                startDate: Date.now(),
                members: [],
                tickets: [],
                sprints: [],
            });
            user.projects.push(project._id);
            user.save();
            return res.json(project.toObject());
        } catch (error) {
            return res
                .status(500)
                .send({ message: "server side error", error: { ...error } });
        }
    }
);

router.get(
    "/projects",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const user = await UsersModel.findOne({
                email: req.user.email,
            }).exec();
            const userProjects = user.projects;
            const projects = await ProjectsModel.find({
                _id: { $in: userProjects },
            }).exec();
            return res.status(200).json(projects);
        } catch (error) {
            return res
                .status(500)
                .send({ message: "server side error", error: { ...error } });
        }
    }
);

module.exports = router;
