import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  Clock,
  LoaderCircle,
  MapPin,
  Plus,
  Ticket,
} from "lucide-react";
import { getMyEvents } from "../../services/eventManagement.service";
import "./Events.css";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  return `managed-event-status ${status?.toLowerCase() || "unknown"}`;
}

function Events() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadEvents() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMyEvents();

        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load managed events:", error);

        setErrorMessage(
          error.message || "We couldn't load your events. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (statusFilter === "ALL") {
      return events;
    }

    return events.filter((event) => event.status === statusFilter);
  }, [events, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: events.length,
      published: events.filter((event) => event.status === "PUBLISHED").length,
      drafts: events.filter((event) => event.status === "DRAFT").length,
      cancelled: events.filter((event) => event.status === "CANCELLED").length,
    };
  }, [events]);

  if (isLoading) {
    return (
      <main className="managed-events-page">
        <div className="managed-events-state">
          <LoaderCircle size={38} className="managed-events-spinner" />
          <h2>Loading your events...</h2>
          <p>Please wait while we retrieve your event management data.</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="managed-events-page">
        <div className="managed-events-state">
          <div className="managed-events-state-icon">
            <CircleAlert size={34} />
          </div>

          <h2>Unable to load events</h2>
          <p>{errorMessage}</p>

          <button
            type="button"
            className="managed-events-retry"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="managed-events-page">
      <div className="managed-events-container">
        <section className="managed-events-header">
          <div>
            <span className="managed-events-eyebrow">ORGANIZER TOOLS</span>

            <h1>My Events</h1>

            <p>Create, manage, and keep track of the events you organize.</p>
          </div>

          <button
            type="button"
            className="create-event-button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-create-event"))
            }
          >
            <Plus size={19} />
            Create Event
          </button>
        </section>

        <section className="managed-event-stats">
          <div className="managed-stat-card">
            <span>Total Events</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="managed-stat-card">
            <span>Published</span>
            <strong>{stats.published}</strong>
          </div>

          <div className="managed-stat-card">
            <span>Drafts</span>
            <strong>{stats.drafts}</strong>
          </div>

          <div className="managed-stat-card">
            <span>Cancelled</span>
            <strong>{stats.cancelled}</strong>
          </div>
        </section>

        <section className="managed-events-toolbar">
          <div>
            <h2>Event List</h2>
            <p>
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"}
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="managed-events-filter"
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </section>

        {filteredEvents.length === 0 ? (
          <section className="managed-events-empty">
            <div className="managed-events-state-icon">
              <CalendarDays size={36} />
            </div>

            <h2>
              {events.length === 0
                ? "You don't have any events yet"
                : "No events match this filter"}
            </h2>

            <p>
              {events.length === 0
                ? "Create your first event to start selling tickets."
                : "Try selecting a different event status."}
            </p>
          </section>
        ) : (
          <section className="managed-events-list">
            {filteredEvents.map((event) => {
              const primaryImage =
                event.images?.find((image) => image.isPrimary)?.imageUrl ||
                event.images?.[0]?.imageUrl ||
                "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80";

              const ticketsSold =
                event.ticketTypes?.reduce(
                  (total, ticketType) =>
                    total + (Number(ticketType.quantitySold) || 0),
                  0,
                ) || 0;

              const totalTickets =
                event.ticketTypes?.reduce(
                  (total, ticketType) =>
                    total + (Number(ticketType.quantity) || 0),
                  0,
                ) || 0;

              return (
                <article key={event.id} className="managed-event-card">
                  <div className="managed-event-image-wrapper">
                    <img
                      src={primaryImage}
                      alt={event.title}
                      className="managed-event-image"
                    />

                    <span className={getStatusClass(event.status)}>
                      {event.status}
                    </span>
                  </div>

                  <div className="managed-event-content">
                    <div className="managed-event-main">
                      <span className="managed-event-category">
                        {event.category?.name || "Event"}
                      </span>

                      <h3>{event.title}</h3>

                      <p className="managed-event-description">
                        {event.description || "No event description provided."}
                      </p>

                      <div className="managed-event-details">
                        <div>
                          <CalendarDays size={17} />
                          <span>{formatDate(event.startDate)}</span>
                        </div>

                        <div>
                          <Clock size={17} />
                          <span>
                            {formatTime(event.startDate) || "Time unavailable"}
                          </span>
                        </div>

                        <div>
                          <MapPin size={17} />
                          <span>
                            {[event.venue, event.address]
                              .filter(Boolean)
                              .join(", ") || "Location unavailable"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="managed-event-meta">
                      <div>
                        <span>Tickets</span>

                        <strong>
                          {ticketsSold} / {totalTickets}
                        </strong>

                        <Ticket size={17} />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

export default Events;
