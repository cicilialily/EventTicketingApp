import apiRequest from "./api";

export async function createOrder({ eventId, items }) {
  if (!eventId) {
    throw new Error("Event ID is required.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one ticket item is required.");
  }

  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify({
      eventId,
      items: items.map((item) => ({
        ticketTypeId: item.ticketTypeId,
        quantity: Number(item.quantity),
      })),
    }),
  });
}

export async function payOrder(orderId) {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  return apiRequest(`/orders/${encodeURIComponent(orderId)}/pay`, {
    method: "POST",
  });
}
