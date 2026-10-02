import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import authPeople from "../../assets/auth-people.png";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const successMessage = location.state?.message || "";
  const from = location.state?.from || "";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const loggedInUser = await login(formData);

      const userRole = loggedInUser?.role?.toUpperCase();

      const isOrganizerOrAdmin = ["ORGANIZER", "ADMIN"].includes(
        userRole,
      );

      const isOrganizerRoute =
        from && from.startsWith("/organizer/");

      let destination = "/";

      if (from && (!isOrganizerRoute || isOrganizerOrAdmin)) {
        destination = from;
      } else if (isOrganizerOrAdmin) {
        destination = "/organizer/events";
      }

      navigate(destination, {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to sign in. Please check your details and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-visual">
          <div className="auth-visual-content">
            <p className="auth-visual-brand">EVENTTICKETING</p>

            <h1>
              Your next
              <span> experience</span>
              starts here.
            </h1>

            <p>
              Discover exciting events, book your tickets, and keep
              everything you need in one place.
            </p>
          </div>

          <img
            src={authPeople}
            alt="People enjoying an event"
            className="auth-people"
          />
        </section>

        <section className="auth-card-wrapper">
          <div className="auth-card">
            <div className="auth-card-header">
              <p className="auth-eyebrow">WELCOME BACK</p>

              <h2>Sign in</h2>

              <p>
                Enter your account details to continue.
              </p>
            </div>

            {successMessage && (
              <div className="auth-alert auth-alert-success">
                {successMessage}
              </div>
            )}

            {error && (
              <div
                className="auth-alert auth-alert-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="auth-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <div className="auth-field-heading">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="auth-forgot-link"
                  >
                    Forgot password?
                  </Link>
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Signing in..."
                  : "Sign in"}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;