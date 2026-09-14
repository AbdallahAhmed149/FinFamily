import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44, getToken, setToken } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // بيتنفذ لو لقينا توكن محفوظ في localStorage — بيتأكد إنه لسه صالح ويجيب بيانات اليوزر
  const loadCurrentUser = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const currentUser = await base44.get('/auth/me');
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      // التوكن غلط أو منتهي — نمسحه ونرجع اليوزر لحالة "مش داخل"
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      if (error.status !== 401) {
        setAuthError({ type: 'unknown', message: error.message || 'حصل خطأ غير متوقع' });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      loadCurrentUser();
    } else {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [loadCurrentUser]);

  // ---------------------------------------------------------------------
  // الأب: تسجيل دخول / تسجيل حساب جديد
  // ---------------------------------------------------------------------

  // otp_code اختياري: أول مرة (من غير كود) لو الأب مفعّل MFA هيرجع mfa_required=true
  // من غير token، والفرونت هيسأله عن الكود ويبعت نفس الدالة تاني بالكود (أو بكود استرجاع بدالها).
  const loginParent = async (email, password, otpCode, recoveryCode) => {
    setAuthError(null);
    const res = await base44.post('/auth/login', {
      email, password,
      otp_code: otpCode || undefined,
      recovery_code: recoveryCode || undefined,
    });
    if (res.mfa_required) {
      return { mfaRequired: true };
    }
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthenticated(true);
    return { mfaRequired: false, user: res.user, usedRecoveryCode: res.used_recovery_code };
  };

  const registerParent = async ({ family_name, full_name, email, password }) => {
    setAuthError(null);
    const res = await base44.post('/auth/register', { family_name, full_name, email, password });
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthenticated(true);
    return res.user;
  };

  // مفيهاش auth (الأب لسه مش داخل، ده أصلاً الغرض منها) — نفس الرد سواء الإيميل
  // مسجل أو لأ، عشان محدش يعرف يستنتج مين عنده حساب
  const forgotPassword = async (email) => {
    return base44.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (token, newPassword) => {
    return base44.post('/auth/reset-password', { token, new_password: newPassword });
  };

  // ---------------------------------------------------------------------
  // الطفل: يدور على عيلته بالكود، وبعدين يدخل بالـ PIN
  // ---------------------------------------------------------------------

  // مفيهاش auth (مفتوحة) — الطفل لسه معملش login، بس محتاج يشوف أسامي عيلته
  const lookupFamilyChildren = async (familyCode) => {
    return base44.post('/auth/children/lookup', { family_code: familyCode });
  };

  const loginChild = async (familyCode, childId, pin) => {
    setAuthError(null);
    const res = await base44.post('/auth/child-login', {
      family_code: familyCode,
      child_id: childId,
      pin,
    });
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthenticated(true);
    return res.user;
  };

  // ---------------------------------------------------------------------
  // الأب: يدير أولاده (يشوف الكود، يشوف/يضيف أطفال) — كلها محتاجة auth
  // ---------------------------------------------------------------------

  const getFamilyCode = async () => {
    return base44.get('/auth/family/code'); // { family_code, family_name }
  };

  const getFamilyChildren = async () => {
    return base44.get('/auth/family/children'); // { family_name, children: [{id, full_name}] }
  };

  const createChild = async (fullName, pin) => {
    return base44.post('/auth/children', { full_name: fullName, pin }); // بيرجع اليوزر الجديد
  };

  // ---------------------------------------------------------------------
  // مشترك
  // ---------------------------------------------------------------------

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authError,
        authChecked,
        isParent: user?.role === 'parent',
        isChild: user?.role === 'child',
        loginParent,
        registerParent,
        forgotPassword,
        resetPassword,
        lookupFamilyChildren,
        loginChild,
        getFamilyCode,
        getFamilyChildren,
        createChild,
        logout,
        refreshUser: loadCurrentUser,
      }}
    >
      {children}
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