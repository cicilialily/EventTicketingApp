import { Link } from "react-router-dom";

import "./EventCard.css";

function formatCurrency(value) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "Price unavailable";
  }

  return `₦${amount.toLocaleString("en-NG")}`;
}

function EventCard({ event }) {
  return (
    <article className="event-card">
      <Link to={`/events/${event.id}`} className="event-card-image-link">
        <div className="event-card-image-wrapper">
          <img
            src={event.image}
            alt={event.title}
            className="event-card-image"
          />

          {event.category && (
            <span className="event-card-category">{event.category}</span>
          )}
        </div>
      </Link>

      <div className="event-card-content">
        <p className="event-card-date">{event.date}</p>

        <Link to={`/events/${event.id}`} className="event-card-title-link">
          <h3 className="event-card-title">{event.title}</h3>
        </Link>

        <p className="event-card-location">{event.location}</p>

        <div className="event-card-footer">
          <div className="event-card-price">
            <span>From</span>
            <strong>{formatCurrency(event.price)}</strong>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="event-card-button"
          >
            View event
          </Link>
        </div>
      </div>
    </article>
  );
}

export default EventCard;