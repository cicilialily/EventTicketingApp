import apiRequest from "./api";

export async function getMyEvents() {
  return apiRequest("/events/my-events");
}

export async function createManagedEvent(eventData) {
  if (!eventData || typeof eventData !== "object") {
    throw new Error("Event data is required.");
  }

  return apiRequest("/events", {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

export async function updateManagedEvent(eventId, eventData) {
  if (!eventId) {
    throw new Error("Event ID is required.");
  }

  return apiRequest(`/events/${encodeURIComponent(eventId)}`, {
    method: "PUT",
    body: JSON.stringify(eventData),
  });
}

export async function cancelManagedEvent(eventId) {
  if (!eventId) {
    throw new Error("Event ID is required.");
  }

  return apiRequest(`/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
  });
}

export async function getEventCategories() {
  return apiRequest("/events/categories");
}
