import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import EventCard from "../../components/events/EventCard";
import { getEvents } from "../../services/eventService";

import "./Home.css";

const categories = ["Music", "Conferences", "Sports", "Comedy", "Parties"];

function Home() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getEvents();

        if (isMounted) {
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Unable to load homepage events:", error);

        if (isMounted) {
          setErrorMessage(
            error.message ||
              "We couldn't load events right now. Please try again.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredEvents = events.slice(0, 3);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      navigate("/events");
      return;
    }

    navigate(`/events?search=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/events?category=${encodeURIComponent(category)}`);
  };

  const heroEvent = featuredEvents[0];

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
            {heroEvent ? (
              <div className="hero-feature-card">
                <img src={heroEvent.image} alt={heroEvent.title} />

                <div className="hero-feature-overlay">
                  <span>Featured experience</span>

                  <strong>{heroEvent.title}</strong>

                  <p>
                    {heroEvent.date} · {heroEvent.location}
                  </p>
                </div>
              </div>
            ) : (
              <div className="hero-feature-card hero-feature-empty">
                <div className="hero-feature-overlay">
                  <span>EVENTTICKETING</span>

                  <strong>Your next experience starts here.</strong>

                  <p>Explore upcoming events and book your tickets.</p>
                </div>
              </div>
            )}

            <div className="hero-floating-card">
              <span className="hero-floating-label">THIS WEEK</span>

              <strong>Discover upcoming experiences</strong>

              <span>Find something new to do</span>
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

          {isLoading ? (
            <div className="home-events-state">
              <p>Loading upcoming events...</p>
            </div>
          ) : errorMessage ? (
            <div className="home-events-state">
              <p>{errorMessage}</p>
              <Link to="/events" className="home-text-link">
                View events
              </Link>
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="home-events-grid">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="home-events-state">
              <h3>No published events yet.</h3>

              <p>
                Organizers can publish an event and it will appear here
                automatically.
              </p>

              <Link to="/events" className="home-text-link">
                Explore events →
              </Link>
            </div>
          )}
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
