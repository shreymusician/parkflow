const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* ── helpers ─────────────────────────────────────────────────── */

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'fallback_secret_for_dev',
    { expiresIn: '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
};

/**
 * Convert raw MongoDB / Mongoose errors into human-readable messages.
 * Returns { status, error, field } — field is optional (for inline highlighting).
 */
const parseError = (err) => {
  // Duplicate key (unique index violation)
  if (err.code === 11000 || err.code === 11001) {
    const keyPattern = err.keyPattern || {};
    const keyValue   = err.keyValue   || {};

    if (keyPattern.email || keyValue.email) {
      return {
        status: 409,
        error: 'This email address is already registered. Please sign in instead.',
        field: 'email',
      };
    }
    if (keyPattern.mobileNumber || keyValue.mobileNumber) {
      return {
        status: 409,
        error: 'This mobile number is already linked to an account.',
        field: 'mobileNumber',
      };
    }
    return { status: 409, error: 'An account with these details already exists.' };
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return { status: 400, error: messages[0] };
  }

  // Fallback — never expose raw DB internals
  return { status: 400, error: 'Something went wrong. Please try again.' };
};

/* ── controllers ─────────────────────────────────────────────── */

exports.register = async (req, res) => {
  try {
    const { name, email, mobileNumber, password } = req.body;

    if (!name || !email || !mobileNumber || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number must be exactly 10 digits.',
        field: 'mobileNumber',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters.',
        field: 'password',
      });
    }

    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, mobileNumber, passwordHash, role: 'USER' });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    const { status, error, field } = parseError(err);
    res.status(status).json({ success: false, error, ...(field ? { field } : {}) });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password.' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || user.isDeleted) {
      return res.status(401).json({
        success: false,
        error: 'No account found with that email address.',
        field: 'email',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password. Please try again.',
        field: 'password',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    const { status, error } = parseError(err);
    res.status(status).json({ success: false, error });
  }
};
