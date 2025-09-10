const express = require("express");
const userRoutes = require("./userRoutes");
<<<<<<< HEAD
const taskRoutes = require("./taskRoutes")
=======
const taskRoutes = require("./taskRoutes");
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224

const router = express.Router();

/**
 * Mount user-related routes.
 *
 * All routes defined in {@link userRoutes} will be accessible under `/users`.
 * Example:
 *   - GET  /users        → Get all users
 *   - POST /users        → Create a new user
 *   - GET  /users/:id    → Get a user by ID
 *   - PUT  /users/:id    → Update a user by ID
 *   - DELETE /users/:id  → Delete a user by ID
 */
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes)

router.use("/tasks", taskRoutes);

/**
 * Export the main router instance.
 * This is imported in `index.js` and mounted under `/api/v1`.
 */
module.exports = router;
