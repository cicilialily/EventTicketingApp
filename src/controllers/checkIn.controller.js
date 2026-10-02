import { checkInTicketByQr } from "../services/checkIn.service.js";

export async function checkInTicket(req, res, next) {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: "QR code is required.",
        data: null,
      });
    }

    const ticket = await checkInTicketByQr(qrCode);

    return res.status(200).json({
      success: true,
      message: "Attendee checked in successfully.",
      data: ticket,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    console.error("Check-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check in attendee.",
      data: null,
    });
  }
}
