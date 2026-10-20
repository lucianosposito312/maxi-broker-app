import { createContext, useContext, useState, useEffect } from 'react';
import { academiaAuth } from '../lib/academiaAuth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [hasDownloadedEbook, setHasDownloadedEbook] = useState(false);
    const [appointments, setAppointments] = useState([]);

    // Academia-specific state
    const [academyUser, setAcademyUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load academy session on mount
    useEffect(() => {
        const session = academiaAuth.getSession();
        if (session) {
            setAcademyUser(session);
        }

        // Load dark mode preference
        const darkModePreference = localStorage.getItem('academia_dark_mode') === 'true';
        setIsDarkMode(darkModePreference);
    }, []);

    const saveUserData = (data) => {
        setUserData(data);
    };

    const markEbookDownloaded = () => {
        setHasDownloadedEbook(true);
    };

    const addAppointment = (appointment) => {
        setAppointments([...appointments, appointment]);
    };

    const isUserRegistered = () => {
        return userData !== null && hasDownloadedEbook;
    };

    // Academia methods
    const loginAcademy = (user) => {
        setAcademyUser(user);
        academiaAuth.setSession(user);
    };

    const logoutAcademy = () => {
        setAcademyUser(null);
        academiaAuth.clearSession();
    };

    const updateAcademyUser = (updatedData) => {
        const updated = { ...academyUser, ...updatedData };
        setAcademyUser(updated);
        academiaAuth.setSession(updated);
    };

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('academia_dark_mode', newMode.toString());
    };

    return (
        <UserContext.Provider value={{
            userData,
            hasDownloadedEbook,
            appointments,
            saveUserData,
            markEbookDownloaded,
            addAppointment,
            isUserRegistered,
            // Academia
            academyUser,
            isDarkMode,
            loginAcademy,
            logoutAcademy,
            updateAcademyUser,
            toggleDarkMode
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};
