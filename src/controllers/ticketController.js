import prisma from "../config/database.js";
import { generateQrPng } from "../services/qrService.js";

export async function getTicketQr(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: {
        id: true,
        ticketNumber: true,
        userId: true,
        qrCode: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (ticket.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this ticket.",
      });
    }

    const imageBuffer = await generateQrPng(ticket.qrCode);

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="ticket-${ticket.ticketNumber}.png"`,
    );

    return res.status(200).send(imageBuffer);
  } catch (error) {
    next(error);
  }
}
