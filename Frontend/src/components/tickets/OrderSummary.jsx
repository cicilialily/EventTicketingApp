import { ArrowLeft, ShieldCheck, Ticket } from "lucide-react";
import { useState } from "react";

import { createOrder } from "../../services/orderService";

import "./OrderSummary.css";

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₦0";
  }

  return `₦${amount.toLocaleString("en-NG")}`;
}

function OrderSummary({ event, selection, onBack, onOrderCreated }) {
  const tickets = Array.isArray(selection?.tickets) ? selection.tickets : [];

  const totalQuantity = Number(selection?.totalQuantity) || 0;
  const totalAmount = Number(selection?.totalAmount) || 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleContinue() {
    if (!event?.id) {
      setErrorMessage("Event information is missing.");
      return;
    }

    if (tickets.length === 0) {
      setErrorMessage("Please select at least one ticket.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const order = await createOrder({
        eventId: event.id,
        items: tickets.map((ticket) => ({
          ticketTypeId: ticket.ticketTypeId,
          quantity: ticket.quantity,
        })),
      });

      if (onOrderCreated) {
        onOrderCreated(order);
      }
    } catch (error) {
      console.error("Unable to create order:", error);

      setErrorMessage(
        error.message || "We couldn't create your order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="order-summary">
      <div className="order-summary-header">
        <button
          type="button"
          className="order-summary-back"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ArrowLeft size={17} />
          Back to ticket selection
        </button>

        <div className="order-summary-heading">
          <span className="order-summary-eyebrow">Order review</span>

          <h2>Review your tickets</h2>

          <p>Check your ticket choices before continuing to checkout.</p>
        </div>
      </div>

      <div className="order-summary-event">
        <div className="order-summary-event-icon">
          <Ticket size={21} />
        </div>

        <div>
          <span>Event</span>
          <strong>{event?.title || "Selected event"}</strong>
        </div>
      </div>

      <div className="order-summary-ticket-list">
        {tickets.map((ticket) => (
          <div className="order-summary-ticket" key={ticket.ticketTypeId}>
            <div className="order-summary-ticket-info">
              <strong>{ticket.name}</strong>

              <span>
                {ticket.quantity} {ticket.quantity === 1 ? "ticket" : "tickets"}
              </span>
            </div>

            <div className="order-summary-ticket-price">
              <span>{formatCurrency(ticket.price)} each</span>

              <strong>{formatCurrency(ticket.subtotal)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="order-summary-total">
        <div>
          <span>Tickets</span>
          <strong>{totalQuantity}</strong>
        </div>

        <div>
          <span>Total</span>
          <strong>{formatCurrency(totalAmount)}</strong>
        </div>
      </div>

      {errorMessage && (
        <div className="order-summary-error" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="order-summary-notice">
        <ShieldCheck size={20} />

        <div>
          <strong>Secure checkout</strong>

          <p>
            Your order will be created securely using your authenticated
            account.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="order-summary-continue"
        onClick={handleContinue}
        disabled={isSubmitting || totalQuantity === 0}
      >
        {isSubmitting ? "Creating order..." : "Continue to checkout"}
      </button>

      <p className="order-summary-footnote">
        You will continue to payment after your order is created.
      </p>
    </section>
  );
}

export default OrderSummary;
