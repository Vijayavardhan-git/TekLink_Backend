const express = require("express");
const userAuth = require("../middlewares/user");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

userRouter.get("/user/requests/pending", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const data = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    res.json({
      message: `Pending Requests:`,
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const data = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      status: "accepted",
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    const user = data.map((row) => {
      if (row.fromUserId._id.equals(loggedInUser._id)) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });

    res.json({
      message: `Your Connections:`,
      user,
    });
  } catch (err) {
    res.status(400).send("ERROR " + err.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    });
    const hideData = new Set();
    connections.forEach((req) => {
      hideData.add(req.fromUserId.toString());
      hideData.add(req.toUserId.toString());
    });
    const data = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideData) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);
    res.json({
      message: `Feed:`,
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

userRouter.get("/user/:id", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("firstName lastName");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = userRouter;
