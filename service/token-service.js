import jwt from "jsonwebtoken";
import { TokenModel } from "../models/token-model.js";

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });

    return { accessToken, refreshToken };
  }

  validateAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    const candidateToken = await TokenModel.findOne({ user: userId });

    if (candidateToken) {
      candidateToken.refreshToken = refreshToken;
      return candidateToken.save();
    }

    const token = await TokenModel.create({ user: userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken) {
    return await TokenModel.deleteOne({ refreshToken });
  }
  async findToken(refreshToken) {
    return await TokenModel.findOne({ refreshToken });
  }
}

export default new TokenService();
