import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getEventById } from "../../services/eventService";
import { payOrder } from "../../services/orderService";

import TicketSelection from "../../components/tickets/TicketSelection";
import OrderSummary from "../../components/tickets/OrderSummary";

import "./EventDetails.css";

function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedTickets, setSelectedTickets] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [isPaying, setIsPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");

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
    setCreatedOrder(null);
    setPaymentMessage("");
    setPaymentError("");
  }

  function handleBackToSelection() {
    setSelectedTickets(null);
    setCreatedOrder(null);
    setPaymentMessage("");
    setPaymentError("");
  }

  function handleOrderCreated(order) {
    setCreatedOrder(order);
    setPaymentMessage("");
    setPaymentError("");
  }

  async function handlePayment() {
    if (!createdOrder?.id) {
      setPaymentError("No order is available for payment.");
      return;
    }

    try {
      setIsPaying(true);
      setPaymentError("");
      setPaymentMessage("");

      const paidOrder = await payOrder(createdOrder.id);

      setCreatedOrder(paidOrder);
      setPaymentMessage("Payment successful. Your ticket has been generated.");
    } catch (error) {
      console.error("Unable to process payment:", error);

      setPaymentError(
        error.message || "We couldn't complete your payment. Please try again.",
      );
    } finally {
      setIsPaying(false);
    }
  }

  function handleStartOver() {
    setSelectedTickets(null);
    setCreatedOrder(null);
    setPaymentMessage("");
    setPaymentError("");
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

  const paidTickets =
    createdOrder?.items?.flatMap((item) => item.tickets || []) || [];

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

        <section className="event-ticket-section">
          {!selectedTickets ? (
            <TicketSelection
              ticketTypes={ticketTypes}
              onContinue={handleTicketContinue}
            />
          ) : !createdOrder ? (
            <OrderSummary
              event={event}
              selection={selectedTickets}
              onBack={handleBackToSelection}
              onOrderCreated={handleOrderCreated}
            />
          ) : createdOrder.status !== "PAID" ? (
            <section className="order-payment-card">
              <div className="order-payment-icon">✓</div>

              <span className="order-payment-eyebrow">ORDER CREATED</span>

              <h2>Your order is ready for payment</h2>

              <p>
                Your order <strong>{createdOrder.orderNumber}</strong> has been
                created successfully.
              </p>

              <div className="order-payment-details">
                <div>
                  <span>Status</span>
                  <strong>{createdOrder.status}</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>
                    ₦{Number(createdOrder.totalAmount).toLocaleString("en-NG")}
                  </strong>
                </div>
              </div>

              {paymentError && (
                <div className="order-payment-error" role="alert">
                  {paymentError}
                </div>
              )}

              <button
                type="button"
                className="order-payment-button"
                onClick={handlePayment}
                disabled={isPaying}
              >
                {isPaying ? "Processing payment..." : "Pay for order"}
              </button>

              <button
                type="button"
                className="order-payment-back"
                onClick={handleBackToSelection}
                disabled={isPaying}
              >
                Choose different tickets
              </button>
            </section>
          ) : (
            <section className="order-payment-success">
              <div className="order-payment-success-icon">✓</div>

              <span className="order-payment-eyebrow">PAYMENT COMPLETE</span>

              <h2>Your ticket is ready!</h2>

              <p>
                Your order <strong>{createdOrder.orderNumber}</strong> has been
                paid successfully.
              </p>

              <div className="order-payment-details">
                <div>
                  <span>Order status</span>
                  <strong>{createdOrder.status}</strong>
                </div>

                <div>
                  <span>Tickets generated</span>
                  <strong>{paidTickets.length}</strong>
                </div>
              </div>

              {paymentMessage && (
                <div className="order-payment-success-message">
                  {paymentMessage}
                </div>
              )}

              {paidTickets.length > 0 && (
                <div className="generated-ticket-list">
                  {paidTickets.map((ticket) => (
                    <div key={ticket.id} className="generated-ticket">
                      <span>Ticket number</span>
                      <strong>{ticket.ticketNumber}</strong>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="order-payment-button"
                onClick={handleStartOver}
              >
                Back to event
              </button>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

export default EventDetails;
