import { verifyAccessToken } from "../utils/jwt.js";
import { isAccessTokenRevoked } from "../services/token.service.js";

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      data: null,
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header",
      data: null,
    });
  }

  try {
    const payload = verifyAccessToken(token);

    if (!payload.jti || !payload.sub || !payload.exp) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
        data: null,
      });
    }

    const revoked = await isAccessTokenRevoked(payload.jti);

    if (revoked) {
      return res.status(401).json({
        success: false,
        message: "Access token has been revoked",
        data: null,
      });
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
      jti: payload.jti,
      expiresAt: new Date(payload.exp * 1000),
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
      data: null,
    });
  }
}
