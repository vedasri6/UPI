import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('upi_suraksha_user') || sessionStorage.getItem('upi_suraksha_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('upi_suraksha_token') || sessionStorage.getItem('upi_suraksha_token') || null;
    if (savedToken === 'mock_jwt_token_2026') {
      localStorage.removeItem('upi_suraksha_token');
      sessionStorage.removeItem('upi_suraksha_token');
      return null;
    }
    return savedToken;
  });

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info', show: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const API_BASE = 'http://localhost:5000/api/auth';

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('upi_suraksha_token');
    localStorage.removeItem('upi_suraksha_user');
    sessionStorage.removeItem('upi_suraksha_token');
    sessionStorage.removeItem('upi_suraksha_user');
  };

  // Validate session on app initialization
  useEffect(() => {
    const initSession = async () => {
      const storedToken = localStorage.getItem('upi_suraksha_token') || sessionStorage.getItem('upi_suraksha_token');
      if (!storedToken || storedToken === 'mock_jwt_token_2026') {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            clearSession();
          }
        } else if (res.status === 401) {
          clearSession();
        }
      } catch (err) {
        // Backend temporarily unreachable; preserve existing user structure if present
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const errorMsg = data.message || (res.status === 503 
          ? 'Database service is offline. Real account authentication requires MongoDB.' 
          : 'Login failed. Please verify your credentials.');
        showToast(errorMsg, 'error');
        return { success: false, message: errorMsg };
      }

      setUser(data.user);
      setToken(data.token);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('upi_suraksha_token', data.token);
      storage.setItem('upi_suraksha_user', JSON.stringify(data.user));

      showToast(`Welcome back, ${data.user.name || data.user.full_name || 'Citizen'}!`, 'success');
      return { success: true, user: data.user };
    } catch (err) {
      const errorMsg = 'Cannot connect to authentication service. Please verify that the backend is running.';
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const errorMsg = data.message || (res.status === 503 
          ? 'Database is offline. Account registration requires MongoDB.' 
          : 'Registration failed');
        showToast(errorMsg, 'error');
        return { success: false, message: errorMsg };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('upi_suraksha_token', data.token);
      localStorage.setItem('upi_suraksha_user', JSON.stringify(data.user));

      showToast(data.message || 'Account created successfully!', 'success');
      return { success: true, user: data.user, verification_code: data.verification_code };
    } catch (err) {
      const errorMsg = 'Cannot connect to authentication service. Registration requires a live server and database.';
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Error processing password reset request';
        showToast(errorMsg, 'error');
        return { success: false, message: errorMsg };
      }

      showToast(data.message || 'Password reset link generated!', 'info');
      return { success: true, reset_token: data.reset_token };
    } catch (err) {
      const errorMsg = 'Cannot connect to authentication service.';
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_token: resetToken, new_password: newPassword })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Failed to reset password';
        showToast(errorMsg, 'error');
        return { success: false, message: errorMsg };
      }

      showToast(data.message || 'Password updated successfully! Please login.', 'success');
      return { success: true };
    } catch (err) {
      const errorMsg = 'Cannot connect to authentication service.';
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }
  };

  const updateProfile = async (profileData) => {
    if (!token) {
      showToast('You must be logged in to update your profile.', 'error');
      return { success: false, message: 'Authentication required' };
    }

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Failed to update profile';
        showToast(errorMsg, 'error');
        return { success: false, message: errorMsg };
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem('upi_suraksha_user', JSON.stringify(data.user));
      }
      showToast('Profile updated successfully!', 'success');
      return { success: true, user: data.user };
    } catch (err) {
      const errorMsg = 'Cannot connect to server to update profile.';
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }
  };

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('upi_suraksha_user', JSON.stringify(data.user));
      }
    } catch (err) {
      // Ignore network error in fetchProfile
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch {
      // ignore network errors on logout
    }
    clearSession();
    showToast('Logged out safely', 'info');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token && token !== 'mock_jwt_token_2026',
      isAdmin: user?.role === 'admin',
      toast,
      showToast,
      login,
      register,
      forgotPassword,
      resetPassword,
      updateProfile,
      fetchProfile,
      logout
    }}>
      {children}
      
      {/* Toast Notification Container */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-3 border ${
            toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
            toast.type === 'error' ? 'bg-red-600 text-white border-red-500' :
            'bg-slate-900 text-white border-slate-700'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
