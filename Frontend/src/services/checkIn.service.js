import apiRequest from "./api";

export async function checkInTicket(qrCode) {
  if (!qrCode || typeof qrCode !== "string") {
    throw new Error("QR code is required.");
  }

  return apiRequest("/tickets/check-in", {
    method: "POST",
    body: JSON.stringify({
      qrCode,
    }),
  });
}
