import crypto from "node:crypto";

import prisma from "../config/database.js";
import { hashPassword } from "../utils/password.js";

const RESET_TOKEN_EXPIRY_MINUTES = 15;

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
  });

  if (!user) {
    return null;
  }

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);

  const expiresAt = new Date(
    Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
  );

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return {
    rawToken,
    expiresAt,
  };
}

export async function resetUserPassword({ token, newPassword }) {
  const tokenHash = hashResetToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!resetToken) {
    const error = new Error("Invalid or expired password reset token.");
    error.code = "INVALID_RESET_TOKEN";
    throw error;
  }

  if (resetToken.usedAt) {
    const error = new Error("Invalid or expired password reset token.");
    error.code = "INVALID_RESET_TOKEN";
    throw error;
  }

  if (resetToken.expiresAt <= new Date()) {
    const error = new Error("Invalid or expired password reset token.");
    error.code = "INVALID_RESET_TOKEN";
    throw error;
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        passwordHash,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    await transaction.passwordResetToken.update({
      where: {
        id: resetToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    });
  });
}
