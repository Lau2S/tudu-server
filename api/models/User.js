const mongoose = require("mongoose");
const { isEmail, isStrongPassword } = require("validator");
const bcrypt = require("bcryptjs");
const SALT_WORK_FACTOR = 10;
/**
 * User schema definition.
 *
 * Represents application users stored in MongoDB.
 * Includes authentication fields and automatic timestamps.
 */

isValidPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return passwordRegex.test(password);
};

const UserSchema = new mongoose.Schema(
<<<<<<< HEAD
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        // Debe ser hasheado la contraseña
        age: { type: Number, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
=======
  {
    /**
     * The unique username of the user.
     * @type {String}
     * @required
     */
    username: { type: String },
    /**
     * The password of the user.
     * Stored as plain text here, but should be hashed
     * before saving in a production environment.
     * @type {String}
     * @required
     */
    password: {
      type: String,
      required: true,
      hash: true,
      validate: [isValidPassword, "Password not strong enough"],
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224
    },

    firstName: { type: String, required: true },

    lastName: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [isEmail, "Invalid email"],
    },

    age: { type: Number, min: 13 },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    isLocked: { type: Boolean, default: false },
  },
  {
    /**
     * Adds `createdAt` and `updatedAt` timestamp fields automatically.
     */
    timestamps: true,
  }
);

<<<<<<< HEAD
=======
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.validatePassword = async function validatePassword(data) {
  return bcrypt.compare(data, this.password);
};

function adminKey(req, res, next) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}
>>>>>>> f9ad72cd48b1b6ff707c43653937926394706224

/**
 * Mongoose model for the User collection.
 * Provides an interface to interact with user documents.
 */
module.exports = mongoose.model("User", UserSchema);
module.exports.adminKey = adminKey;
