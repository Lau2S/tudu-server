/**
 * @fileoverview User controller for authentication and user management operations.
 * Provides login, password reset, account locking, and user-specific functionality.
 * @author Tudu Development Team
 * @version 1.0.0
 * @requires ./GlobalController
 * @requires ../dao/UserDAO
 * @requires jsonwebtoken
 * @requires ../utils/sendEmail
 * @requires ../models/User
 * @requires bcryptjs
 */

const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * Controller class for managing User resources and authentication.
 * Extends the generic {@link GlobalController} to inherit CRUD operations,
 * while adding specialized methods for login, password reset, and account management.
 *
 * @class UserController
 * @extends GlobalController
 * @description Specialized controller for user authentication and management
 *
 * @example
 * // Login user
 * POST /api/users/login
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123!"
 * }
 *
 * @example
 * // Reset password request
 * POST /api/users/forgot-password
 * {
 *   "email": "user@example.com"
 * }
 */
class UserController extends GlobalController {
  /**
   * Create a new UserController instance.
   * The constructor passes the UserDAO to the parent class so that
   * all inherited methods (create, read, update, delete, getAll)
   * operate on the User model.
   *
   * @constructor
   * @description Initializes UserController with UserDAO for database operations
   */
  constructor() {
    super(UserDAO);
  }

  async read(req, res) {
    const email = req.user.email;
    try {
      const user = await this.dao.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Exclude sensitive fields before sending response
      const {
        password,
        resetPasswordToken,
        resetPasswordExpires,
        ...userData
      } = user.toObject();
      res.status(200).json(userData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "No pudimos obtener tu perfil" });
    }
  }

  async update(req, res) {
    try {
      if (req.body.email && req.body.email != req.user.email) {
        const existingEmail = await this.dao.existsByEmail(req.body.email);

        if (existingEmail) {
          return res.status(409).json({ message: "Email already in use" });
        }
      }

      const { password, ...otherUpdates } = req.body;

      const item = await this.dao.update(req.params.id, otherUpdates);

      res.status(200).json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "No pudimos actualizar tu perfil" });
    }
  }

  /**
   * Authenticate user and generate JWT token.
   * Validates credentials, checks account status, and returns authentication token.
   *
   * @async
   * @method login
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.email - User's email address
   * @param {string} req.body.password - User's password
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends JWT token on success or error message on failure
   * @description Authenticates user and provides access token
   *
   * @example
   * // Successful login
   * // Request: POST /api/users/login
   * // Body: { "email": "user@example.com", "password": "correct123" }
   * // Response: 200 { "message": "Login successful", "token": "eyJhbGciOiJIUzI1NiIs..." }
   *
   * @example
   * // Invalid credentials
   * // Response: 401 { "message": "Correo o contraseña inválidos" }
   *
   * @example
   * // Locked account
   * // Response: 423 { "message": "Cuenta temporalmente bloqueada" }
   */
  async login(req, res) {
    const { email, password } = req.body;
    try {
      /**
       * Find user by email using DAO.
       * Throws error if user not found.
       */
      const user = await this.dao.findByEmail(email);

      /**
       * Validate password against stored hash.
       * Uses bcrypt comparison from User model method.
       */
      const isMatch = await user.validatePassword(password);

      /**
       * Reject login if password doesn't match.
       */
      if (!isMatch) throw new Error("Correo o contraseña inválidos");

      /**
       * Check if account is locked.
       * Prevent login for security reasons.
       */
      if (user.isLocked) {
        return res
          .status(423)
          .json({ message: "Cuenta temporalmente bloqueada" });
      }

      /**
       * Generate JWT token with user information.
       * Token expires in 2 hours for security.
       */
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      /**
       * Return successful login with token.
       */
      res.status(200).json({ message: "Login successful", token: token });
    } catch (error) {
      /**
       * Return authentication error.
       * Generic message for security.
       */
      res.status(401).json({ message: error.message });
    }
  }

  /**
   * Lock a user account to prevent login.
   * Administrative function to temporarily disable user access.
   *
   * @async
   * @method lock
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.email - Email of user to lock
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends confirmation or error message
   * @description Locks user account for security purposes
   *
   * @example
   * // Lock user account
   * // Request: POST /api/users/lock
   * // Body: { "email": "user@example.com" }
   * // Response: 200 { "message": "Cuenta bloqueada", "user": { ... } }
   *
   * @example
   * // User not found
   * // Response: 404 { "message": "Usuario no encontrado" }
   */
  async lock(req, res) {
    try {
      const { email } = req.body;

      /**
       * Find and update user to locked status.
       * Uses findOneAndUpdate for atomic operation.
       */
      const user = await this.dao.findOneAndUpdate(
        { email },
        { isLocked: true },
        { new: true }
      );

      /**
       * Check if user exists.
       */
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      /**
       * Return success confirmation.
       */
      return res.status(200).json({ message: "Cuenta bloqueada", user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Inténtalo de nuevo más tarde" });
    }
  }

  /**
   * Unlock a user account to restore login access.
   * Administrative function to re-enable user access.
   *
   * @async
   * @method unlock
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.email - Email of user to unlock
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends confirmation or error message
   * @description Unlocks user account to restore access
   *
   * @example
   * // Unlock user account
   * // Request: POST /api/users/unlock
   * // Body: { "email": "user@example.com" }
   * // Response: 200 { "message": "Cuenta desbloqueada", "user": { ... } }
   *
   * @example
   * // User not found
   * // Response: 404 { "message": "Usuario no encontrado" }
   */
  async unlock(req, res) {
    try {
      const { email } = req.body;

      /**
       * Find and update user to unlocked status.
       * Uses findOneAndUpdate for atomic operation.
       */
      const user = await this.dao.findOneAndUpdate(
        { email },
        { isLocked: false },
        { new: true }
      );

      /**
       * Check if user exists.
       */
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      /**
       * Return success confirmation.
       */
      return res.status(200).json({ message: "Cuenta desbloqueada", user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al desbloquear usuario" });
    }
  }

  /**
   * Initiate password reset process by sending reset email.
   * Generates secure token and sends reset instructions to user's email.
   *
   * @async
   * @method forgotPassword
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.email - User's email address
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends confirmation message regardless of email validity
   * @description Initiates password reset process with email verification
   *
   * @example
   * // Request password reset
   * // Request: POST /api/users/forgot-password
   * // Body: { "email": "user@example.com" }
   * // Response: 200 { "message": "Revisa tu correo para continuar" }
   *
   * @example
   * // Invalid email (same response for security)
   * // Response: 202 { "message": "Si el correo es válido recibirá instrucciones" }
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      /**
       * Find user by email.
       * May throw error if user doesn't exist.
       */
      const user = await this.dao.findByEmail(email);

      /**
       * Return generic message if user not found.
       * Prevents email enumeration attacks.
       */
      if (!user) {
        return res
          .status(202)
          .json({ message: "Si el correo es válido recibirá instrucciones" });
      }

      /**
       * Generate secure reset token.
       * Token expires in 1 hour for security.
       */
      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      /**
       * Store reset token and expiration in user document.
       * Skip validation to allow token storage.
       */
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save({ validateBeforeSave: false });

      /**
       * Create password reset URL.
       * Points to frontend recovery page.
       */
      const resetUrl = `https://tudu-client.vercel.app/#/recovery-password/${resetToken}`;

      /**
       * Send reset email with instructions.
       * Uses email utility service.
       */
      await sendEmail(
        user.email,
        "Restablecer contraseña",
        `Haz clic en este enlace para restablecer tu contraseña: ${resetUrl}`
      );

      /**
       * Return success confirmation.
       */
      return res
        .status(200)
        .json({ message: "Revisa tu correo para continuar" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Inténtalo de nuevo más tarde" });
    }
  }

  /**
   * Reset user password using valid reset token.
   * Validates token, password strength, and updates user password securely.
   *
   * @async
   * @method resetPassword
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.token - Password reset token from URL
   * @param {Object} req.body - Request body
   * @param {string} req.body.password - New password
   * @param {string} req.body.confirmPassword - Password confirmation
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends confirmation or error message
   * @description Completes password reset process with token validation
   *
   * @example
   * // Reset password successfully
   * // Request: POST /api/users/reset-password/eyJhbGciOiJIUzI1NiIs...
   * // Body: { "password": "NewSecure123!", "confirmPassword": "NewSecure123!" }
   * // Response: 200 { "message": "Contraseña actualizada" }
   *
   * @example
   * // Password mismatch
   * // Response: 400 { "message": "Las contraseñas no coinciden" }
   *
   * @example
   * // Weak password
   * // Response: 400 { "message": "La contraseña debe tener al menos 8 caracteres..." }
   *
   * @example
   * // Invalid/expired token
   * // Response: 400 { "message": "Token inválido o expirado" }
   */
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      /**
       * Validate password confirmation match.
       */
      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ message: "Las contraseñas no coinciden" });
      }

      /**
       * Validate password strength requirements.
       * Must contain: 8+ chars, uppercase, lowercase, number, special char.
       */
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!regex.test(password)) {
        return res.status(400).json({
          message:
            "La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial",
        });
      }

      /**
       * Verify and decode reset token.
       * Throws error if token is invalid or expired.
       */
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      /**
       * Find user with valid reset token.
       * Ensures token hasn't been used and hasn't expired.
       */
      const user = await User.findOne({
        _id: decoded.userId,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      /**
       * Reject if user not found or token invalid.
       */
      if (!user) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }

      /**
       * Update user password.
       * Password will be automatically hashed by User model pre-save hook.
       */
      user.password = password;

      /**
       * Invalidate reset token for security.
       * Prevents token reuse.
       */
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      /**
       * Save updated user.
       * Triggers password hashing middleware.
       */
      await user.save();

      /**
       * Return success confirmation.
       */
      return res.status(200).json({ message: "Contraseña actualizada" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Inténtalo de nuevo más tarde" });
    }
  }
}

/**
 * Export a singleton instance of UserController.
 * This allows the same controller to be reused across routes
 * without creating multiple instances, maintaining state consistency.
 *
 * @type {UserController}
 * @description Singleton instance for user management operations
 * @example
 * // Import and use in routes
 * const userController = require('../controllers/UserController');
 * router.post('/login', userController.login.bind(userController));
 */
module.exports = new UserController();
