const Task = require("../models/Task");
const GlobalDAO = require("./GlobalDAO");

/**
<<<<<<< HEAD
 * Data Access Object (DAO) for the User model.
 *
 * Extends the generic {@link GlobalDAO} class to provide
 * database operations (create, read, update, delete, getAll)
 * specifically for User documents.
 */
class UserDAO extends GlobalDAO {
  /**
   * Create a new UserDAO instance.
   *
   * Passes the User Mongoose model to the parent class so that
=======
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
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224
   * all inherited CRUD methods operate on the User collection.
   */
  constructor() {
    super(Task);
  }
}

/**
<<<<<<< HEAD
 * Export a singleton instance of UserDAO.
=======
 * Export a singleton instance of TaskDAO.
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224
 *
 * This ensures the same DAO instance is reused across the app,
 * avoiding redundant instantiations.
 */
<<<<<<< HEAD
module.exports = new UserDAO();
=======
module.exports = new TaskDAO();
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224
