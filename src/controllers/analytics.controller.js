import { getOrganizerAnalytics } from "../services/analytics.service.js";

export async function getAnalytics(req, res) {
  try {
    const analytics = await getOrganizerAnalytics(req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: "Analytics retrieved successfully",
      data: analytics,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve analytics",
      data: null,
    });
  }
}
