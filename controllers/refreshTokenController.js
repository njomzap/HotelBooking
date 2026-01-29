const RefreshTokenService = require('../services/refreshTokenService');

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        message: 'Refresh token not provided' 
      });
    }

    const user = await RefreshTokenService.getUserByRefreshToken(refreshToken);
    
    if (!user) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ 
        message: 'Invalid or expired refresh token' 
      });
    }

    const newAccessToken = RefreshTokenService.generateAccessToken(user);
    
    const tokenRotation = await RefreshTokenService.rotateRefreshToken(refreshToken);
    
    if (!tokenRotation) {
      return res.status(500).json({ 
        message: 'Failed to rotate refresh token' 
      });
    }

    res.cookie('refreshToken', tokenRotation.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    console.log('🔄 TOKEN REFRESHED:');
    console.log('New Access Token:', newAccessToken.substring(0, 20) + '...');
    console.log('New Refresh Token:', tokenRotation.refreshToken.substring(0, 20) + '...');
    console.log('User:', user.username, 'Role:', user.role);
    console.log('---');

    res.json({
      accessToken: newAccessToken,
      refreshToken: tokenRotation.refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('REFRESH TOKEN ERROR:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Logout - revoke refresh token
exports.logout = async (req, res) => {
  try {
    console.log('�️ SERVER-SIDE TOKEN DESTRUCTION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 REFRESH TOKEN RECEIVED:');
    console.log('   Token:', req.cookies?.refreshToken || 'NOT_FOUND');
    console.log('   Cookie Name: refreshToken');
    console.log('   HttpOnly: true');
    console.log('   Secure:', process.env.NODE_ENV === 'production');
    console.log('');
    
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await RefreshTokenService.revokeToken(refreshToken);
      
      console.log('✅ REFRESH TOKEN DESTROYED:');
      console.log('   Status: Revoked from database');
      console.log('   Action: Token marked as revoked');
      console.log('   Result: Cannot be used for refresh');
      
      console.log('🗑️ TOKEN DESTRUCTION LOG:');
      console.log('   Refresh Token:', refreshToken.substring(0, 50) + '...');
      console.log('   Timestamp:', new Date().toISOString());
      console.log('   Action: Complete revocation');
    } else {
      console.log('⚠️ NO REFRESH TOKEN FOUND:');
      console.log('   Status: No token to revoke');
      console.log('   Possible: Cookie expired or not set');
    }

    res.clearCookie('refreshToken');
    
    console.log('');
    console.log('🍪 COOKIE CLEARED:');
    console.log('   Action: Cookie cleared from browser');
    console.log('   Result: Refresh token removed');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    res.json({ 
      message: 'Logged out successfully' 
    });

  } catch (error) {
    console.error('❌ SERVER LOGOUT ERROR:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      await RefreshTokenService.revokeUserTokens(userId);
      
      console.log('🗑️ ALL TOKENS DESTROYED (Logout All):');
      console.log('User ID:', userId);
      console.log('Timestamp:', new Date().toISOString());
      console.log('---');
    }

    res.clearCookie('refreshToken');
    
    res.json({ 
      message: 'Logged out from all devices successfully' 
    });

  } catch (error) {
    console.error('LOGOUT ALL ERROR:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};
