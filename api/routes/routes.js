/**
 * @fileoverview Main router configuration for the Tudu API.
 * Mounts all route modules and defines the API endpoint structure.
 * @author Tudu Development Team
 * @version 1.0.0
 */

const express = require("express");
const userRoutes = require("./userRoutes");
const taskRoutes = require("./taskRoutes");

/** @type {express.Router} Main API router instance */
const router = express.Router();

/**
 * Mount user-related routes under /users endpoint.
 * All routes defined in userRoutes will be accessible under `/users`.
 * @name UserRoutes
 * @memberof module:routes
 * @see {@link module:userRoutes} for detailed route definitions
 * @example
 * // Available endpoints:
 * // GET    /users        → Get all users
 * // POST   /users        → Create a new user
 * // GET    /users/:id    → Get a user by ID
 * // PUT    /users/:id    → Update a user by ID
 * // DELETE /users/:id    → Delete a user by ID
 * // POST   /users/auth/login → User authentication
 * // POST   /users/auth/forgot-password → Password recovery
 */
router.use("/users", userRoutes);

/**
 * Mount task-related routes under /tasks endpoint.
 * All routes defined in taskRoutes will be accessible under `/tasks`.
 * @name TaskRoutes
 * @memberof module:routes
 * @see {@link module:taskRoutes} for detailed route definitions
 * @example
 * // Available endpoints:
 * // GET    /tasks        → Get all tasks for authenticated user
 * // POST   /tasks        → Create a new task
 * // GET    /tasks/:id    → Get a task by ID
 * // PUT    /tasks/:id    → Update a task by ID
 * // DELETE /tasks/:id    → Delete a task by ID
 * // PATCH  /tasks/:id/status → Update task status
 */
router.use("/tasks", taskRoutes);

/**
 * Export the main router instance.
 * This router is imported in `index.js` and mounted under `/api/v1`.
 * @module routes
 * @type {express.Router}
 * @example
 * // In index.js:
 * const routes = require('./routes/routes');
 * app.use('/api/v1', routes);
 * 
 * // Results in endpoints like:
 * // POST /api/v1/users/auth/login
 * // GET  /api/v1/tasks
 * // PUT  /api/v1/tasks/:id
 */
module.exports = router;
