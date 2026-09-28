import EventCard from "../components/EventCard";
import "./Home.css";

function Home() {
  const featuredEvents = [
    {
      id: 1,
      title: "Tech Conference 2026",
      date: "October 10, 2026",
      location: "Lagos, Nigeria",
      price: 15000,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    },
    {
      id: 2,
      title: "Live Music Festival",
      date: "October 18, 2026",
      location: "Abuja, Nigeria",
      price: 10000,
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
    },
    {
      id: 3,
      title: "Business & Startup Summit",
      date: "November 2, 2026",
      location: "Lagos, Nigeria",
      price: 20000,
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72",
    },
  ];

  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">DISCOVER • BOOK • EXPERIENCE</p>

          <h1>
            Discover Events
            <br />
            You'll Love
          </h1>

          <p>
            Find concerts, conferences, festivals, parties and more.
            Discover your next unforgettable experience.
          </p>

          <div className="hero-search">
            <input
              type="text"
              placeholder="Search for events..."
            />

            <button>Search</button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="section-heading">
          <p>EXPLORE</p>
          <h2>Browse by Category</h2>
        </div>

        <div className="categories">
          <button>🎵 Music</button>
          <button>⚽ Sports</button>
          <button>💼 Conferences</button>
          <button>😂 Comedy</button>
          <button>🎉 Parties</button>
        </div>
      </section>

      {/* Featured Events */}
      <section className="featured-section">
        <div className="section-heading">
          <p>DON'T MISS OUT</p>
          <h2>Featured Events</h2>
        </div>

        <div className="events-grid">
          {featuredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-heading">
          <p>SIMPLE & EASY</p>
          <h2>How It Works</h2>
        </div>

        <div className="steps">

          <div className="step">
            <span>01</span>
            <h3>Discover</h3>
            <p>
              Find events that match your interests.
            </p>
          </div>

          <div className="step">
            <span>02</span>
            <h3>Choose Your Ticket</h3>
            <p>
              Select the ticket that works best for you.
            </p>
          </div>

          <div className="step">
            <span>03</span>
            <h3>Make Payment</h3>
            <p>
              Complete your booking securely.
            </p>
          </div>

          <div className="step">
            <span>04</span>
            <h3>Enjoy Your Event</h3>
            <p>
              Get your ticket and enjoy the experience.
            </p>
          </div>

        </div>
      </section>

      {/* Call To Action */}
      <section className="home-cta">
        <h2>Ready to find your next event?</h2>

        <p>
          Explore exciting events happening around you.
        </p>

        <button>Explore Events</button>
      </section>

    </div>
  );
}

export default Home;