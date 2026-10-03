import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  MapPin,
  Plus,
  Save,
  Ticket,
  Trash2,
} from "lucide-react";

import {
  getEventCategories,
  getMyEvents,
  updateManagedEvent,
} from "../../services/eventManagement.service";

import "./EditEvent.css";

function formatDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function createEmptyTicketType() {
  return {
    id: "",
    name: "",
    description: "",
    price: "",
    quantity: "",
    quantitySold: 0,
    saleStart: "",
    saleEnd: "",
  };
}

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    venue: "",
    address: "",
    startDate: "",
    endDate: "",
    status: "DRAFT",
    ticketTypes: [],
  });

  useEffect(() => {
    async function loadEvent() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [events, categoryData] = await Promise.all([
          getMyEvents(),
          getEventCategories(),
        ]);

        const managedEvents = Array.isArray(events) ? events : [];
        const event = managedEvents.find((item) => item.id === id);

        if (!event) {
          setErrorMessage("Event not found or you do not have access to it.");
          return;
        }

        setCategories(Array.isArray(categoryData) ? categoryData : []);

        const existingTicketTypes = Array.isArray(event.ticketTypes)
          ? event.ticketTypes.map((ticketType) => ({
              id: ticketType.id || "",
              name: ticketType.name || "",
              description: ticketType.description || "",
              price:
                ticketType.price !== undefined && ticketType.price !== null
                  ? String(ticketType.price)
                  : "",
              quantity:
                ticketType.quantity !== undefined &&
                ticketType.quantity !== null
                  ? String(ticketType.quantity)
                  : "",
              quantitySold: Number(ticketType.quantitySold || 0),
              saleStart: formatDateTimeLocal(ticketType.saleStart),
              saleEnd: formatDateTimeLocal(ticketType.saleEnd),
            }))
          : [];

        setFormData({
          title: event.title || "",
          description: event.description || "",
          categoryId: event.categoryId || event.category?.id || "",
          venue: event.venue || "",
          address: event.address || "",
          startDate: formatDateTimeLocal(event.startDate),
          endDate: formatDateTimeLocal(event.endDate),
          status: event.status || "DRAFT",
          ticketTypes: existingTicketTypes,
        });
      } catch (error) {
        console.error("Failed to load event:", error);

        setErrorMessage(
          error.message || "Unable to load this event. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleTicketChange(index, field, value) {
    setFormData((current) => {
      const updatedTicketTypes = [...current.ticketTypes];

      updatedTicketTypes[index] = {
        ...updatedTicketTypes[index],
        [field]: value,
      };

      return {
        ...current,
        ticketTypes: updatedTicketTypes,
      };
    });

    setErrorMessage("");
    setSuccessMessage("");
  }

  function addTicketType() {
    setFormData((current) => ({
      ...current,
      ticketTypes: [...current.ticketTypes, createEmptyTicketType()],
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function removeTicketType(index) {
    const ticketType = formData.ticketTypes[index];

    if (ticketType?.quantitySold > 0) {
      setErrorMessage(
        `"${ticketType.name}" cannot be removed because tickets have already been sold.`,
      );
      return;
    }

    setFormData((current) => ({
      ...current,
      ticketTypes: current.ticketTypes.filter(
        (_, ticketIndex) => ticketIndex !== index,
      ),
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function validateForm() {
    if (formData.title.trim().length < 3) {
      return "Event title must be at least 3 characters.";
    }

    if (formData.description.trim().length < 10) {
      return "Event description must be at least 10 characters.";
    }

    if (!formData.categoryId) {
      return "Please select an event category.";
    }

    if (formData.venue.trim().length < 2) {
      return "Please enter the event venue.";
    }

    if (formData.address.trim().length < 2) {
      return "Please enter the event address.";
    }

    if (!formData.startDate) {
      return "Please select the event start date and time.";
    }

    if (!formData.endDate) {
      return "Please select the event end date and time.";
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      return "Event end date and time must be after the start date and time.";
    }

    for (let index = 0; index < formData.ticketTypes.length; index += 1) {
      const ticketType = formData.ticketTypes[index];

      if (!ticketType.name.trim()) {
        return `Please enter a name for ticket type ${index + 1}.`;
      }

      const price = Number(ticketType.price);

      if (ticketType.price === "" || !Number.isFinite(price) || price < 0) {
        return `Please enter a valid price for "${ticketType.name}".`;
      }

      const quantity = Number(ticketType.quantity);

      if (
        ticketType.quantity === "" ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return `Please enter a valid quantity for "${ticketType.name}".`;
      }

      if (quantity < Number(ticketType.quantitySold || 0)) {
        return `Quantity for "${ticketType.name}" cannot be less than the number of tickets already sold (${ticketType.quantitySold}).`;
      }

      if (ticketType.saleStart && ticketType.saleEnd) {
        const saleStart = new Date(ticketType.saleStart);
        const saleEnd = new Date(ticketType.saleEnd);

        if (saleEnd <= saleStart) {
          return `Ticket sale end must be after sale start for "${ticketType.name}".`;
        }
      }
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const ticketTypes = formData.ticketTypes.map((ticketType) => {
        const payload = {
          name: ticketType.name.trim(),
          description: ticketType.description.trim() || null,
          price: Number(ticketType.price),
          quantity: Number(ticketType.quantity),
          saleStart: ticketType.saleStart
            ? new Date(ticketType.saleStart).toISOString()
            : null,
          saleEnd: ticketType.saleEnd
            ? new Date(ticketType.saleEnd).toISOString()
            : null,
        };

        if (ticketType.id) {
          payload.id = ticketType.id;
        }

        return payload;
      });

      await updateManagedEvent(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        venue: formData.venue.trim(),
        address: formData.address.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: formData.status,
        ticketTypes,
      });

      setSuccessMessage("Event updated successfully.");

      setTimeout(() => {
        navigate("/organizer/events");
      }, 900);
    } catch (error) {
      console.error("Update event failed:", error);

      setErrorMessage(
        error.message || "Unable to update this event. Please try again.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="edit-event-page">
        <div className="edit-event-state">
          <LoaderCircle size={38} className="edit-event-spinner" />

          <h2>Loading event...</h2>

          <p>Please wait while we retrieve the event details.</p>
        </div>
      </main>
    );
  }

  if (errorMessage && !formData.title) {
    return (
      <main className="edit-event-page">
        <div className="edit-event-state">
          <h2>Unable to load event</h2>

          <p>{errorMessage}</p>

          <button
            type="button"
            className="edit-event-back-button"
            onClick={() => navigate("/organizer/events")}
          >
            <ArrowLeft size={18} />
            Back to My Events
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-event-page">
      <div className="edit-event-container">
        <button
          type="button"
          className="edit-event-back-link"
          onClick={() => navigate("/organizer/events")}
        >
          <ArrowLeft size={18} />
          Back to My Events
        </button>

        <header className="edit-event-header">
          <span className="edit-event-eyebrow">ORGANIZER TOOLS</span>

          <h1>Edit Event</h1>

          <p>
            Update your event details, ticket types, pricing, and sales period.
          </p>
        </header>

        {errorMessage && (
          <div className="edit-event-alert edit-event-alert-error" role="alert">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            className="edit-event-alert edit-event-alert-success"
            role="status"
          >
            {successMessage}
          </div>
        )}

        <form className="edit-event-form" onSubmit={handleSubmit}>
          {/* EVENT INFORMATION */}

          <section className="edit-event-section">
            <div className="edit-event-section-heading">
              <div className="edit-event-section-icon">
                <CalendarDays size={20} />
              </div>

              <div>
                <h2>Event Information</h2>

                <p>Update the main information attendees see.</p>
              </div>
            </div>

            <div className="edit-event-fields">
              <div className="edit-event-field full-width">
                <label htmlFor="title">Event title</label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="edit-event-field full-width">
                <label htmlFor="description">Description</label>

                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="edit-event-field">
                <label htmlFor="categoryId">Category</label>

                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-event-field">
                <label htmlFor="status">Event status</label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </section>

          {/* LOCATION & SCHEDULE */}

          <section className="edit-event-section">
            <div className="edit-event-section-heading">
              <div className="edit-event-section-icon">
                <MapPin size={20} />
              </div>

              <div>
                <h2>Location & Schedule</h2>

                <p>Update the event venue, address, and schedule.</p>
              </div>
            </div>

            <div className="edit-event-fields">
              <div className="edit-event-field">
                <label htmlFor="venue">Venue</label>

                <input
                  id="venue"
                  name="venue"
                  type="text"
                  value={formData.venue}
                  onChange={handleChange}
                />
              </div>

              <div className="edit-event-field">
                <label htmlFor="address">Address</label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="edit-event-field">
                <label htmlFor="startDate">Start date & time</label>

                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="edit-event-field">
                <label htmlFor="endDate">End date & time</label>

                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* TICKET TYPES */}

          <section className="edit-event-section">
            <div className="edit-event-section-heading">
              <div className="edit-event-section-icon">
                <Ticket size={20} />
              </div>

              <div>
                <h2>Ticket Types</h2>

                <p>Manage ticket prices, quantities, and sales periods.</p>
              </div>
            </div>

            <div className="edit-event-ticket-list">
              {formData.ticketTypes.length === 0 && (
                <div className="edit-event-ticket-empty">
                  <p>No ticket types have been added to this event.</p>

                  <button
                    type="button"
                    className="edit-event-add-ticket-button"
                    onClick={addTicketType}
                  >
                    <Plus size={18} />
                    Add Ticket Type
                  </button>
                </div>
              )}

              {formData.ticketTypes.map((ticketType, index) => (
                <div
                  className="edit-event-ticket-card"
                  key={ticketType.id || `new-ticket-${index}`}
                >
                  <div className="edit-event-ticket-header">
                    <div>
                      <h3>{ticketType.name || `Ticket Type ${index + 1}`}</h3>

                      {ticketType.quantitySold > 0 && (
                        <p>
                          {ticketType.quantitySold} ticket
                          {ticketType.quantitySold === 1 ? "" : "s"} already
                          sold
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="edit-event-remove-ticket-button"
                      onClick={() => removeTicketType(index)}
                      disabled={isSubmitting || ticketType.quantitySold > 0}
                      title={
                        ticketType.quantitySold > 0
                          ? "Cannot remove a ticket type with tickets already sold"
                          : "Remove ticket type"
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="edit-event-fields">
                    <div className="edit-event-field">
                      <label htmlFor={`ticket-name-${index}`}>
                        Ticket name
                      </label>

                      <input
                        id={`ticket-name-${index}`}
                        type="text"
                        value={ticketType.name}
                        onChange={(event) =>
                          handleTicketChange(index, "name", event.target.value)
                        }
                        placeholder="e.g. Regular"
                      />
                    </div>

                    <div className="edit-event-field">
                      <label htmlFor={`ticket-price-${index}`}>Price (₦)</label>

                      <input
                        id={`ticket-price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticketType.price}
                        onChange={(event) =>
                          handleTicketChange(index, "price", event.target.value)
                        }
                        placeholder="3500"
                      />
                    </div>

                    <div className="edit-event-field">
                      <label htmlFor={`ticket-quantity-${index}`}>
                        Total quantity
                      </label>

                      <input
                        id={`ticket-quantity-${index}`}
                        type="number"
                        min={Math.max(1, Number(ticketType.quantitySold || 0))}
                        step="1"
                        value={ticketType.quantity}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "quantity",
                            event.target.value,
                          )
                        }
                      />

                      {ticketType.quantitySold > 0 && (
                        <small>
                          At least {ticketType.quantitySold} must remain because
                          those tickets have already been sold.
                        </small>
                      )}
                    </div>

                    <div className="edit-event-field full-width">
                      <label htmlFor={`ticket-description-${index}`}>
                        Ticket description
                      </label>

                      <textarea
                        id={`ticket-description-${index}`}
                        rows={3}
                        value={ticketType.description}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="Describe what this ticket includes..."
                      />
                    </div>

                    <div className="edit-event-field">
                      <label htmlFor={`ticket-sale-start-${index}`}>
                        Sales start
                      </label>

                      <input
                        id={`ticket-sale-start-${index}`}
                        type="datetime-local"
                        value={ticketType.saleStart}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "saleStart",
                            event.target.value,
                          )
                        }
                      />

                      <small>
                        Leave empty to make tickets available immediately.
                      </small>
                    </div>

                    <div className="edit-event-field">
                      <label htmlFor={`ticket-sale-end-${index}`}>
                        Sales end
                      </label>

                      <input
                        id={`ticket-sale-end-${index}`}
                        type="datetime-local"
                        value={ticketType.saleEnd}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "saleEnd",
                            event.target.value,
                          )
                        }
                      />

                      <small>
                        Leave empty to keep sales open until the event system
                        closes them.
                      </small>
                    </div>
                  </div>
                </div>
              ))}

              {formData.ticketTypes.length > 0 && (
                <button
                  type="button"
                  className="edit-event-add-ticket-button"
                  onClick={addTicketType}
                  disabled={isSubmitting}
                >
                  <Plus size={18} />
                  Add Another Ticket Type
                </button>
              )}
            </div>
          </section>

          {/* ACTIONS */}

          <section className="edit-event-actions-section">
            <button
              type="button"
              className="edit-event-cancel-button"
              onClick={() => navigate("/organizer/events")}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-event-save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="edit-event-spinner" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}

export default EditEvent;
