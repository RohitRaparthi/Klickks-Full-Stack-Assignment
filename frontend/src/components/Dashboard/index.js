import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:4000/dashboard",
                    { withCredentials: true } // send cookies
                );

                if (response.data.message) {
                    const fullEmail = response.data.message.split(" ")[1]; // extract email from message
                    const username = fullEmail.split("@")[0];
                    setUserEmail(username);
                }
            } catch (err) {
                console.log("No active session:", err.message);
                navigate("/"); // redirect to login if session expired or invalid
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, [navigate]);

    const onClickLogout = async () => {
        try {
            await axios.post(
                "http://localhost:4000/logout",
                {},
                { withCredentials: true }
            );
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        )
    }

    return (
        <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Dashboard 🚀</h1>

        <p className="welcome-text">
          Welcome, <span className="highlight">{userEmail}</span> 🎉
        </p>

        <button className="login-button" onClick={onClickLogout}>
          Logout
        </button>
      </div>
    </div>
    );
};

export default Dashboard;
