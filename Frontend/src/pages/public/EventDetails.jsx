import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getEventById } from "../../services/eventService";

import TicketSelection from "../../components/tickets/TicketSelection";
import OrderSummary from "../../components/tickets/OrderSummary";

import "./EventDetails.css";

function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedTickets, setSelectedTickets] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadEvent() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const eventData = await getEventById(id);

        if (isMounted) {
          setEvent(eventData);
        }
      } catch (error) {
        console.error("Unable to load event:", error);

        if (isMounted) {
          if (error.status === 404) {
            setErrorMessage("We couldn't find that event.");
          } else {
            setErrorMessage(error.message || "Unable to load this event.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [id]);

  function handleTicketContinue(selection) {
    setSelectedTickets(selection);
    setCheckoutMessage("");
  }

  function handleBackToSelection() {
    setSelectedTickets(null);
    setCheckoutMessage("");
  }

  function handleCheckout() {
    setCheckoutMessage(
      "Checkout will be connected when the Orders and Tickets API is ready.",
    );
  }

  if (isLoading) {
    return (
      <main className="event-details-page">
        <div className="container">
          <section className="event-not-found">
            <p className="event-details-eyebrow">LOADING EVENT</p>

            <h1>Loading event...</h1>

            <p>Please wait while we retrieve the event information.</p>
          </section>
        </div>
      </main>
    );
  }

  if (!event || errorMessage) {
    return (
      <main className="event-details-page">
        <div className="container">
          <section className="event-not-found">
            <p className="event-details-eyebrow">EVENT NOT FOUND</p>

            <h1>{errorMessage || "We couldn't find that event."}</h1>

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

  const date = event.startDate
    ? new Date(event.startDate).toLocaleDateString("en-NG", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : event.date || "Date to be announced";

  const time = event.startDate
    ? new Date(event.startDate).toLocaleTimeString("en-NG", {
        hour: "numeric",
        minute: "2-digit",
      })
    : event.time || "";

  const location =
    event.location ||
    [event.venue, event.address].filter(Boolean).join(", ") ||
    "Location to be announced";

  const ticketTypes = Array.isArray(event.ticketTypes) ? event.ticketTypes : [];

  return (
    <main className="event-details-page">
      <div className="container">
        <Link to="/events" className="event-details-back">
          ← Back to events
        </Link>

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
        </section>

        {/* Ticket purchasing flow */}
        <section className="event-ticket-section">
          {!selectedTickets ? (
            <TicketSelection
              ticketTypes={ticketTypes}
              onContinue={handleTicketContinue}
            />
          ) : (
            <OrderSummary
              event={event}
              selection={selectedTickets}
              onBack={handleBackToSelection}
              onContinue={handleCheckout}
            />
          )}

          {checkoutMessage && (
            <p className="event-ticket-selection-message">{checkoutMessage}</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default EventDetails;
