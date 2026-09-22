import prisma from "../config/database.js";

export async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error = new Error("User account not found.");
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  return user;
}
