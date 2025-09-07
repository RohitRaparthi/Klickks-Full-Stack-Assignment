import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:4000/dashboard",
                    { withCredentials: true }
                );
                if (response.data.message) setIsAuthenticated(true);
            } catch (err) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    
    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/" replace />;
    
    return children;
};

export default ProtectedRoute;
