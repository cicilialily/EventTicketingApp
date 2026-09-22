import prisma from "../config/database.js";
import { hashPassword } from "../utils/password.js";

export async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.code = "EMAIL_EXISTS";
    throw error;
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "USER",
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

    return user;
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
