import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const roleLabel =
    user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).toLowerCase() ||
    "User";

  return (
    <main className="profile-page">
      <div className="container">
        {/* Page heading */}
        <section className="profile-heading">
          <div>
            <p className="profile-eyebrow">MY ACCOUNT</p>
            <h1>Profile</h1>
            <p>
              Manage your account details and access your EventTicketing
              activity.
            </p>
          </div>
        </section>

        {/* Profile overview */}
        <section className="profile-grid">
          <article className="profile-card profile-card-main">
            <div className="profile-cover"></div>

            <div className="profile-main-content">
              <div className="profile-avatar-large">{initials}</div>

              <div className="profile-identity">
                <h2>{user?.name || "User"}</h2>
                <p>{user?.email || "No email available"}</p>
              </div>
            </div>

            <div className="profile-divider"></div>

            <div className="profile-details">
              <div className="profile-detail">
                <span className="profile-detail-label">Full name</span>
                <strong>{user?.name || "Not available"}</strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">Email address</span>
                <strong>{user?.email || "Not available"}</strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">Account type</span>
                <strong>{roleLabel}</strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">Account status</span>
                <strong className="profile-status">
                  <span className="profile-status-dot"></span>
                  Active
                </strong>
              </div>
            </div>
          </article>

          {/* Account actions */}
          <aside className="profile-card profile-card-actions">
            <div className="profile-card-title">
              <p className="profile-eyebrow">QUICK ACTIONS</p>
              <h2>Your account</h2>
            </div>

            <Link to="/tickets" className="profile-action">
              <div className="profile-action-icon">🎟</div>

              <div>
                <strong>My Tickets</strong>
                <span>View your purchased tickets</span>
              </div>

              <span className="profile-action-arrow">→</span>
            </Link>

            <div className="profile-action profile-action-disabled">
              <div className="profile-action-icon">⚙</div>

              <div>
                <strong>Account settings</strong>
                <span>Coming soon</span>
              </div>
            </div>

            <button
              type="button"
              className="profile-logout"
              onClick={handleLogout}
            >
              Log out
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default Profile;
