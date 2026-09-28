import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../services/authService";

import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await forgotPassword(email);
      setMessage(
        response?.message ||
          "If an account exists with that email, password reset instructions have been sent.",
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to process your request. Please try again.",
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

              <h2>Forgot password?</h2>

              <p>
                Enter the email address associated with your account and we'll
                help you reset your password.
              </p>
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
                  <label htmlFor="email">Email address</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send reset instructions"}
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

export default ForgotPassword;
