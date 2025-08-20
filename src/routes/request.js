const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const userAuth = require("../middlewares/user");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid request");
      }
      if (fromUserId.equals(toUserId)) {
        throw new Error("You cannot perform this action on yourself");
      }
      const user = await User.findById(toUserId);
      if (!user) throw new Error("User Doesn't exist");
      const isConnectionExist = await ConnectionRequest.findOne({
        $or: [
          { toUserId, fromUserId },
          { toUserId: fromUserId, fromUserId: toUserId },
        ],
      });
      if (isConnectionExist) throw new Error("Connection already sent!");
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      const emailRes = await sendEmail.run(
        "A new friend request from " + req.user.firstName,
        req.user.firstName + " is " + status + " in " + user.firstName
      );
      res.json({
        message: `${req.user.firstName} ${status} ${user.firstName}`,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR : " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const { status, requestId } = req.params;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) throw new Error("Invalid Request");
      const data = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: user._id,
        status: "interested",
      });
      if (!data) throw new Error("Connection Request Doesn't Exist");
      data.status = status;
      const updatedData = await data.save();
      res.json({
        message: `Connection Request ${status}`,
        updatedData,
      });
    } catch (err) {
      res.status(400).send("ERROR : " + err.message);
    }
  }
);

module.exports = requestRouter;
