const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  unlikeItem,
} = require("../controllers/clothingItem");

// Get all items
router.get("/", getItems);

// Create item
router.post("/", auth, createItem);

// Delete item by ID
router.delete("/:itemId", auth, deleteItem);

// Like item
router.put("/:itemId/likes", auth, likeItem);

// Unlike item
router.delete("/:itemId/likes", auth, unlikeItem);

module.exports = router;
