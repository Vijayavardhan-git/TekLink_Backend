require("dotenv").config();
const express = require("express");
const { connectDb } = require("./config.js/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDb()
  .then(() => {
    console.log("Database Connection Successful!!!");
    app.listen(3000, "0.0.0.0", () => {
      console.log("Server listening on 3000!!!!");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected");
  });
