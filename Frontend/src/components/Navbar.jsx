import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <h2>EventTicketing</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;