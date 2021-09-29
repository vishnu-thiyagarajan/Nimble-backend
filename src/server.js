require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const cors = require("cors");
const connection = require("./models");
connection();

app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(express.urlencoded({ extended: false }));
app.use('/api', require('./controls/role'));
app.use('/api', require('./controls/user'));
app.listen(process.env.PORT || 5000);

module.exports = app;
