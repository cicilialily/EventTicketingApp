import apiRequest from "./api";

export async function getMyTickets() {
  return apiRequest("/tickets/my-tickets");
}
