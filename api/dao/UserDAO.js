const User = require("../models/User");
const GlobalDAO = require("./GlobalDAO");

/**
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
   * all inherited CRUD methods operate on the User collection.
   */
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    try {
      const document = await this.model.findOne({ email: email });
      if (!document) throw new Error("Correo o contraseña inválidos");
      return document;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

/**
 * Export a singleton instance of UserDAO.
 *
 * This ensures the same DAO instance is reused across the app,
 * avoiding redundant instantiations.
 */
module.exports = new UserDAO();
