import { getMyTickets } from "../services/myTickets.service.js";

export async function listMyTickets(req, res) {
  try {
    const tickets = await getMyTickets(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Tickets retrieved successfully",
      data: tickets,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("List my tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve tickets",
      data: null,
    });
  }
}
