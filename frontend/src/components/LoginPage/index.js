import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./index.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showSubmitError, setShowSubmitError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:4000/dashboard",
                    { withCredentials: true } // send cookies
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMsg("");
        setShowSubmitError(false);

        try {
            await axios.post(
                "http://localhost:4000/login",
                { email, password },
                { withCredentials: true }
            );

            // console.log("Login Success:", response.data);

            navigate("/dashboard");
        } catch (error) {
            setShowSubmitError(true);
            if (error.response?.data?.error_msg) {
                setErrorMsg(error.response.data.error_msg);
            } else {
                setErrorMsg("Something went wrong. Please try again.")
            }
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
        <h1 className="login-title">Welcome Back To Login👋</h1>

        {showSubmitError && <div className="error-box">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="label-checkbox-container">
                <input
                    type="checkbox"
                    id="showPassword"
                    className="checkbox-input"
                    onChange={() => setShowPassword(prev => !prev)}
                />
                <label htmlFor="showPassword" className="show-password-label">Show Password</label>
            </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="signup-text">
          Don’t have an account?{" "}
          <a href="/signup" className="signup-link">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
