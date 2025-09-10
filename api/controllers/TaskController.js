const GlobalController = require("./GlobalController");
const TaskDAO = require("../dao/TaskDAO");

/**
<<<<<<< HEAD
 * Controller class for managing User resources.
 * 
=======
 * Controller class for managing Task resources.
 *
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224
 * Extends the generic {@link GlobalController} to inherit
 * CRUD operations, using the {@link TaskDAO} as the data access layer.
 */
class TaskController extends GlobalController {
<<<<<<< HEAD
    /**
     * Create a new UserController instance.
     * 
     * The constructor passes the UserDAO to the parent class so that
     * all inherited methods (create, read, update, delete, getAll)
     * operate on the User model.
     */
    constructor() {
        super(TaskDAO);
    }
}

/**
 * Export a singleton instance of UserController.
 * 
=======
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

  async create(req, res) {
    try {
      const { title, detail, date, state } = req.body;

      const user_email = req.user.email;

      const newTask = await this.dao.create({
        user_email,
        title,
        detail,
        date,
        state,
      });

      res.status(201).json({
        message: "Tarea creada exitosamente",
        taskId: newTask._id,
        task: newTask,
      });
    } catch (error) {
      res.status(500).json({
        message: "No pudimos guardar tu tarea, inténtalo de nuevo más tarde",
        error: error.message,
      });
    }
  }

  async getAllByUser(req, res) {
    try {
      const user_email = req.user.email;
      const tasks = await this.dao.model
        .find({ user_email })
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({
        message: "No pudimos obtener tus tareas, inténtalo de nuevo más tarde",
        error: error.message,
      });
    }
  }
}

/**
 * Export a singleton instance of TaskController.
 *
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224
 * This allows the same controller to be reused across routes
 * without creating multiple instances.
 */
module.exports = new TaskController();
