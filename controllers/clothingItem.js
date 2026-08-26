const ClothingItem = require("../models/clothingItem");

const {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

// POST /items
const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.status(201).send({ data: item });
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({
          message: err.message,
        });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "Error from createItem",
      });
    });
};

// GET /items
const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);

      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "Failed to load items",
      });
    });
};

// DELETE /items/:itemId
// DELETE /items/:itemId
const deleteItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail(new Error("Item not found"))
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        return res.status(FORBIDDEN).send({
          message: "You do not have permission to delete this item",
        });
      }

      return ClothingItem.findByIdAndDelete(itemId);
    })
    .then((item) => {
      if (item) {
        res.status(200).send({ data: item });
      }
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({
          message: "Invalid item ID format",
        });
      }

      if (err.message === "Item not found") {
        return res.status(NOT_FOUND).send({
          message: "Item not found",
        });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "Failed to delete item",
      });
    });
};
// PUT /items/:itemId/likes
const likeItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(new Error("Item not found"))
    .then((item) => {
      res.status(200).send({ data: item });
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({
          message: "Invalid item ID format",
        });
      }

      if (err.message === "Item not found") {
        return res.status(NOT_FOUND).send({
          message: "Item not found",
        });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "Failed to like item",
      });
    });
};

// DELETE /items/:itemId/likes
const unlikeItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(new Error("Item not found"))
    .then((item) => {
      res.status(200).send({ data: item });
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({
          message: "Invalid item ID format",
        });
      }

      if (err.message === "Item not found") {
        return res.status(NOT_FOUND).send({
          message: "Item not found",
        });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "Failed to unlike item",
      });
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
};
