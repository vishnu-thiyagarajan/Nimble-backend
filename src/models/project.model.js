const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const standup = new Schema(
    {
        date: { type: Date, required: false },
        yesterday: { type: String, required: false },
        today: { type: String, required: false },
        blocker: { type: String, required: false },
    },
    { _id: false }
);
const member = new Schema(
    {
        userId: { type: String, required: true },
        standups: { type: [standup], required: false },
    },
    { _id: false }
);
const ticket = new Schema({
    ticketId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignee: { type: String, required: false },
    priority: { type: String, required: false },
    type: { type: String, required: true },
    storyPoints: { type: String, required: false },
    sprint: { type: String, required: false },
    status: { type: String, required: false },
});
const projectSchema = new Schema({
    projectName: { type: String, required: true },
    startDate: { type: Date, required: false },
    targetEndDate: { type: Date, required: false },
    members: { type: [member], required: false },
    tickets: { type: [ticket], required: false },
    sprints: { type: [Schema.Types.ObjectId], ref: "Sprints", required: false },
});

const ProjectsModel = mongoose.model("Projects", projectSchema);
module.exports = ProjectsModel;
