import { Link } from "react-router-dom";

import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-brand-link">
              <span className="footer-brand-mark">ET</span>

              <span>
                Event<span>Ticketing</span>
              </span>
            </Link>

            <p>
              Discover events, book your tickets, and enjoy experiences worth
              remembering.
            </p>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>

            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
          </div>

          <div className="footer-column">
            <h3>Account</h3>

            <Link to="/login">Log in</Link>
            <Link to="/register">Create account</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} EventTicketing. All rights reserved.</p>

          <p className="footer-tagline">Discover. Book. Experience.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
