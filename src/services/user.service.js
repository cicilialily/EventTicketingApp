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

export async function updateUserProfile(userId, data) {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    const error = new Error("User account not found.");
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name.trim();
  }

  if (data.email !== undefined) {
    const normalizedEmail = data.email.trim().toLowerCase();

    if (normalizedEmail !== existingUser.email) {
      const emailOwner = await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (emailOwner && emailOwner.id !== userId) {
        const error = new Error("An account with this email already exists.");

        error.code = "EMAIL_EXISTS";
        throw error;
      }

      updateData.email = normalizedEmail;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return getUserProfile(userId);
  }

  try {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      const duplicateError = new Error(
        "An account with this email already exists.",
      );

      duplicateError.code = "EMAIL_EXISTS";
      throw duplicateError;
    }

    throw error;
  }
}
