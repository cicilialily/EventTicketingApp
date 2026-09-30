import apiRequest from "./api";

export async function getEventTicketTypes(eventId) {
  if (!eventId) {
    throw new Error("Event ID is required.");
  }

  const event = await apiRequest(`/events/${encodeURIComponent(eventId)}`);

  return Array.isArray(event?.ticketTypes) ? event.ticketTypes : [];
}
