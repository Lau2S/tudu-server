const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");

/**
 * Controller class for managing User resources.
 *
 * Extends the generic {@link GlobalController} to inherit
 * CRUD operations, using the {@link UserDAO} as the data access layer.
 */
class UserController extends GlobalController {
  /**
   * Create a new UserController instance.
   *
   * The constructor passes the UserDAO to the parent class so that
   * all inherited methods (create, read, update, delete, getAll)
   * operate on the User model.
   */
  constructor() {
    super(UserDAO);
  }

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await this.dao.findByEmail(email);
      const isMatch = await user.validatePassword(password);

      if (!isMatch) throw new Error("Correo o contraseña inválidos");

      if (user.isLocked) {
        return res
          .status(423)
          .json({ message: "Cuenta temporalmente bloqueada" });
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );
      res.status(200).json({ message: "Login successful", token: token });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async lock(req, res) {
    try {
      const { email } = req.body;
      const user = await this.dao.findOneAndUpdate(
        { email },
        { isLocked: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({ message: "Cuenta bloqueada", user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Inténtalo de nuevo más tarde" });
    }
  }

  async unlock(req, res) {
    try {
      const { email } = req.body;
      const user = await this.dao.findOneAndUpdate(
        { email },
        { isLocked: false },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({ message: "Cuenta desbloqueada", user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al desbloquear usuario" });
    }
  }
}

/**
 * Export a singleton instance of UserController.
 *
 * This allows the same controller to be reused across routes
 * without creating multiple instances.
 */
module.exports = new UserController();
