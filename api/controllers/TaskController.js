const GlobalController = require("./GlobalController");
const TaskDAO = require("../dao/TaskDAO");

/**
 * Controller class for managing Task resources.
 *
 * Extends the generic {@link GlobalController} to inherit
 * CRUD operations, using the {@link TaskDAO} as the data access layer.
 */
class TaskController extends GlobalController {
  /**
   * Create a new TaskController instance.
   *
   * The constructor passes the TaskDAO to the parent class so that
   * all inherited methods (create, read, update, delete, getAll)
   * operate on the Task model.
   */
  constructor() {
    super(TaskDAO);
  }
}

/**
 * Export a singleton instance of UserController.
 *
 * This allows the same controller to be reused across routes
 * without creating multiple instances.
 */
module.exports = new TaskController();
