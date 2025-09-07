import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [success, setSuccess] = useState("");
    const [showSubmitError, setShowSubmitError] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:4000/dashboard",
                    { withCredentials: true }
                );
                if (response.data.message) {
                    navigate("/dashboard");
                }
            } catch (err) {
                console.log("No active session:", err.message);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, [navigate]);

    const onSignupForm = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setShowSubmitError(false);

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            setShowSubmitError(true);
            return;
        }

        try {
            await axios.post(
                "http://localhost:4000/users",
                { email, password },
                { withCredentials: true }
            );

            // console.log("Signup Success:", response.data);

            setSuccess("Registration successful! Redirecting to login...");
            setTimeout(() => navigate("/"), 1500);

        } catch (error) {
            setShowSubmitError(true);
            // console.error("Signup Error:", error.message);
            if (error.response?.data?.error_msg) {
                setErrorMsg(error.response.data.error_msg || "Registration failed");
            } else {
                setErrorMsg("Something went wrong. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        );
    }

    return (
    <div className="login-container">
        <div className="login-box">
            <h1 className="login-title">Create Account ✨</h1>

            {showSubmitError && <div className="error-box">{errorMsg}</div>}
            {success && <div className="success-box">{success}</div>}

            <form onSubmit={onSignupForm} className="login-form">
            <div className="form-group">
                <label>Email</label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                />
            </div>

            <div className="form-group">
                <label>Confirm Password</label>
                <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                />
            </div>

            <button type="submit" className="login-button">
                Sign Up
            </button>
            </form>

            <p className="signup-text">
            Already have an account?{" "}
            <a href="/" className="signup-link">
                Login
            </a>
            </p>
        </div>
    </div>
    );
};

export default RegisterPage;