import { getUserProfile } from "../services/user.service.js";

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
