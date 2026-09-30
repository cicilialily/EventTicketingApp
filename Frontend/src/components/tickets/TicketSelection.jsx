import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Ticket } from "lucide-react";

import "./TicketSelection.css";

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₦0";
  }

  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAvailability(ticketType) {
  const quantity = Number(ticketType.quantity) || 0;
  const quantitySold = Number(ticketType.quantitySold) || 0;

  return Math.max(quantity - quantitySold, 0);
}

function getSaleStatus(ticketType) {
  const now = new Date();

  const saleStart = ticketType.saleStart
    ? new Date(ticketType.saleStart)
    : null;

  const saleEnd = ticketType.saleEnd ? new Date(ticketType.saleEnd) : null;

  if (saleStart && now < saleStart) {
    return {
      type: "upcoming",
      label: `Sales start ${formatDate(ticketType.saleStart)}`,
    };
  }

  if (saleEnd && now > saleEnd) {
    return {
      type: "ended",
      label: "Sales ended",
    };
  }

  return {
    type: "active",
    label: "Available",
  };
}

function TicketSelection({ ticketTypes = [], onContinue }) {
  const [selectedTickets, setSelectedTickets] = useState({});

  useEffect(() => {
    setSelectedTickets({});
  }, [ticketTypes]);

  const ticketOptions = useMemo(() => {
    return ticketTypes.map((ticketType) => {
      const available = getAvailability(ticketType);
      const saleStatus = getSaleStatus(ticketType);

      return {
        ...ticketType,
        available,
        saleStatus,
        isSelectable: available > 0 && saleStatus.type === "active",
      };
    });
  }, [ticketTypes]);

  const totalQuantity = useMemo(() => {
    return Object.values(selectedTickets).reduce(
      (total, quantity) => total + quantity,
      0,
    );
  }, [selectedTickets]);

  const totalAmount = useMemo(() => {
    return ticketOptions.reduce((total, ticketType) => {
      const quantity = selectedTickets[ticketType.id] || 0;

      return total + quantity * Number(ticketType.price || 0);
    }, 0);
  }, [selectedTickets, ticketOptions]);

  function updateQuantity(ticketType, change) {
    if (!ticketType.isSelectable) {
      return;
    }

    const currentQuantity = selectedTickets[ticketType.id] || 0;
    const maximumQuantity = Math.min(ticketType.available, 10);

    const nextQuantity = Math.max(
      0,
      Math.min(currentQuantity + change, maximumQuantity),
    );

    setSelectedTickets((current) => ({
      ...current,
      [ticketType.id]: nextQuantity,
    }));
  }

  function handleContinue() {
    if (totalQuantity === 0) {
      return;
    }

    const selected = ticketOptions
      .filter((ticketType) => (selectedTickets[ticketType.id] || 0) > 0)
      .map((ticketType) => ({
        ticketTypeId: ticketType.id,
        name: ticketType.name,
        quantity: selectedTickets[ticketType.id],
        price: Number(ticketType.price),
        subtotal:
          selectedTickets[ticketType.id] * Number(ticketType.price || 0),
      }));

    if (onContinue) {
      onContinue({
        tickets: selected,
        totalQuantity,
        totalAmount,
      });
    }
  }

  if (!ticketTypes.length) {
    return (
      <section className="ticket-selection">
        <div className="ticket-selection-empty">
          <Ticket size={24} />
          <div>
            <h3>Tickets are not available yet</h3>
            <p>Ticket options for this event have not been added yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="ticket-selection">
      <div className="ticket-selection-header">
        <div>
          <span className="ticket-selection-eyebrow">Tickets</span>

          <h2>Select your tickets</h2>

          <p>Choose the ticket type and quantity you need.</p>
        </div>
      </div>

      <div className="ticket-selection-list">
        {ticketOptions.map((ticketType) => {
          const quantity = selectedTickets[ticketType.id] || 0;

          return (
            <article
              key={ticketType.id}
              className={`ticket-option ${
                !ticketType.isSelectable ? "ticket-option-disabled" : ""
              }`}
            >
              <div className="ticket-option-main">
                <div className="ticket-option-icon">
                  <Ticket size={20} />
                </div>

                <div className="ticket-option-info">
                  <div className="ticket-option-title-row">
                    <h3>{ticketType.name}</h3>

                    {ticketType.available > 0 &&
                      ticketType.available <= 10 &&
                      ticketType.saleStatus.type === "active" && (
                        <span className="ticket-option-low-stock">
                          {ticketType.available} left
                        </span>
                      )}
                  </div>

                  {ticketType.description && (
                    <p className="ticket-option-description">
                      {ticketType.description}
                    </p>
                  )}

                  <span
                    className={`ticket-option-status ticket-option-status-${ticketType.saleStatus.type}`}
                  >
                    {ticketType.saleStatus.label}
                  </span>
                </div>
              </div>

              <div className="ticket-option-right">
                <strong className="ticket-option-price">
                  {formatCurrency(ticketType.price)}
                </strong>

                {ticketType.isSelectable ? (
                  <div className="ticket-quantity-control">
                    <button
                      type="button"
                      aria-label={`Decrease ${ticketType.name} quantity`}
                      onClick={() => updateQuantity(ticketType, -1)}
                      disabled={quantity === 0}
                    >
                      <Minus size={16} />
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      aria-label={`Increase ${ticketType.name} quantity`}
                      onClick={() => updateQuantity(ticketType, 1)}
                      disabled={quantity >= Math.min(ticketType.available, 10)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="ticket-option-unavailable">
                    {ticketType.available === 0 ? "Sold out" : "Unavailable"}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="ticket-selection-summary">
        <div className="ticket-summary-details">
          <span>
            {totalQuantity} {totalQuantity === 1 ? "ticket" : "tickets"}
          </span>

          <strong>{formatCurrency(totalAmount)}</strong>
        </div>

        <button
          type="button"
          className="ticket-selection-continue"
          disabled={totalQuantity === 0}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </section>
  );
}

export default TicketSelection;
