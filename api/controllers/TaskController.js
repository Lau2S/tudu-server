/**
 * @fileoverview Task controller for task management operations.
 * Provides task creation, retrieval, and user-specific task operations.
 * @author Tudu Development Team
 * @version 1.0.0
 * @requires ./GlobalController
 * @requires ../dao/TaskDAO
 */

const GlobalController = require("./GlobalController");
const TaskDAO = require("../dao/TaskDAO");

/**
 * Controller class for managing Task resources.
 * Extends the generic {@link GlobalController} to inherit CRUD operations,
 * while adding specialized methods for user-specific task management.
 *
 * @class TaskController
 * @extends GlobalController
 * @description Specialized controller for task management operations
 *
 * @example
 * // Create new task
 * POST /api/tasks
 * {
 *   "title": "Complete documentation",
 *   "detail": "Write JSDoc for all modules",
 *   "date": "2025-01-15T10:30:00.000Z",
 *   "state": "Por Hacer"
 * }
 *
 * @example
 * // Get user's tasks
 * GET /api/tasks/user
 * // Returns tasks sorted by creation date (newest first)
 */
class TaskController extends GlobalController {
  /**
   * Create a new TaskController instance.
   * The constructor passes the TaskDAO to the parent class so that
   * all inherited methods (create, read, update, delete, getAll)
   * operate on the Task model.
   *
   * @constructor
   * @description Initializes TaskController with TaskDAO for database operations
   */
  constructor() {
    super(TaskDAO);
  }

  /**
   * Create a new task for the authenticated user.
   * Extracts user information from JWT token and associates task with user.
   *
   * @async
   * @method create
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.body - Request body with task data
   * @param {string} req.body.title - Task title (required, max 50 chars)
   * @param {string} [req.body.detail] - Task description (optional, max 500 chars)
   * @param {string} req.body.date - Task due date (required, ISO format)
   * @param {string} [req.body.state] - Task state (optional, defaults to "Por Hacer")
   * @param {Object} req.user - User information from JWT token
   * @param {string} req.user.email - User's email address
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends created task or error message
   * @description Creates new task associated with authenticated user
   *
   * @example
   * // Successful task creation
   * // Request: POST /api/tasks
   * // Headers: { "Authorization": "Bearer <valid_jwt_token>" }
   * // Body: {
   * //   "title": "Review code",
   * //   "detail": "Review PR #123 for security issues",
   * //   "date": "2025-01-15T14:00:00.000Z",
   * //   "state": "Por Hacer"
   * // }
   * // Response: 201 {
   * //   "message": "Tarea creada exitosamente",
   * //   "taskId": "507f1f77bcf86cd799439011",
   * //   "task": { "_id": "...", "title": "Review code", ... }
   * // }
   *
   * @example
   * // Validation error
   * // Response: 500 {
   * //   "message": "No pudimos guardar tu tarea, inténtalo de nuevo más tarde",
   * //   "error": "Title is required"
   * // }
   *
   * @example
   * // Title too long
   * // Response: 500 {
   * //   "message": "No pudimos guardar tu tarea, inténtalo de nuevo más tarde",
   * //   "error": "Title exceeds maximum length of 50 characters"
   * // }
   */
  async create(req, res) {
    try {
      const { title, detail, date, state } = req.body;

      /**
       * Extract user email from JWT token.
       * Token was verified by verifyToken middleware.
       */
      const userId = req.user.userId;

      /**
       * Create new task with user association.
       * DAO handles validation and database insertion.
       */
      const newTask = await this.dao.create({
        userId,
        title,
        detail,
        date,
        state,
      });

      /**
       * Return success response with task details.
       */
      res.status(201).json({
        message: "Tarea creada exitosamente",
        taskId: newTask._id,
        task: newTask,
      });
    } catch (error) {
      /**
       * Handle validation and database errors.
       * Provides user-friendly error message.
       */
      res.status(500).json({
        message: "No pudimos guardar tu tarea, inténtalo de nuevo más tarde",
        error: error.message,
      });
    }
  }

  /**
   * Retrieve all tasks for the authenticated user.
   * Returns tasks sorted by creation date (newest first) for better UX.
   *
   * @async
   * @method getAllByUser
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.user - User information from JWT token
   * @param {string} req.user.email - User's email address
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends array of user's tasks or error message
   * @description Retrieves all tasks belonging to authenticated user
   *
   * @example
   * // Get user's tasks
   * // Request: GET /api/tasks/user
   * // Headers: { "Authorization": "Bearer <valid_jwt_token>" }
   * // Response: 200 [
   * //   {
   * //     "_id": "507f1f77bcf86cd799439011",
   * //     "user_email": "user@example.com",
   * //     "title": "Recent task",
   * //     "detail": "Most recent task appears first",
   * //     "state": "Por Hacer",
   * //     "date": "2025-01-15T10:00:00.000Z",
   * //     "createdAt": "2025-01-10T08:30:00.000Z",
   * //     "updatedAt": "2025-01-10T08:30:00.000Z"
   * //   },
   * //   {
   * //     "_id": "507f1f77bcf86cd799439012",
   * //     "user_email": "user@example.com",
   * //     "title": "Older task",
   * //     "state": "Hecho",
   * //     "createdAt": "2025-01-09T15:20:00.000Z"
   * //   }
   * // ]
   *
   * @example
   * // No tasks found (empty array)
   * // Response: 200 []
   *
   * @example
   * // Database error
   * // Response: 500 {
   * //   "message": "No pudimos obtener tus tareas, inténtalo de nuevo más tarde",
   * //   "error": "Database connection error"
   * // }
   */
  async getAllByUser(req, res) {
    try {
      /**
       * Extract user email from JWT token.
       * Used to filter tasks by ownership.
       */
      const userId = req.user.userId;

      /**
       * Find tasks belonging to user.
       * Sort by creation date descending (newest first).
       * Uses direct model access for custom sorting.
       */
      const tasks = await this.dao.model
        .find({ userId })
        .sort({ createdAt: -1 });

      /**
       * Return user's tasks.
       */
      res.json(tasks);
    } catch (error) {
      /**
       * Handle database and query errors.
       * Provides user-friendly error message.
       */
      res.status(500).json({
        message: "No pudimos obtener tus tareas, inténtalo de nuevo más tarde",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, detail, date, state } = req.body;

      const dateValue = new Date(date);

      if (dateValue <= new Date()) {
        return res.status(400).json({
          message: "La fecha debe ser futura",
        });
      }

      const updatedTask = await this.dao.update(id, {
        title,
        detail,
        date,
        state,
      });

      res.status(200).json({
        message: "Tarea actualizada",
        task: updatedTask,
      });
    } catch (error) {
      res.status(500).json({
        message: "No pudimos actualizar tu tarea, inténtalo de nuevo más tarde",
        error: error.message,
      });
    }
  }
}

/**
 * Export a singleton instance of TaskController.
 * This allows the same controller to be reused across routes
 * without creating multiple instances, maintaining state consistency.
 *
 * @type {TaskController}
 * @description Singleton instance for task management operations
 * @example
 * // Import and use in routes
 * const taskController = require('../controllers/TaskController');
 * router.post('/tasks', verifyToken, taskController.create.bind(taskController));
 * router.get('/tasks/user', verifyToken, taskController.getAllByUser.bind(taskController));
 */

module.exports = new TaskController();
