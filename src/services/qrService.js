import QRCode from "qrcode";

export async function generateQrPng(token) {
  if (!token) {
    const error = new Error("QR code data is missing.");
    error.statusCode = 400;
    throw error;
  }

  return QRCode.toBuffer(token, {
    type: "png",
    margin: 1,
    width: 220,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}
