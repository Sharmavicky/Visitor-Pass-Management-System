import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // Initialize user from localStorage so that page refresh don't log them out
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    })

    // -Login
    const login = useCallback((data) => {
        const userData = {
            ...data.user,
            token: data.user.token
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    }, []);

    // -Logout
    const logout = useCallback(() => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    }, [navigate])

    // - Update user
    const updateUser = useCallback((updatedFields) => {
        setUser((prevUser) => {
            const updated = { ...prevUser, ...updatedFields };
            localStorage.setItem("user", JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Role helpers
    const isAdmin = user?.role === "admin";
    const isSecurity = user?.role === "security";
    const isEmployee = user?.role === "employee";
    const isVisitor = user?.role === "visitor";

    // Token getter 
    const token = user?.token || null;

    // Auto logout when token expires after 7 days
    useEffect(() => {
        if (!user?.token) return;

        try {
            const payload = JSON.parse(atob(user.token.split(".")[1]));
            const exp = payload.exp * 1000; // convert to milliseconds

            const now = Date.now();
            if (now >= exp) {
                logout();
                return;
            }

            // set a timer to auto logout when token expires
            const timeout = exp - now;
            const timer = setTimeout(() => {
                logout();
            }, timeout);

            return () => clearTimeout(timer);
        } catch {
            // if token is malformed or can't be decoded, log the user out
            logout();
        }
    }, [user?.token, logout]);

    const value = {
        user,
        login,
        logout,
        updateUser,
        isAdmin,
        isSecurity,
        isEmployee,
        isVisitor,
        token,
        isLoggedIn: !!user,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}