const mongoose = require("mongoose");
const rolesSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
    },
    { timestamps: true }
);
mongoose.model("Roles", rolesSchema);
module.exports = rolesSchema;
