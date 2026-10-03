import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  MapPin,
  Save,
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

        setFormData({
          title: event.title || "",
          description: event.description || "",
          categoryId: event.categoryId || event.category?.id || "",
          venue: event.venue || "",
          address: event.address || "",
          startDate: formatDateTimeLocal(event.startDate),
          endDate: formatDateTimeLocal(event.endDate),
          status: event.status || "DRAFT",
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
      await updateManagedEvent(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        venue: formData.venue.trim(),
        address: formData.address.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: formData.status,
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

          <p>Update the details and status of your event.</p>
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

          <section className="edit-event-note">
            <strong>Note</strong>

            <p>
              Ticket types and event images are not changed from this form. Your
              current backend manages those records separately.
            </p>
          </section>

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
