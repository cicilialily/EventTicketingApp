import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import authPeople from "../../assets/auth-people.png";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((current) => ({
      ...current,
      role,
    }));

    setError("");
  };

  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      return "Your name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (!/[A-Z]/.test(formData.password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(formData.password)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(formData.password)) {
      return "Password must contain at least one number.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    if (!["USER", "ORGANIZER"].includes(formData.role)) {
      return "Please select an account type.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Your account was created successfully. Please sign in.",
        },
      });
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to create your account. Please try again.",
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
              Find something
              <span> worth experiencing.</span>
            </h1>

            <p>
              Create your account and start discovering events that
              match your interests.
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
              <p className="auth-eyebrow">GET STARTED</p>

              <h2>Create account</h2>

              <p>
                Join EventTicketing as an attendee or event organizer.
              </p>
            </div>

            {error && (
              <div
                className="auth-alert auth-alert-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="name">Full name</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email address</label>

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
                  <label>Account type</label>
                </div>

                <p className="auth-help-text auth-role-description">
                  Choose how you plan to use EventTicketing.
                </p>

                <div className="auth-role-options">
                  <button
                    type="button"
                    className={`auth-role-card ${
                      formData.role === "USER"
                        ? "auth-role-card-selected"
                        : ""
                    }`}
                    onClick={() => handleRoleChange("USER")}
                    aria-pressed={formData.role === "USER"}
                  >
                    <span className="auth-role-icon">
                      <UserRound size={22} />
                    </span>

                    <span className="auth-role-content">
                      <strong>Attendee</strong>

                      <small>
                        Discover events, purchase tickets, and manage
                        your tickets.
                      </small>
                    </span>

                    <span className="auth-role-radio">
                      <span />
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`auth-role-card ${
                      formData.role === "ORGANIZER"
                        ? "auth-role-card-selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleRoleChange("ORGANIZER")
                    }
                    aria-pressed={formData.role === "ORGANIZER"}
                  >
                    <span className="auth-role-icon">
                      <CalendarPlus size={22} />
                    </span>

                    <span className="auth-role-content">
                      <strong>Organizer</strong>

                      <small>
                        Create events, sell tickets, and manage
                        attendees.
                      </small>
                    </span>

                    <span className="auth-role-radio">
                      <span />
                    </span>
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <small className="auth-help-text">
                  At least 8 characters with uppercase, lowercase, and
                  a number.
                </small>
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Creating account..."
                  : "Create account"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;