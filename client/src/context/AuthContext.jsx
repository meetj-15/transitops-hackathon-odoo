import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi.js";
import { clearStoredToken, getStoredToken, setStoredToken } from "../api/apiClient.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";

const AuthContext = createContext(null);
const DEMO_TOKEN = "transitops-demo-token";
const DEMO_USER_KEY = "transitops_demo_user";
const DEMO_USER = {
  id: "demo-user-1",
  name: "TransitOps Admin",
  email: "admin@transitops.com",
  role: "Fleet Manager",
};

function isDemoLogin(payload) {
  return payload.email === "admin@transitops.com" && payload.password === "Password123";
}

function isNetworkError(error) {
  return error.code === "ERR_NETWORK" || !error.response;
}

function isBackendUnavailable(error) {
  return isNetworkError(error) || [502, 503, 504].includes(error.response?.status);
}

function getStoredDemoUser() {
  const value = window.sessionStorage.getItem(DEMO_USER_KEY);

  if (!value) {
    return DEMO_USER;
  }

  try {
    return JSON.parse(value);
  } catch {
    return DEMO_USER;
  }
}

function setStoredDemoUser(nextUser) {
  window.sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify(nextUser));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");

  const logout = useCallback(() => {
    clearStoredToken();
    window.sessionStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const token = getStoredToken();

      if (!token) {
        setIsAuthReady(true);
        return;
      }

      if (token === DEMO_TOKEN) {
        setUser(getStoredDemoUser());
        setIsAuthReady(true);
        return;
      }

      try {
        const response = await authApi.me();

        if (isMounted) {
          setUser(response.data.user ?? response.data.data?.user ?? response.data.data ?? null);
        }
      } catch {
        logout();
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    }

    restoreSession();

    function handleUnauthorized() {
      logout();
    }

    window.addEventListener("transitops:unauthorized", handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener("transitops:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(async (payload) => {
    setAuthError("");

    try {
      const response = await authApi.login(payload);
      const token = response.data.token ?? response.data.data?.token;
      const safeUser = response.data.user ?? response.data.data?.user;

      if (!token || !safeUser) {
        throw new Error("Invalid login response.");
      }

      setStoredToken(token);
      setUser(safeUser);
      return safeUser;
    } catch (error) {
      if (isBackendUnavailable(error) && isDemoLogin(payload)) {
        const demoUser = {
          ...DEMO_USER,
          role: payload.demoRole ?? DEMO_USER.role,
        };

        setStoredToken(DEMO_TOKEN);
        setStoredDemoUser(demoUser);
        setUser(demoUser);
        return demoUser;
      }

      const message = getApiErrorMessage(error, "Invalid email or password.");
      setAuthError(message);
      throw error;
    }
  }, []);

  const signup = useCallback(async (payload) => {
    setAuthError("");

    try {
      await authApi.register(payload);
      const response = await authApi.login({
        email: payload.email,
        password: payload.password,
      });
      const token = response.data.token ?? response.data.data?.token;
      const safeUser = response.data.user ?? response.data.data?.user;

      if (!token || !safeUser) {
        throw new Error("Invalid signup response.");
      }

      setStoredToken(token);
      setUser(safeUser);
      return safeUser;
    } catch (error) {
      if (isBackendUnavailable(error)) {
        const demoUser = {
          id: `demo-user-${Date.now()}`,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        };

        setStoredToken(DEMO_TOKEN);
        setStoredDemoUser(demoUser);
        setUser(demoUser);
        return demoUser;
      }

      const message = getApiErrorMessage(error, "Could not create account.");
      setAuthError(message);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      authError,
      isAuthenticated: Boolean(user),
      isAuthReady,
      login,
      logout,
      signup,
      user,
    }),
    [authError, isAuthReady, login, logout, signup, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
