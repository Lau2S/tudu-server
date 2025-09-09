const Task = require("../models/Task");
const GlobalDAO = require("./GlobalDAO");

/**
 * Data Access Object (DAO) for the Task model.
 *
 * Extends the generic {@link GlobalDAO} class to provide
 * database operations (create, read, update, delete, getAll)
 * specifically for Task documents.
 */
class TaskDAO extends GlobalDAO {
  /**
   * Create a new TaskDAO instance.
   *
   * Passes the Task Mongoose model to the parent class so that
   * all inherited CRUD methods operate on the User collection.
   */
  constructor() {
    super(Task);
  }
}

/**
 * Export a singleton instance of TaskDAO.
 *
 * This ensures the same DAO instance is reused across the app,
 * avoiding redundant instantiations.
 */
module.exports = new TaskDAO();
