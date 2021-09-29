const express = require("express");
const mongoose = require("mongoose");
const RoleModel = mongoose.model("Roles");
const router = express.Router();

router.post("/role", async (req, res) => {
    try {
        const role = new RoleModel();
        role.name = req.body.name;
        role.createdAt = new Date().toISOString();
        role.save((err, docs) => {
            if (err) throw err;
            res.status(201).send({ message: "role added" });
        });
    } catch (err) {
        res.status(500).send({ message: "server side error" });
    }
});

router.get("/allroles", async (req, res) => {
    try {
        const roles = await RoleModel.find({});
        res.send(roles);
    } catch (err) {
        res.status(500).send({ message: "server side error" });
    }
});

module.exports = router;
