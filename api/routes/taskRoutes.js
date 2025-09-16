const express = require("express");
const router = express.Router();

const TaskController = require("../controllers/TaskController");
const verify = require("../middleware/verifyToken");
const TaskDAO = require("../dao/TaskDAO");

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
router.post("/", verify, (req, res) => TaskController.create(req, res));

router.get("/", verify, (req, res) => TaskController.getAllByUser(req, res));

/**
 * @route PUT /tasks/:id
 * @description Update an existing task by ID.
 * @param {string} id - The unique identifier of the task.
 * @body {string} user_email - The email of the user.
 * @body {string} title - The task's title.
 * @body {string} detail - The task's details.
 * @access Public
 */
router.put("/:id", verify, (req, res) => {
  try {
    const { id } = req.params;

    const task = TaskDAO.model.findOne({
      _id: id,
      user_email: req.user.email,
    });

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    TaskController.update(req, res);
  } catch (error) {
    res.status(500).json({
      message: "No pudimos actualizar tu tarea, inténtalo de nuevo más tarde",
      error: error.message,
    });
  }
});

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
