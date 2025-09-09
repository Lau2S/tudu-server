const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * Controller class for managing User resources.
 */
class UserController extends GlobalController {
  constructor() {
    super(UserDAO);
  }

  /**
   * Create a new user - Implementación específica para asegurar hash de contraseña
   */
  async create(req, res) {
    try {
      console.log("=== REGISTRO DE USUARIO ===");
      console.log("Datos recibidos:", req.body);

      const { username, email, password, firstName, lastName, age } = req.body;

      // Validar campos requeridos
      if (!username || !email || !password) {
        return res.status(400).json({
          message: "Username, email y password son requeridos"
        });
      }

      console.log("Contraseña recibida:", password.substring(0, 3) + "...");

      // HASHEAR LA CONTRASEÑA MANUALMENTE ANTES DE CREAR EL USUARIO
      console.log("Hasheando contraseña manualmente...");
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log("Contraseña hasheada:", hashedPassword.substring(0, 15) + "...");

      // Crear usuario con contraseña ya hasheada
      const userData = {
        username,
        email,
        password: hashedPassword, // Ya hasheada
        firstName,
        lastName,
        age: age ? parseInt(age) : undefined
      };

      console.log("Creando usuario con datos:", {
        ...userData,
        password: userData.password.substring(0, 15) + "..."
      });

      // Crear directamente con el modelo para mayor control
      const newUser = new User(userData);

      // Como la contraseña ya está hasheada, marcarla como no modificada
      // para evitar que el middleware pre('save') la vuelva a hashear
      newUser.markModified('username');
      newUser.markModified('email');
      // NO marcar password como modified para que no se vuelva a hashear

      const savedUser = await newUser.save();

      console.log("Usuario guardado exitosamente:");
      console.log("- ID:", savedUser._id);
      console.log("- Email:", savedUser.email);

      // Verificar en DB que la contraseña se guardó
      const userInDB = await User.findById(savedUser._id);
      console.log("Verificación en DB - Contraseña guardada:", userInDB.password.substring(0, 15) + "...");

      res.status(201).json(savedUser.toJSON());
    } catch (error) {
      console.error("Error en create:", error);

      // Manejar errores de duplicación
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          message: `Ya existe un usuario con ese ${field}`
        });
      }

      // Manejar errores de validación
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          message: messages.join('. ')
        });
      }

      res.status(500).json({
        message: "Error interno del servidor: " + error.message
      });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    console.log("=== LOGIN DE USUARIO ===");
    console.log("Email:", email);

    try {
      const user = await this.dao.findByEmail(email);
      console.log("Usuario encontrado:", user.email);
      console.log("Contraseña en DB:", user.password.substring(0, 15) + "...");

      const isMatch = await user.validatePassword(password);
      console.log("Contraseña válida:", isMatch);

      if (!isMatch) throw new Error("Correo o contraseña inválidos");

      if (user.isLocked) {
        return res.status(423).json({ message: "Cuenta temporalmente bloqueada" });
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      console.log("Login exitoso, token generado");
      res.status(200).json({ message: "Login successful", token: token });
    } catch (error) {
      console.error("Error en login:", error.message);
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

      const resetUrl = `https://tudu-client.vercel.app/auth/reset-password/${resetToken}`;
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

module.exports = new UserController();