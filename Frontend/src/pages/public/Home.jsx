import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import EventCard from "../../components/events/EventCard";
import { mockEvents } from "../../data/mockEvents";

import "./Home.css";

const featuredEvents = [
  {
    id: 1,
    title: "Tech Conference 2026",
    date: "October 10, 2026",
    location: "Lagos, Nigeria",
    category: "Conference",
    price: 15000,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 2,
    title: "Live Music Festival",
    date: "October 18, 2026",
    location: "Abuja, Nigeria",
    category: "Music",
    price: 10000,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 3,
    title: "Business & Startup Summit",
    date: "November 2, 2026",
    location: "Lagos, Nigeria",
    category: "Business",
    price: 20000,
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85",
  },
];

const categories = ["Music", "Conferences", "Sports", "Comedy", "Parties"];

function Home() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    const featuredEvents = mockEvents.slice(0, 3);

    if (!query) {
      navigate("/events");
      return;
    }

    navigate(`/events?search=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/events?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container home-hero-container">
          <div className="home-hero-content">
            <p className="home-eyebrow">DISCOVER · BOOK · EXPERIENCE</p>

            <h1>
              Find events
              <br />
              worth remembering.
            </h1>

            <p className="home-hero-description">
              Discover concerts, conferences, festivals, parties, and other
              experiences happening around you.
            </p>

            <form className="home-search" onSubmit={handleSearch}>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search for events, venues or experiences..."
                aria-label="Search for events"
              />

              <button type="submit">Search events</button>
            </form>

            <div className="home-hero-meta">
              <span>Easy booking</span>
              <span>Digital tickets</span>
              <span>Secure checkout</span>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="hero-feature-card">
              <img
                src={featuredEvents[0].image}
                alt={featuredEvents[0].title}
              />

              <div className="hero-feature-overlay">
                <span>Featured experience</span>

                <strong>{featuredEvents[0].title}</strong>

                <p>
                  {featuredEvents[0].date} · {featuredEvents[0].location}
                </p>
              </div>
            </div>

            <div className="hero-floating-card">
              <span className="hero-floating-label">THIS WEEK</span>

              <strong>Hundreds of experiences</strong>

              <span>Discover something new</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-category-section">
        <div className="container">
          <div className="home-section-heading home-category-heading">
            <div>
              <p className="home-section-eyebrow">EXPLORE</p>
              <h2>Find something for every occasion.</h2>
            </div>

            <Link to="/events" className="home-text-link">
              View all events
            </Link>
          </div>

          <div className="home-categories">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className="home-category"
                onClick={() => handleCategoryClick(category)}
              >
                <span>{category}</span>
                <span className="home-category-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="home-featured-section">
        <div className="container">
          <div className="home-section-heading">
            <div>
              <p className="home-section-eyebrow">DON'T MISS OUT</p>

              <h2>Featured events</h2>

              <p className="home-section-description">
                Discover some of the experiences people are looking forward to.
              </p>
            </div>

            <Link to="/events" className="home-text-link">
              Browse all events →
            </Link>
          </div>

          <div className="home-events-grid">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-how-section">
        <div className="container">
          <div className="home-section-heading home-how-heading">
            <div>
              <p className="home-section-eyebrow">SIMPLE & EASY</p>

              <h2>From discovery to event day.</h2>
            </div>
          </div>

          <div className="home-steps">
            <div className="home-step">
              <span className="home-step-number">01</span>

              <h3>Discover</h3>

              <p>
                Browse events and find experiences that match your interests.
              </p>
            </div>

            <div className="home-step">
              <span className="home-step-number">02</span>

              <h3>Choose your ticket</h3>

              <p>Select the ticket option that fits your plans and budget.</p>
            </div>

            <div className="home-step">
              <span className="home-step-number">03</span>

              <h3>Book securely</h3>

              <p>Complete your booking and receive your digital ticket.</p>
            </div>

            <div className="home-step">
              <span className="home-step-number">04</span>

              <h3>Show up</h3>

              <p>Present your ticket and enjoy the experience.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta">
            <div>
              <p className="home-section-eyebrow">YOUR NEXT EXPERIENCE</p>

              <h2>There is always something happening.</h2>

              <p>
                Explore upcoming events and find your next memorable experience.
              </p>
            </div>

            <Link to="/events" className="home-cta-button">
              Explore events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
