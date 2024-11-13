const mongoose = require("mongoose");

type UserProps = {
  email: string;
};

const User = mongoose.model("User", {
  email: {
    type: String,
    required: true,
    unique: true,
  },
  account: {
    username: {
      type: String,
      required: true,
    },
    avatar: Object,
  },
  newslettre: Boolean,
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
