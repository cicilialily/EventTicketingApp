import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  LoaderCircle,
  MapPin,
  QrCode,
  Ticket as TicketIcon,
  TicketCheck,
  X,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { getMyTickets, getTicketQr } from "../../services/myTickets.service";
import "./Tickets.css";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    month: "long",
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
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "ticket-status active";

    case "USED":
    case "CHECKED_IN":
      return "ticket-status used";

    case "CANCELLED":
      return "ticket-status cancelled";

    default:
      return "ticket-status";
  }
}

function getStatusIcon(status) {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return <CheckCircle2 size={16} />;

    case "USED":
    case "CHECKED_IN":
      return <TicketCheck size={16} />;

    case "CANCELLED":
      return <XCircle size={16} />;

    default:
      return <TicketIcon size={16} />;
  }
}

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMyTickets();

        setTickets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load tickets:", error);

        setErrorMessage(
          error.message || "We couldn't load your tickets. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTickets();
  }, []);

  async function handleViewQr(ticket) {
    try {
      setSelectedTicket(ticket);
      setQrImageUrl("");
      setQrError("");
      setIsQrLoading(true);

      const qrBlob = await getTicketQr(ticket.id);

      const imageUrl = URL.createObjectURL(qrBlob);

      setQrImageUrl(imageUrl);
    } catch (error) {
      console.error("Failed to load ticket QR:", error);

      setQrError(error.message || "We couldn't load this ticket's QR code.");
    } finally {
      setIsQrLoading(false);
    }
  }

  function handleCloseQr() {
    if (qrImageUrl) {
      URL.revokeObjectURL(qrImageUrl);
    }

    setSelectedTicket(null);
    setQrImageUrl("");
    setQrError("");
  }

  useEffect(() => {
    return () => {
      if (qrImageUrl) {
        URL.revokeObjectURL(qrImageUrl);
      }
    };
  }, [qrImageUrl]);

  if (isLoading) {
    return (
      <main className="tickets-page">
        <div className="tickets-loading">
          <LoaderCircle className="tickets-spinner" size={38} />
          <h2>Loading your tickets...</h2>
          <p>Please wait while we retrieve your tickets.</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="tickets-page">
        <div className="tickets-error">
          <div className="tickets-empty-icon">
            <XCircle size={32} />
          </div>

          <h2>Unable to load tickets</h2>
          <p>{errorMessage}</p>

          <button
            type="button"
            className="tickets-retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="tickets-page">
      <div className="tickets-container">
        <section className="tickets-header">
          <div>
            <span className="tickets-eyebrow">YOUR TICKETS</span>
            <h1>My Tickets</h1>
            <p>
              View and manage the tickets you have purchased for upcoming
              events.
            </p>
          </div>

          <div className="tickets-count">
            <TicketIcon size={20} />
            <span>
              {tickets.length} {tickets.length === 1 ? "Ticket" : "Tickets"}
            </span>
          </div>
        </section>

        {tickets.length === 0 ? (
          <section className="tickets-empty">
            <div className="tickets-empty-icon">
              <TicketIcon size={40} />
            </div>

            <h2>No tickets yet</h2>
            <p>
              You haven't purchased any tickets yet. Your tickets will appear
              here after you complete a purchase.
            </p>
          </section>
        ) : (
          <section className="tickets-list">
            {tickets.map((ticket) => {
              const event = ticket.event;
              const ticketType = ticket.ticketType;

              const eventImage =
                event?.images?.[0]?.imageUrl ||
                "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80";

              return (
                <article className="ticket-card" key={ticket.id}>
                  <div className="ticket-image-wrapper">
                    <img
                      src={eventImage}
                      alt={event?.title || "Event"}
                      className="ticket-image"
                    />

                    <div className={getStatusClass(ticket.status)}>
                      {getStatusIcon(ticket.status)}

                      <span>
                        {ticket.status
                          ? ticket.status.replace("_", " ")
                          : "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="ticket-content">
                    <div className="ticket-top">
                      <div>
                        <span className="ticket-type-label">
                          {ticketType?.name || "Ticket"}
                        </span>

                        <h2>{event?.title || "Event"}</h2>
                      </div>
                    </div>

                    <div className="ticket-details">
                      <div className="ticket-detail">
                        <CalendarDays size={18} />

                        <div>
                          <span>Date</span>
                          <strong>{formatDate(event?.startDate)}</strong>
                        </div>
                      </div>

                      <div className="ticket-detail">
                        <Clock size={18} />

                        <div>
                          <span>Time</span>
                          <strong>
                            {formatTime(event?.startDate) || "Time unavailable"}
                          </strong>
                        </div>
                      </div>

                      <div className="ticket-detail">
                        <MapPin size={18} />

                        <div>
                          <span>Location</span>
                          <strong>
                            {[event?.venue, event?.address]
                              .filter(Boolean)
                              .join(", ") || "Location unavailable"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="ticket-divider" />

                    <div className="ticket-footer">
                      <div>
                        <span>Ticket Number</span>
                        <strong>{ticket.ticketNumber}</strong>
                      </div>

                      <button
                        type="button"
                        className="view-qr-button"
                        onClick={() => handleViewQr(ticket)}
                      >
                        <QrCode size={18} />
                        View QR Code
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {selectedTicket && (
        <div className="qr-modal-overlay" onClick={handleCloseQr}>
          <div
            className="qr-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="qr-modal-close"
              onClick={handleCloseQr}
              aria-label="Close QR code"
            >
              <X size={20} />
            </button>

            <div className="qr-modal-icon">
              <QrCode size={26} />
            </div>

            <span className="tickets-eyebrow">DIGITAL TICKET</span>

            <h2>{selectedTicket.event?.title || "Event Ticket"}</h2>

            <p className="qr-ticket-number">{selectedTicket.ticketNumber}</p>

            <div className="qr-code-container">
              {isQrLoading && (
                <div className="qr-loading">
                  <LoaderCircle className="tickets-spinner" size={34} />
                  <span>Loading QR code...</span>
                </div>
              )}

              {!isQrLoading && qrError && (
                <div className="qr-error">
                  <XCircle size={32} />
                  <p>{qrError}</p>
                </div>
              )}

              {!isQrLoading && !qrError && qrImageUrl && (
                <img
                  src={qrImageUrl}
                  alt={`QR code for ${selectedTicket.ticketNumber}`}
                  className="qr-code-image"
                />
              )}
            </div>

            {!isQrLoading && !qrError && qrImageUrl && (
              <p className="qr-instruction">
                Present this QR code at the event entrance for ticket
                validation.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default Tickets;
