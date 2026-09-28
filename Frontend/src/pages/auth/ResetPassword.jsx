import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

import { resetPassword } from "../../services/authService";

import "./Auth.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!token) {
      return "This password reset link is missing or invalid.";
    }

    if (formData.newPassword.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (!/[A-Z]/.test(formData.newPassword)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(formData.newPassword)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(formData.newPassword)) {
      return "Password must contain at least one number.";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setMessage(
        "Your password has been reset successfully. You can now sign in.",
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to reset your password. The link may have expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-layout auth-layout-single">
        <section className="auth-card-wrapper">
          <div className="auth-card">
            <div className="auth-card-header">
              <p className="auth-eyebrow">ACCOUNT RECOVERY</p>

              <h2>Reset password</h2>

              <p>Create a new password for your EventTicketing account.</p>
            </div>

            {message && (
              <div className="auth-alert auth-alert-success" role="status">
                {message}
              </div>
            )}

            {error && (
              <div className="auth-alert auth-alert-error" role="alert">
                {error}
              </div>
            )}

            {!message && (
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label htmlFor="newPassword">New password</label>

                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Create a new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <small className="auth-help-text">
                    At least 8 characters with uppercase, lowercase, and a
                    number.
                  </small>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">Confirm new password</label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat your new password"
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
                  {isSubmitting ? "Resetting..." : "Reset password"}
                </button>
              </form>
            )}

            <p className="auth-switch">
              Remember your password? <Link to="/login">Back to sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ResetPassword;
