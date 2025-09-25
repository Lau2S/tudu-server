const express = require("express");
const verify = require("../middleware/verifyToken");
const loginLimiter = require("../middleware/rateLimit");
const router = express.Router();

const UserController = require("../controllers/UserController");
const { adminKey } = require("../models/User");

/**
 * @route GET /users
 * @description Retrieve all users.
 * @access Public
 */
router.get("/", (req, res) => UserController.getAll(req, res));

/**
 * @route GET /users/:id
 * @description Retrieve a user by ID.
 * @param {string} id - The unique identifier of the user.
 * @access Public
 */
// router.get("/:id", verify, (req, res) => {
//   if (req.user.userId !== String(req.params.id)) {
//     return res.status(403).json({ message: "Forbidden" });
//   }
//   UserController.read(req, res);
// });

router.get("/me", verify, (req, res) => {
  UserController.read(req, res);
});

/**
 * @route POST /users
 * @description Create a new user.
 * @body {string} username - The username of the user.
 * @body {string} password - The password of the user.
 * @access Public
 */
router.post("/", (req, res) => UserController.create(req, res));

/**
 * @route PUT /users/:id
 * @description Update an existing user by ID.
 * @param {string} id - The unique identifier of the user.
 * @body {string} [username] - Updated username (optional).
 * @body {string} [password] - Updated password (optional).
 * @access Public
 */
router.put("/me/:id", verify, (req, res) => {
  if (req.user.userId !== String(req.params.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  UserController.update(req, res);
});

/**
 * @route DELETE /users/:id
 * @description Delete a user by ID.
 * @param {string} id - The unique identifier of the user.
 * @access Public
 */
router.delete("/me/:id", verify, (req, res) => {
  if (req.user.userId !== String(req.params.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  UserController.delete(req, res);
});

/**
 * @route POST /users/auth/login
 * @description Log in user and return JWT token
 * @body {string} email - User's email
 */
router.post("/auth/login", loginLimiter, (req, res) =>
  UserController.login(req, res)
);

/**
 * @route POST /users/auth/logout
 * @description Log out user (client should delete token)
 * @access Private (necesita token válido para hacer logout)
 */
router.post("/auth/logout", verify, (req, res) => {
  return res.status(200).json({ message: "Sesión cerrada correctamente" });
});

router.post("/auth/forgot-password", (req, res) =>
  UserController.forgotPassword(req, res)
);
router.post("/auth/reset-password/:token", (req, res) =>
  UserController.resetPassword(req, res)
);

router.put("/:id/lock", adminKey, (req, res) => UserController.lock(req, res));
router.put("/:id/unlock", adminKey, (req, res) =>
  UserController.unlock(req, res)
);

/**
 * Export the router instance to be mounted in the main routes file.
 */
module.exports = router;
