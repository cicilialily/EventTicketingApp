import { ArrowLeft, ShieldCheck, Ticket } from "lucide-react";

import "./OrderSummary.css";

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₦0";
  }

  return `₦${amount.toLocaleString("en-NG")}`;
}

function OrderSummary({ event, selection, onBack, onContinue }) {
  const tickets = Array.isArray(selection?.tickets) ? selection.tickets : [];

  const totalQuantity = Number(selection?.totalQuantity) || 0;
  const totalAmount = Number(selection?.totalAmount) || 0;

  return (
    <section className="order-summary">
      <div className="order-summary-header">
        <button type="button" className="order-summary-back" onClick={onBack}>
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

      <div className="order-summary-notice">
        <ShieldCheck size={20} />

        <div>
          <strong>Secure checkout</strong>

          <p>
            Your order and payment details will be processed securely when
            checkout is connected to the backend.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="order-summary-continue"
        onClick={onContinue}
      >
        Continue to checkout
      </button>

      <p className="order-summary-footnote">
        Checkout and payment processing are being connected to the Orders API.
      </p>
    </section>
  );
}

export default OrderSummary;
