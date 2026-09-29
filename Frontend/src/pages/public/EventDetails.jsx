import { Link, useParams } from "react-router-dom";

import { mockEvents } from "../../data/mockEvents";

import "./EventDetails.css";

function EventDetails() {
  const { id } = useParams();

  const event = mockEvents.find((item) => String(item.id) === String(id));

  if (!event) {
    return (
      <main className="event-details-page">
        <div className="container">
          <section className="event-not-found">
            <p className="event-details-eyebrow">EVENT NOT FOUND</p>

            <h1>We couldn't find that event.</h1>

            <p>The event may have been removed or the link may be incorrect.</p>

            <Link to="/events" className="event-details-back-button">
              Browse events
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const image =
    event.image ||
    event.imageUrl ||
    event.images?.find((item) => item.isPrimary)?.imageUrl ||
    event.images?.[0]?.imageUrl ||
    "";

  const category = event.category?.name || event.category || "Event";

  const date =
    event.date ||
    (event.startDate
      ? new Date(event.startDate).toLocaleDateString("en-NG", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "Date to be announced");

  const time =
    event.time ||
    (event.startDate
      ? new Date(event.startDate).toLocaleTimeString("en-NG", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "");

  const location =
    event.location ||
    [event.venue, event.address].filter(Boolean).join(", ") ||
    "Location to be announced";

  const price =
    typeof event.price === "number"
      ? event.price
      : event.price
        ? Number(event.price)
        : null;

  return (
    <main className="event-details-page">
      <div className="container">
        {/* Back link */}
        <Link to="/events" className="event-details-back">
          ← Back to events
        </Link>

        {/* Hero image */}
        <section className="event-details-hero">
          <div className="event-details-image-wrapper">
            {image ? (
              <img
                src={image}
                alt={event.title}
                className="event-details-image"
              />
            ) : (
              <div className="event-details-image-placeholder">
                <span>Event</span>
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="event-details-content">
          <div className="event-details-main">
            <span className="event-details-category">{category}</span>

            <h1>{event.title}</h1>

            <p className="event-details-description">
              {event.description ||
                "More information about this event will be available soon."}
            </p>

            <div className="event-details-info-grid">
              <div className="event-details-info">
                <span className="event-details-info-icon">📅</span>

                <div>
                  <span className="event-details-info-label">Date</span>
                  <strong>{date}</strong>
                </div>
              </div>

              {time && (
                <div className="event-details-info">
                  <span className="event-details-info-icon">🕐</span>

                  <div>
                    <span className="event-details-info-label">Time</span>
                    <strong>{time}</strong>
                  </div>
                </div>
              )}

              <div className="event-details-info">
                <span className="event-details-info-icon">📍</span>

                <div>
                  <span className="event-details-info-label">Location</span>
                  <strong>{location}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket card */}
          <aside className="event-ticket-card">
            <p className="event-ticket-eyebrow">TICKETS</p>

            <h2>Get your ticket</h2>

            <p className="event-ticket-description">
              Secure your place at this event. Ticket purchasing will be
              available when ticket sales are enabled.
            </p>

            <div className="event-ticket-price">
              <span>Starting from</span>

              <strong>
                {price !== null && Number.isFinite(price)
                  ? `₦${price.toLocaleString("en-NG")}`
                  : "Price coming soon"}
              </strong>
            </div>

            <button type="button" className="event-ticket-button" disabled>
              Tickets coming soon
            </button>

            <p className="event-ticket-note">
              Ticket purchasing will be connected to the backend once the events
              and orders APIs are ready.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default EventDetails;
