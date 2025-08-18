const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
  },
  password: {
    type: String,
  },
  phoneNumber: {
    type: Number,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    validate(value) {
      if (!["male", "female", "others"].includes(value)) {
        throw new Error("Gender data is not valid");
      }
    },
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  membershipType: {
    type: String,
  },
  photoUrl: {
    type: String,
    default: "https://geographyandyou.com/images/user-profile.png",
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("Invalid Photo URL: " + value);
      }
    },
  },
  about: {
    type: String,
    default: "This is a default about of the user!",
  },
  skills: {
    type: [String],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
