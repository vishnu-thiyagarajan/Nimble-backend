const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subscriptionSchema = new Schema(
    {
        transactionid: { type: String, required: true },
        amount: { type: String, required: true },
    },
    { timestamps: true }
);
const usersSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        active: { type: Boolean, required: true, default: false },
        role: { type: Schema.Types.ObjectId, ref: "Roles", required: true },
        location: { type: String, required: false },
        phone: { type: String, required: false },
        selfintro: { type: String, required: false },
        imgurl: { type: String, required: false },
        projects: {
            type: [Schema.Types.ObjectId],
            ref: "Projects",
            required: false,
        },
        subscription: { type: [subscriptionSchema], required: false },
    },
    { timestamps: true }
);
usersSchema.pre("save", async function (next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});
usersSchema.methods.isValidPassword = async function (password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);
    return compare;
};
const UsersModel = mongoose.model("Users", usersSchema);
module.exports = UsersModel;
