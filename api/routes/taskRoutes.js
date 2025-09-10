const express = require("express");
const router = express.Router();

const TaskController = require("../controllers/TaskController");
<<<<<<< HEAD

/**
 * @route GET /users
 * @description Retrieve all users.
 * @access Public
 */
router.get("/", (req, res) => TaskController.getAll(req, res));

/**
 * @route GET /users/:id
 * @description Retrieve a user by ID.
 * @param {string} id - The unique identifier of the user.
=======
const verify = require("../middleware/verifyToken");

/**
 * @route GET /tasks
 * @description Retrieve all tasks.
 * @access Public
 */
//router.get("/", (req, res) => TaskController.getAll(req, res));

/**
 * @route GET /tasks/:id
 * @description Retrieve a task by ID.
 * @param {string} id - The unique identifier of the task.
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224
 * @access Public
 */
router.get("/:id", (req, res) => TaskController.read(req, res));

/**
<<<<<<< HEAD
 * @route POST /users
 * @description Create a new user.
 * @body {string} username - The username of the user.
 * @body {string} password - The password of the user.
 * @access Public
 */
router.post("/", (req, res) => TaskController.create(req, res));

/**
 * @route PUT /users/:id
 * @description Update an existing user by ID.
 * @param {string} id - The unique identifier of the user.
 * @body {string} [username] - Updated username (optional).
 * @body {string} [password] - Updated password (optional).
=======
 * @route POST /tasks
 * @description Create a new task.
 * @body {string} user_email - The email of the user.
 * @body {string} title - The task's title.
 * @body {string} detail - The task's details.
 * @access Public
 */
router.post("/", verify, (req, res) => TaskController.create(req, res));

router.get("/", verify, (req, res) => TaskController.getAllByUser(req, res));

/**
 * @route PUT /tasks/:id
 * @description Update an existing task by ID.
 * @param {string} id - The unique identifier of the task.
 * @body {string} user_email - The email of the user.
 * @body {string} title - The task's title.
 * @body {string} detail - The task's details.
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224
 * @access Public
 */
router.put("/:id", (req, res) => TaskController.update(req, res));

/**
<<<<<<< HEAD
 * @route DELETE /users/:id
 * @description Delete a user by ID.
 * @param {string} id - The unique identifier of the user.
=======
 * @route DELETE /tasks/:id
 * @description Delete a task by ID.
 * @param {string} id - The unique identifier of the task.
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224
 * @access Public
 */
router.delete("/:id", (req, res) => TaskController.delete(req, res));

/**
 * Export the router instance to be mounted in the main routes file.
 */
module.exports = router;
