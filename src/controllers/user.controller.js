import { changePasswordSchema } from "../validators/auth.validator.js";

import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../services/user.service.js";

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

export async function getMyProfile(req, res) {
  try {
    const user = await getUserProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User account not found",
        data: null,
      });
    }

    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user profile",
      data: null,
    });
  }
}

export async function updateMyProfile(req, res) {
  const validation = changeProfileSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatValidationErrors(validation.error.issues),
      data: null,
    });
  }

  try {
    const user = await updateUserProfile(req.user.id, validation.data);

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User account not found",
        data: null,
      });
    }

    if (error.code === "EMAIL_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
        data: null,
      });
    }

    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user profile",
      data: null,
    });
  }
}

export async function changePassword(req, res) {
  const validation = changePasswordSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatValidationErrors(validation.error.issues),
      data: null,
    });
  }

  try {
    await changeUserPassword(
      req.user.id,
      validation.data.currentPassword,
      validation.data.newPassword,
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
      data: null,
    });
  } catch (error) {
    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User account not found",
        data: null,
      });
    }

    if (error.code === "INVALID_CURRENT_PASSWORD") {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
        data: null,
      });
    }

    if (error.code === "PASSWORD_UNCHANGED") {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
        data: null,
      });
    }

    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password",
      data: null,
    });
  }
}
