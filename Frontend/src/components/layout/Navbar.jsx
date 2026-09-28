import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "navbar-link navbar-link-active" : "navbar-link";

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <NavLink to="/" className="navbar-brand">
          EventTicketing
        </NavLink>

        {/* Main navigation */}
        <nav className="navbar-nav">
          <NavLink to="/" className={getNavLinkClass}>
            Home
          </NavLink>

          <NavLink to="/events" className={getNavLinkClass}>
            Events
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/tickets" className={getNavLinkClass}>
              My Tickets
            </NavLink>
          )}
        </nav>

        {/* Account section */}
        <div className="navbar-account">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className="navbar-login">
                Log in
              </NavLink>

              <NavLink to="/register" className="navbar-signup">
                Create account
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/profile" className="navbar-user">
                <span className="navbar-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="navbar-user-name">
                  {user?.name || "Account"}
                </span>
              </NavLink>

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
