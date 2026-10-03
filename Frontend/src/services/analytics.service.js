import apiRequest from "./api";

export async function getOrganizerAnalytics() {
  return apiRequest("/analytics");
}
