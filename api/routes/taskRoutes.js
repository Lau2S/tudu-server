const express = require("express");
const router = express.Router();

const TaskController = require("../controllers/TaskController");

/**
 * @route GET /tasks
 * @description Retrieve all tasks.
 * @access Public
 */
router.get("/", (req, res) => TaskController.getAll(req, res));

/**
 * @route GET /tasks/:id
 * @description Retrieve a task by ID.
 * @param {string} id - The unique identifier of the task.
 * @access Public
 */
router.get("/:id", (req, res) => TaskController.read(req, res));

/**
 * @route POST /tasks
 * @description Create a new task.
 * @body {string} user_email - The email of the user.
 * @body {string} title - The task's title.
 * @body {string} detail - The task's details.
 * @access Public
 */
router.post("/", (req, res) => TaskController.create(req, res));

/**
 * @route PUT /tasks/:id
 * @description Update an existing task by ID.
 * @param {string} id - The unique identifier of the task.
 * @body {string} user_email - The email of the user.
 * @body {string} title - The task's title.
 * @body {string} detail - The task's details.
 * @access Public
 */
router.put("/:id", (req, res) => TaskController.update(req, res));

/**
 * @route DELETE /tasks/:id
 * @description Delete a task by ID.
 * @param {string} id - The unique identifier of the task.
 * @access Public
 */
router.delete("/:id", (req, res) => TaskController.delete(req, res));

/**
 * Export the router instance to be mounted in the main routes file.
 */
module.exports = router;
