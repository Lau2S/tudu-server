const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await this.dao.findByEmail(email);

      if (!user) {
        return res
          .status(202)
          .json({ message: "Si el correo es válido recibirá instrucciones" });
      }

      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1h
      await user.save({ validateBeforeSave: false });

      const resetUrl = `https://tudu-client.vercel.app/api/v1/users/auth/reset-password/${resetToken}`;
      await sendEmail(
        user.email,
        "Restablecer contraseña",
        `Haz clic en este enlace para restablecer tu contraseña: ${resetUrl}`
      );

      return res
        .status(200)
        .json({ message: "Revisa tu correo para continuar" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Inténtalo de nuevo más tarde" });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ message: "Las contraseñas no coinciden" });
      }

      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!regex.test(password)) {
        return res.status(400).json({
          message:
            "La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findOne({
        _id: decoded.userId,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }

      user.password = password;

      // Invalidar token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      return res.status(200).json({ message: "Contraseña actualizada" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Inténtalo de nuevo más tarde" });
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
