const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Please Login!!");
    }
    const data = await jwt.verify(token, "Lens@123");
    if (!data) {
      throw new Error("Invalid Token");
    }
    const user = await User.findById(data._id);
    if (!user) {
      throw new Error("User Doesn't Exist!!");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("ERROR : " + err.message);
  }
};

module.exports = userAuth;
