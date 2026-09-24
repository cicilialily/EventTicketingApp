import prisma from "../config/database.js";

export async function revokeAccessToken(jti, expiresAt) {
  return prisma.revokedToken.create({
    data: {
      jti,
      expiresAt,
    },
  });
}

export async function isAccessTokenRevoked(jti) {
  const revokedToken = await prisma.revokedToken.findUnique({
    where: {
      jti,
    },
  });

  return Boolean(revokedToken);
}
