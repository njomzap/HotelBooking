const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const pool = require('../db');

class RefreshTokenService {
  static generateRefreshToken() {
    return uuidv4();
  }

  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        hotelId: user.hotel_id ?? null,
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  // Save refresh token to database
  static async saveRefreshToken(userId, refreshToken) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
      await this.revokeUserTokens(userId);
      
      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, refreshToken, expiresAt]
      );
      
      return true;
    } catch (error) {
      console.error('Error saving refresh token:', error);
      return false;
    }
  }

  // Validate refresh token
  static async validateRefreshToken(token) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token = ? AND is_revoked = FALSE AND expires_at > NOW()',
        [token]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return null;
    }
  }

  // Get user by refresh token
  static async getUserByRefreshToken(token) {
    try {
      const [rows] = await pool.query(
        `SELECT u.* FROM users u 
         INNER JOIN refresh_tokens rt ON u.id = rt.user_id 
         WHERE rt.token = ? AND rt.is_revoked = FALSE AND rt.expires_at > NOW()`,
        [token]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting user by refresh token:', error);
      return null;
    }
  }

  static async revokeToken(token) {
    try {
      await pool.query(
        'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = ?',
        [token]
      );
      return true;
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      return false;
    }
  }

  // Revoke all tokens for a user (for logout from all devices)
  static async revokeUserTokens(userId) {
    try {
      await pool.query(
        'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?',
        [userId]
      );
      return true;
    } catch (error) {
      console.error('Error revoking user tokens:', error);
      return false;
    }
  }

  static async cleanupExpiredTokens() {
    try {
      const [result] = await pool.query(
        'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR is_revoked = TRUE'
      );
      
      if (result.affectedRows > 0) {
        console.log(`Cleaned up ${result.affectedRows} expired/revoked refresh tokens`);
      }
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  static async rotateRefreshToken(oldToken) {
    try {
      const tokenData = await this.validateRefreshToken(oldToken);
      if (!tokenData) {
        return null;
      }

      await this.revokeToken(oldToken);
      
      const newRefreshToken = this.generateRefreshToken();
      
      const saved = await this.saveRefreshToken(tokenData.user_id, newRefreshToken);
      
      if (!saved) {
        return null;
      }

      const [userRows] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [tokenData.user_id]
      );

      if (userRows.length === 0) {
        return null;
      }

      const user = userRows[0];
      const accessToken = this.generateAccessToken(user);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          hotelId: user.hotel_id ?? null,
        }
      };
    } catch (error) {
      console.error('Error rotating refresh token:', error);
      return null;
    }
  }
}

module.exports = RefreshTokenService;
