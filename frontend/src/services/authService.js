// Authentication service for handling login/logout globally

export const authService = {
  hasValidToken() {
    const token = this.getToken();
    
    if (!token || token === 'null' || token === 'undefined' || typeof token !== 'string' || token.trim() === '' || token.length <= 10) {
      return false;
    }

    try {
      const parts = token.split('.');
      
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < now) {
          console.log("⏰ TOKEN IS EXPIRED - Clearing now");
          console.log("🔍 TOKEN DETAILS:");
          console.log("   User ID:", payload.id);
          console.log("   Username:", payload.username);
          console.log("   Role:", payload.role);
          console.log("   Expired at:", new Date(payload.exp * 1000));
          console.log("   Current time:", new Date(now * 1000));
          this.logout();
          return false;
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.log("❌ Invalid token format, clearing:", error);
      this.logout();
      return false;
    }
  },

  getToken() {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    return token;
  },

  createToken(token, userId, username, role) {
    console.log("🔐 TOKEN CREATED for user:", username, "(", role, ")");
    
    localStorage.setItem("accessToken", token);
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  refreshToken(newToken) {
    console.log("🔄 TOKEN REFRESHED");
    
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("token", newToken);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  isLoggedIn() {
    return this.hasValidToken();
  },

  logout() {
    console.log("🚪 USER LOGGED OUT - Tokens destroyed");
    
    const keysToRemove = [
      "token",
      "accessToken", 
      "userId",
      "role",
      "priority",
      "hotelId",
      "user",
      "email",
      "name",
      "isLoggedIn",
      "username"
    ];

    for (let i = 0; i < 3; i++) {
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }

    sessionStorage.clear();

    const tokenStillExists = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (tokenStillExists) {
      localStorage.clear();
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  forceCleanup() {
    console.log("🧹 FORCE CLEANUP - Clearing ALL auth data");
    this.logout();
    
    const additionalKeys = [
      "user", "email", "name", "isLoggedIn", "userRole", "userEmail"
    ];
    
    additionalKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
    
    console.log("🗑️ Force cleanup completed");
  },

  init() {
    this.checkAndClearExpiredTokens();
  },

  checkAndClearExpiredTokens() {
    const token = this.getToken();
    if (!token) {
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < now) {
          console.log("⏰ Expired token cleared on startup");
          this.logout();
          return true;
        }
      }
    } catch (error) {
      console.log("❌ Invalid token cleared on startup");
      this.logout();
      return true;
    }
    return false;
  }
};

authService.init();
