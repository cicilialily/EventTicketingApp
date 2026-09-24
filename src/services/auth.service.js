import prisma from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/jwt.js";

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

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    const error = new Error("Invalid email or password.");
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const accessToken = generateAccessToken({
    sub: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}
