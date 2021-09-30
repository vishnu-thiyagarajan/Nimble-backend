const express = require("express");
const mongoose = require("mongoose");
const SprintsModel = mongoose.model("Sprints");
const passport = require("passport");
const ProjectsModel = mongoose.model("Projects");
const router = express.Router();
const checkIsInRole = require("../utils");
const { roles } = require("../constants");

// router.get(
//     "/retrospectives",
//     passport.authenticate("jwt", { session: false }),
//     async (req, res) => {
//         try {
//             const sprint = await SprintsModel.findOne({
//                 _id: req.body.sprint_id,
//             }).exec();
//             return res.send(sprint.retrospectives);
//         } catch (error) {
//             return res
//                 .status(500)
//                 .send({ message: "server side error", error: { ...error } });
//         }
//     }
// );

// router.get(
//     "/activities",
//     passport.authenticate("jwt", { session: false }),
//     async (req, res) => {
//         try {
//             const sprint = await SprintsModel.findOne({
//                 _id: req.body.sprint_id,
//             }).exec();
//             return res.send(sprint.activities);
//         } catch (error) {
//             return res
//                 .status(500)
//                 .send({ message: "server side error", error: { ...error } });
//         }
//     }
// );

router.post(
    "/activity",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const sprint = await SprintsModel.findOne({
                _id: req.body.sprint_id,
            }).exec();
            sprint.activities.push({
                ticket_id: req.body.ticket_id,
                tostatus: req.body.tostatus,
                fromstatus: req.body.fromstatus,
                storypoints: req.body.storypoints,
            });
            sprint.save();
            return res.send({ message: "activity updated" });
        } catch (error) {
            return res
                .status(500)
                .send({ message: "server side error", error: { ...error } });
        }
    }
);

router.post(
    "/retrospectives",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
    async (req, res) => {
        try {
            await SprintsModel.findOneAndUpdate(
                {
                    _id: req.body.sprint_id,
                },
                {
                    retrospectives: {
                        positives: req.body.positives || [],
                        neutrals: req.body.neutrals || [],
                        negatives: req.body.negatives || [],
                        actions: req.body.actions || [],
                    },
                }
            );
            return res.send({ message: "retrospectives freezed" });
        } catch (error) {
            return res
                .status(500)
                .send({ message: "server side error", error: { ...error } });
        }
    }
);

router.put(
    "/completesprint",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
    async (req, res) => {
        try {
            await SprintsModel.findOneAndUpdate(
                {
                    _id: req.body.sprint_id,
                },
                { endDate: Date.now() }
            );
            return res.send({ message: "complete date updated" });
        } catch (error) {
            return res
                .status(500)
                .send({ message: "server side error", error: { ...error } });
        }
    }
);

router.post(
    "/startsprint",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
    async (req, res) => {
        try {
            let sprints = [];
            const project = await ProjectsModel.findOne({
                _id: req.body.project_id,
            }).exec();
            if (project.sprints && project.sprints.length === 0) {
                const activeSprint = await SprintsModel.create({
                    name: "Sprint_1",
                    startDate: Date.now(),
                    members: [],
                    tickets: [],
                    sprints: [],
                });
                const upcomingSprint = await SprintsModel.create({
                    name: "Sprint_2",
                    members: [],
                    tickets: [],
                    sprints: [],
                });
                project.sprints.push(activeSprint._id);
                project.sprints.push(upcomingSprint._id);
                sprints = [activeSprint, upcomingSprint];
            } else {
                const upcomingSprint = await SprintsModel.create({
                    name: "Sprint_" + (project.sprints.length + 1),
                    startDate: Date.now(),
                    members: [],
                    tickets: [],
                    sprints: [],
                });
                project.sprints.push(upcomingSprint._id);
                sprints = [upcomingSprint];
            }
            project.save();
            return res.send(sprints);
        } catch (error) {
            return res
                .status(500)
                .send({ message: "server side error", error: { ...error } });
        }
    }
);

router.get(
    "/sprints",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const project = await ProjectsModel.findOne({
                _id: req.body.project_id,
            }).exec();
            const projectSprints = project.sprints;
            const sprints = await SprintsModel.find({
                _id: { $in: projectSprints },
            }).exec();
            return res.status(200).json(sprints);
        } catch (error) {
            return res
                .status(500)
                .send({ message: "server side error", error: { ...error } });
        }
    }
);

module.exports = router;
