import { registerSchema } from "../validators/auth.validator.js";
import { registerUser } from "../services/auth.service.js";

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
