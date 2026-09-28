import apiRequest from "./api";

function formatEventDate(value) {
  if (!value) {
    return "Date to be announced";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date to be announced";
  }

  return date.toLocaleDateString("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getEventImage(event) {
  if (event?.images?.length) {
    const primaryImage = event.images.find((image) => image.isPrimary);

    return primaryImage?.imageUrl || event.images[0]?.imageUrl || "";
  }

  return event?.imageUrl || "";
}

function getLowestTicketPrice(event) {
  if (!Array.isArray(event?.ticketTypes)) {
    return null;
  }

  const prices = event.ticketTypes
    .map((ticketType) => Number(ticketType.price))
    .filter((price) => Number.isFinite(price));

  if (!prices.length) {
    return null;
  }

  return Math.min(...prices);
}

export function normalizeEvent(event) {
  if (!event) {
    return null;
  }

  return {
    ...event,

    date: formatEventDate(event.startDate),

    location:
      [event.venue, event.address].filter(Boolean).join(", ") ||
      "Location to be announced",

    category: event.category?.name || event.category || "Event",

    image: getEventImage(event),

    price: getLowestTicketPrice(event),
  };
}

export async function getEvents() {
  const data = await apiRequest("/events");

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeEvent).filter(Boolean);
}

export async function getEventById(id) {
  if (!id) {
    throw new Error("Event ID is required.");
  }

  const data = await apiRequest(`/events/${encodeURIComponent(id)}`);

  return normalizeEvent(data);
}

export async function createEvent(eventData) {
  return apiRequest("/events", {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

export async function updateEvent(id, eventData) {
  if (!id) {
    throw new Error("Event ID is required.");
  }

  return apiRequest(`/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(eventData),
  });
}

export async function deleteEvent(id) {
  if (!id) {
    throw new Error("Event ID is required.");
  }

  return apiRequest(`/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
