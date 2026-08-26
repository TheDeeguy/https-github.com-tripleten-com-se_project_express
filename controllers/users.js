const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const {
  BAD_REQUEST,
  NOT_FOUND,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");
const User = require("../models/user");

// POST /users
const createUser = (req, res) => {
  const { email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hashedPassword) =>
      User.create({
        email,
        password: hashedPassword,
      })
    )
    .then((user) =>
      res.status(201).send({
        _id: user._id,
        email: user.email,
      })
    )
    .catch((err) => {
      console.error(err);

      if (err.code === 11000) {
        return res.status(CONFLICT).send({
          message: "Email already exists",
        });
      }

      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({
          message: err.message,
        });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "Failed to create user",
      });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      res.status(401).send({
        message: "Incorrect email or password",
      });
    });
};

// GET /users/me
const getCurrentUser = (req, res) => {
  const { _id } = req.user;

  User.findById(_id)
    .orFail(new Error("User not found"))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({
          message: "Invalid user ID format",
        });
      }

      if (err.message === "User not found") {
        return res.status(NOT_FOUND).send({
          message: "User not found",
        });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "Failed to load user",
      });
    });
};

// PATCH /users/me
const updateProfile = (req, res) => {
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(new Error("User not found"))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);

      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({
          message: err.message,
        });
      }

      if (err.message === "User not found") {
        return res.status(NOT_FOUND).send({
          message: "User not found",
        });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "Failed to update profile",
      });
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  updateProfile,
  login,
};
