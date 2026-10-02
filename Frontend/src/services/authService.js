import apiRequest from "./api";

export async function registerUser(userData) {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: userData.name.trim(),
      email: userData.email.trim(),
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      role: userData.role,
    }),
  });

  return response.user;
}

export async function loginUser(credentials) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  });

  if (!response?.accessToken || !response?.user) {
    throw new Error("The server returned an invalid login response.");
  }

  return response;
}

export async function getCurrentUser() {
  const response = await apiRequest("/auth/me");

  return response.user;
}

export async function logoutUser() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export async function forgotPassword(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim(),
    }),
  });
}

export async function resetPassword(resetData) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token: resetData.token,
      newPassword: resetData.newPassword,
      confirmPassword: resetData.confirmPassword,
    }),
  });
}