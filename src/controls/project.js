const express = require("express");
const mongoose = require("mongoose");
const ProjectsModel = mongoose.model("Projects");
const passport = require("passport");
const UsersModel = mongoose.model("Users");
const { roles } = require("../constants");
const checkIsInRole = require("../utils");
const router = express.Router();

router.post(
    "/project",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
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
    checkIsInRole(roles.ROLE_SCRUMMASTER),
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

router.post(
    "/member",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
    async (req, res) => {
        const { memberEmail, projectId } = req.body;
        const user = await UsersModel.findOne({ email: memberEmail }).exec();
        const project = await ProjectsModel.findById(projectId).exec();
        if (
            Array(project.members).findIndex((e) => e.user_id === user._id) >= 0
        ) {
            return res.status(200).send("Member already exists.");
        }

        ProjectsModel.findById(projectId, (err, result) => {
            if (!err) {
                if (!result) {
                    res.sendStatus(404).send("Project was not found").end();
                } else {
                    result.members.push({
                        userId: user._id,
                        standups: [],
                    });
                    result.markModified("members");
                    result.save(function (saveerr, saveresult) {
                        if (!saveerr) {
                            res.status(200).send(saveresult);
                        } else {
                            res.status(400).send(saveerr.message);
                        }
                    });
                }
            } else {
                res.status(400).send(err.message);
            }
        });
    }
);

module.exports = router;
