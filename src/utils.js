/* eslint-disable indent */
const checkIsInRole =
    (...roles) =>
    (req, res, next) => {
        const role = req.user.role.name;
        if (roles.includes(role)) return next();
        return res.status(401).send("User doesn't have sufficient priviledge");
    };
module.exports = checkIsInRole;
