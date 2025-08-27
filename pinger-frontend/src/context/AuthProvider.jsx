import { useState } from 'react';
import { AuthContext } from './useAuth'; 

export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(
        JSON.parse(localStorage.getItem('pinger-user')) || null
    );

    return (
        // We use the imported AuthContext here
        <AuthContext.Provider value={{ authUser, setAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};