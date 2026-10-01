const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getMyTickets() {
  const token = localStorage.getItem("eventTicketingToken");

  const response = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || "Unable to retrieve your tickets.");
  }

  return payload?.data ?? [];
}

export async function getTicketQr(ticketId) {
  if (!ticketId) {
    throw new Error("Ticket ID is required.");
  }

  const token = localStorage.getItem("eventTicketingToken");

  const response = await fetch(
    `${API_BASE_URL}/tickets/${encodeURIComponent(ticketId)}/qr`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    let message = "Unable to load the ticket QR code.";

    try {
      const payload = await response.json();
      message = payload?.message || message;
    } catch {
      // The response may not be JSON.
    }

    throw new Error(message);
  }

  return response.blob();
}
