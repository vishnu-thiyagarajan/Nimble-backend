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

router.post(
    "/addTicket",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
    async (req, res) => {
        const { projectId, ticketDetails } = req.body;
        ProjectsModel.findById(projectId, (err, result) => {
            if (!err) {
                if (!result) {
                    res.sendStatus(404).send("Project was not found").end();
                } else {
                    result.tickets.push(ticketDetails);
                    result.save(function (saveerr, saveresult) {
                        if (!saveerr) {
                            res.status(200).send({
                                success: true,
                                data: ticketDetails,
                            });
                        } else {
                            res.status(400).send({
                                success: false,
                                message: saveerr.message,
                            });
                        }
                    });
                }
            } else {
                res.status(400).send(err.message);
            }
        });
    }
);

router.post(
    "/updateTicket",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
    async (req, res) => {
        const { projectId, ticketDetails } = req.body;
        ProjectsModel.findById(projectId, (err, result) => {
            if (!err) {
                if (!result) {
                    res.sendStatus(404).send("Project was not found").end();
                } else {
                    const ticketIndex = result.tickets.findIndex(
                        (ticket) => ticket.ticketId === ticketDetails.ticketId
                    );
                    if (ticketIndex !== -1) {
                        result.tickets[ticketIndex] = ticketDetails;
                    } else {
                        res.sendStatus(404).send("Ticket was not found").end();
                    }
                    result.save(function (saveerr, saveresult) {
                        if (!saveerr) {
                            res.status(200).send({
                                success: true,
                                data: ticketDetails,
                            });
                        } else {
                            res.status(400).send({
                                success: false,
                                message: saveerr.message,
                            });
                        }
                    });
                }
            } else {
                res.status(400).send(err.message);
            }
        });
    }
);

router.post(
    "/deleteTicket",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
    async (req, res) => {
        const { projectId, ticketId } = req.body;
        ProjectsModel.findById(projectId, (err, result) => {
            if (!err) {
                if (!result) {
                    res.sendStatus(404).send("Project was not found.").end();
                } else {
                    const ticketIndex = result.tickets.findIndex(
                        (ticket) => ticket.ticketId === ticketId
                    );
                    if (ticketIndex !== -1) {
                        result.tickets.splice(ticketIndex, 1);
                    } else {
                        res.sendStatus(404).send("Ticket id not valid.").end();
                    }
                    result.save(function (saveerr, saveresult) {
                        if (!saveerr) {
                            res.status(200).send({
                                success: true,
                                message: "Ticket deleted successfully ...",
                            });
                        } else {
                            res.status(400).send({
                                success: false,
                                message: saveerr.message,
                            });
                        }
                    });
                }
            } else {
                res.status(400).send(err.message);
            }
        });
    }
);

router.post(
    "/getAllTickets",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
    async (req, res) => {
        const { projectId } = req.body;
        ProjectsModel.findById(projectId, (err, result) => {
            if (!err) {
                if (!result) {
                    res.sendStatus(404).send("Project was not found.").end();
                } else {
                    res.status(200).send({
                        success: true,
                        data: result.tickets,
                    });
                }
            } else {
                res.status(400).send(err.message);
            }
        });
    }
);

router.post(
    "/changeTicketStatus",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER, roles.ROLE_DEVELOPER),
    async (req, res) => {
        const { projectId, ticketId, status } = req.body;
        ProjectsModel.findById(projectId, (err, result) => {
            if (!err) {
                if (!result) {
                    res.sendStatus(404).send("Project was not found.").end();
                } else {
                    const ticketIndex = result.tickets.findIndex(
                        (ticket) => ticket.ticketId === ticketId
                    );
                    if (ticketIndex !== -1) {
                        // Add Validation If srpint should not be completed
                        result.tickets[ticketIndex].status = status;
                    } else {
                        res.sendStatus(404).send("Ticket was not found").end();
                    }

                    result.save(function (saveerr, saveresult) {
                        if (!saveerr) {
                            res.status(200).send({
                                success: true,
                                message: `Ticket status update to ${status}`,
                            });
                        } else {
                            res.status(400).send({
                                success: false,
                                message: saveerr.message,
                            });
                        }
                    });
                }
            } else {
                res.status(400).send(err.message);
            }
        });
    }
);

router.post(
    "/alldevelopersOfAProject",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
    async (req, res) => {
        const { projectId } = req.body;
        ProjectsModel.findById(projectId, (err, result) => {
            if (!err) {
                if (!result) {
                    res.sendStatus(404).send("Project was not found.").end();
                } else {
                    if (result.members.length > 0) {
                        var memObjIds = result.members.map(function (obj) {
                            return obj["userId"]
                        });
                        UsersModel.find({
                            _id : { $in: memObjIds },
                        },(err,result)=>{
                            if (!result) {
                                res.sendStatus(404).send(`Coudln't fetch developers list of porjectId ${porjectId}`).end();
                            }
                            res.status(200).send({
                                success: true,
                                data: result,
                            });
                        })
                    }
                   
                }
            } else {
                res.status(400).send(err.message);
            }
        });
    }
);

router.post(
    "/addMemberToProject",
    passport.authenticate("jwt", { session: false }),
    checkIsInRole(roles.ROLE_SCRUMMASTER),
    async (req, res) => {
        const { projectId, memberId } = req.body;
        ProjectsModel.findById(projectId, (err, result) => {
            if (!err) {
                if (!result) {
                    res.sendStatus(404).send("Project was not found.").end();
                } else {
                    const member = {
                        userId: memberId,
                        standups: [],
                    };
                    result.members.push(member);
                    result.save(function (saveerr, saveresult) {
                        if (!saveerr) {
                            res.status(200).send({
                                success: true,
                                message: `Member added successfully`,
                            });
                        } else {
                            res.status(400).send({
                                success: false,
                                message: saveerr.message,
                            });
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
