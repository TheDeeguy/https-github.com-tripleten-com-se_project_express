const router = require("express").Router();
const itemRouter = require("./clothingItem");
const userRouter = require("./users");
const { login, createUser } = require("../controllers/users");
const { NOT_FOUND } = require("../utils/errors");
const auth = require("../middlewares/auth");

router.use("/items", itemRouter);
router.post("/signin", login);
router.post("/signup", createUser);

router.use(auth);

router.use("/users", userRouter);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Route not found" });
});

module.exports = router;
