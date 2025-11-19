import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const { data } = await axios.get('/api/auth/profile');
                setUserInfo(data);
            } catch (error) {
                setUserInfo(null);
                console.error('Error checking user status', error);
            } finally {
                setLoading(false);
            }
        };

        checkUserStatus();
    }, []);

    const login = async (username, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { username, password });
            setUserInfo(data);
        } catch (error) {
            const message =
                error.response && error.response.data.message
                    ? error.response.data.message : 'An unexpected error occurred';
            throw new Error(message);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUserInfo(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ userInfo, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};