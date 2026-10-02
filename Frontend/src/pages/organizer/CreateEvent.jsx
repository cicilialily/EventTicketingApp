import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Plus,
  Save,
  Ticket,
  Trash2,
} from "lucide-react";

import {
  createManagedEvent,
  getEventCategories,
} from "../../services/eventManagement.service";

import "./CreateEvent.css";

function CreateEvent() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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
    imageUrl: "",
  });

  const [ticketTypes, setTicketTypes] = useState([
    {
      name: "Regular",
      description: "",
      price: "",
      quantity: "",
      saleStart: "",
      saleEnd: "",
    },
  ]);

  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoadingCategories(true);

        const data = await getEventCategories();

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load event categories:", error);

        setErrorMessage(
          error.message || "Unable to load event categories. Please try again.",
        );
      } finally {
        setIsLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

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
    setTicketTypes((current) =>
      current.map((ticket, ticketIndex) =>
        ticketIndex === index
          ? {
              ...ticket,
              [field]: value,
            }
          : ticket,
      ),
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  function addTicketType() {
    setTicketTypes((current) => [
      ...current,
      {
        name: "",
        description: "",
        price: "",
        quantity: "",
        saleStart: "",
        saleEnd: "",
      },
    ]);
  }

  function removeTicketType(index) {
    setTicketTypes((current) =>
      current.filter((_, ticketIndex) => ticketIndex !== index),
    );
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

    if (formData.imageUrl.trim()) {
      try {
        new URL(formData.imageUrl.trim());
      } catch {
        return "Please provide a valid event image URL.";
      }
    }

    if (ticketTypes.length === 0) {
      return "Please add at least one ticket type.";
    }

    for (let index = 0; index < ticketTypes.length; index += 1) {
      const ticket = ticketTypes[index];

      if (!ticket.name.trim()) {
        return `Ticket type ${index + 1} needs a name.`;
      }

      if (ticket.description.length > 500) {
        return `Ticket type ${index + 1} description is too long.`;
      }

      if (
        ticket.price === "" ||
        Number.isNaN(Number(ticket.price)) ||
        Number(ticket.price) < 0
      ) {
        return `Ticket type ${index + 1} must have a valid price.`;
      }

      if (
        ticket.quantity === "" ||
        !Number.isInteger(Number(ticket.quantity)) ||
        Number(ticket.quantity) <= 0
      ) {
        return `Ticket type ${index + 1} must have a valid quantity.`;
      }

      if (ticket.saleStart && ticket.saleEnd) {
        const saleStart = new Date(ticket.saleStart);
        const saleEnd = new Date(ticket.saleEnd);

        if (saleEnd <= saleStart) {
          return `Ticket type ${index + 1} sale end must be after sale start.`;
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
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        venue: formData.venue.trim(),
        address: formData.address.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: formData.status,

        images: formData.imageUrl.trim()
          ? [
              {
                imageUrl: formData.imageUrl.trim(),
                isPrimary: true,
              },
            ]
          : [],

        ticketTypes: ticketTypes.map((ticket) => ({
          name: ticket.name.trim(),
          description: ticket.description.trim() || null,
          price: Number(ticket.price),
          quantity: Number(ticket.quantity),
          saleStart: ticket.saleStart
            ? new Date(ticket.saleStart).toISOString()
            : null,
          saleEnd: ticket.saleEnd
            ? new Date(ticket.saleEnd).toISOString()
            : null,
        })),
      };

      await createManagedEvent(payload);

      setSuccessMessage("Event created successfully.");

      setTimeout(() => {
        navigate("/organizer/events");
      }, 900);
    } catch (error) {
      console.error("Create event failed:", error);

      setErrorMessage(
        error.message || "Unable to create the event. Please try again.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="create-event-page">
      <div className="create-event-container">
        <button
          type="button"
          className="back-to-events-button"
          onClick={() => navigate("/organizer/events")}
        >
          <ArrowLeft size={18} />
          Back to My Events
        </button>

        <header className="create-event-header">
          <span className="create-event-eyebrow">ORGANIZER TOOLS</span>

          <h1>Create Event</h1>

          <p>
            Add the details of your event, create ticket types, and choose
            whether to save it as a draft or publish it.
          </p>
        </header>

        {errorMessage && (
          <div
            className="create-event-alert create-event-alert-error"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            className="create-event-alert create-event-alert-success"
            role="status"
          >
            {successMessage}
          </div>
        )}

        <form className="create-event-form" onSubmit={handleSubmit}>
          <section className="create-event-section">
            <div className="create-event-section-heading">
              <div className="create-event-section-icon">
                <CalendarDays size={20} />
              </div>

              <div>
                <h2>Event Information</h2>
                <p>Tell attendees what your event is about.</p>
              </div>
            </div>

            <div className="create-event-fields">
              <div className="create-event-field full-width">
                <label htmlFor="title">Event title</label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Technology Conference 2026"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="create-event-field full-width">
                <label htmlFor="description">Description</label>

                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  placeholder="Describe your event and what attendees can expect..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="create-event-field">
                <label htmlFor="categoryId">Category</label>

                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={isLoadingCategories}
                >
                  <option value="">
                    {isLoadingCategories
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="create-event-field">
                <label htmlFor="status">Event status</label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="DRAFT">Save as Draft</option>
                  <option value="PUBLISHED">Publish Event</option>
                </select>
              </div>
            </div>
          </section>

          <section className="create-event-section">
            <div className="create-event-section-heading">
              <div className="create-event-section-icon">
                <MapPin size={20} />
              </div>

              <div>
                <h2>Location & Schedule</h2>
                <p>Tell attendees where and when your event takes place.</p>
              </div>
            </div>

            <div className="create-event-fields">
              <div className="create-event-field">
                <label htmlFor="venue">Venue</label>

                <input
                  id="venue"
                  name="venue"
                  type="text"
                  placeholder="e.g. Landmark Centre"
                  value={formData.venue}
                  onChange={handleChange}
                />
              </div>

              <div className="create-event-field">
                <label htmlFor="address">Address</label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="e.g. Victoria Island, Lagos"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="create-event-field">
                <label htmlFor="startDate">Start date & time</label>

                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="create-event-field">
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

          <section className="create-event-section">
            <div className="create-event-section-heading">
              <div className="create-event-section-icon">
                <ImagePlus size={20} />
              </div>

              <div>
                <h2>Event Image</h2>
                <p>
                  Add a public image URL to make your event easier to recognize.
                </p>
              </div>
            </div>

            <div className="create-event-field full-width">
              <label htmlFor="imageUrl">Image URL</label>

              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/event-image.jpg"
                value={formData.imageUrl}
                onChange={handleChange}
              />

              <small>
                Use a direct image URL that can be accessed publicly.
              </small>
            </div>

            {formData.imageUrl.trim() && (
              <div className="create-event-image-preview">
                <img
                  src={formData.imageUrl}
                  alt="Event preview"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </section>

          <section className="create-event-section">
            <div className="create-event-section-heading ticket-heading">
              <div className="create-event-section-icon">
                <Ticket size={20} />
              </div>

              <div>
                <h2>Ticket Types</h2>
                <p>Create the ticket options attendees can purchase.</p>
              </div>
            </div>

            <div className="ticket-type-list">
              {ticketTypes.map((ticket, index) => (
                <div className="ticket-type-form" key={index}>
                  <div className="ticket-type-form-header">
                    <div>
                      <span>TICKET TYPE {index + 1}</span>

                      <h3>{ticket.name || "New ticket type"}</h3>
                    </div>

                    {ticketTypes.length > 1 && (
                      <button
                        type="button"
                        className="remove-ticket-button"
                        onClick={() => removeTicketType(index)}
                      >
                        <Trash2 size={17} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="create-event-fields">
                    <div className="create-event-field">
                      <label>Ticket name</label>

                      <input
                        type="text"
                        placeholder="e.g. VIP"
                        value={ticket.name}
                        onChange={(event) =>
                          handleTicketChange(index, "name", event.target.value)
                        }
                      />
                    </div>

                    <div className="create-event-field">
                      <label>Price</label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="5000"
                        value={ticket.price}
                        onChange={(event) =>
                          handleTicketChange(index, "price", event.target.value)
                        }
                      />
                    </div>

                    <div className="create-event-field">
                      <label>Quantity</label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="100"
                        value={ticket.quantity}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "quantity",
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="create-event-field">
                      <label>Sale start</label>

                      <input
                        type="datetime-local"
                        value={ticket.saleStart}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "saleStart",
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="create-event-field">
                      <label>Sale end</label>

                      <input
                        type="datetime-local"
                        value={ticket.saleEnd}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "saleEnd",
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="create-event-field full-width">
                      <label>Description</label>

                      <textarea
                        rows={3}
                        maxLength={500}
                        placeholder="Describe what this ticket includes..."
                        value={ticket.description}
                        onChange={(event) =>
                          handleTicketChange(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="add-ticket-button"
              onClick={addTicketType}
            >
              <Plus size={18} />
              Add Ticket Type
            </button>
          </section>

          <section className="create-event-submit-section">
            <div>
              <h2>Ready to create your event?</h2>

              <p>
                {formData.status === "PUBLISHED"
                  ? "This event will be published for attendees to discover."
                  : "This event will be saved as a draft and won't be publicly visible yet."}
              </p>
            </div>

            <div className="create-event-actions">
              <button
                type="button"
                className="cancel-event-button"
                onClick={() => navigate("/organizer/events")}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="submit-event-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={19} className="create-event-spinner" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Save size={19} />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}

export default CreateEvent;
