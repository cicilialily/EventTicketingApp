import { registerSchema, loginSchema } from "../validators/auth.validator.js";

import { registerUser, loginUser } from "../services/auth.service.js";

import { revokeAccessToken } from "../services/token.service.js";

function formatValidationErrors(issues) {
  const errors = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export async function register(req, res) {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatValidationErrors(validation.error.issues),
      data: null,
    });
  }

  try {
    const user = await registerUser(validation.data);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.code === "EMAIL_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
        data: null,
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
      data: null,
    });
  }
}

export async function login(req, res) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatValidationErrors(validation.error.issues),
      data: null,
    });
  }

  try {
    const result = await loginUser(validation.data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error.code === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        data: null,
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
      data: null,
    });
  }
}
export async function logout(req, res) {
  try {
    await revokeAccessToken(req.user.jti, req.user.expiresAt);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
      data: null,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(200).json({
        success: true,
        message: "Logout successful",
        data: null,
      });
    }

    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout",
      data: null,
    });
  }
}
