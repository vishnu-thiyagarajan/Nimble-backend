require("dotenv").config();
const express = require("express");
const app = express();
const flash = require("express-flash");
const session = require("express-session");
const cors = require("cors");
const connection = require("./models");
connection();

app.use(express.json());
app.use(cors());
app.use(flash());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(express.urlencoded({ extended: false }));
app.use("/api", require("./controls/role"));
app.use("/api", require("./controls/user"));
app.use("/api", require("./controls/project"));
app.listen(process.env.PORT);

module.exports = app;
