function EventCard({ event }) {
  return (
    <article className="event-card">
      <div className="event-card-image">
        <img src={event.image} alt={event.title} />
      </div>

      <div className="event-card-content">
        <p className="event-card-date">{event.date}</p>

        <h3>{event.title}</h3>

        <p className="event-card-location">{event.location}</p>

        <div className="event-card-footer">
          <span>From ₦{event.price}</span>

          <button>View Event</button>
        </div>
      </div>
    </article>
  );
}

export default EventCard;