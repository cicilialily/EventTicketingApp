import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import EventCard from "../../components/events/EventCard";
import {
  getEventCategories,
  getEvents,
} from "../../services/eventService";

import "./Events.css";

function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [eventData, categoryData] = await Promise.all([
          getEvents(),
          getEventCategories(),
        ]);

        setEvents(Array.isArray(eventData) ? eventData : []);

        setCategories(
          Array.isArray(categoryData) ? categoryData : [],
        );
      } catch (error) {
        console.error("Failed to load events:", error);

        setErrorMessage(
          error.message ||
            "Unable to load events. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Keep the page synchronized with the URL.
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategory(
      searchParams.get("category") || "All",
    );
  }, [searchParams]);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return events.filter((event) => {
      const title =
        event.title?.toLowerCase() || "";

      const location =
        event.location?.toLowerCase() || "";

      const category =
        typeof event.category === "string"
          ? event.category.toLowerCase()
          : event.category?.name?.toLowerCase() || "";

      const description =
        event.description?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        location.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      const eventCategory =
        typeof event.category === "string"
          ? event.category
          : event.category?.name || "";

      const matchesCategory =
        selectedCategory === "All" ||
        eventCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, selectedCategory]);

  function updateUrlParams(search, category) {
    const nextParams = new URLSearchParams();

    if (search.trim()) {
      nextParams.set("search", search.trim());
    }

    if (category !== "All") {
      nextParams.set("category", category);
    }

    setSearchParams(nextParams);
  }

  function handleSearchChange(event) {
    const value = event.target.value;

    setSearchTerm(value);

    updateUrlParams(value, selectedCategory);
  }

  function handleCategoryChange(category) {
    setSelectedCategory(category);

    updateUrlParams(searchTerm, category);
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
    setSearchParams({});
  }

  if (isLoading) {
    return (
      <main className="events-page">
        <section className="events-header">
          <div className="container">
            <p className="events-eyebrow">
              EXPLORE EVENTS
            </p>

            <h1>Find your next experience.</h1>

            <p className="events-header-description">
              Discover concerts, conferences, sports
              events, comedy shows, parties, and other
              experiences happening around you.
            </p>
          </div>
        </section>

        <section className="events-content">
          <div className="container">
            <div className="events-empty-state">
              <p className="events-empty-eyebrow">
                LOADING
              </p>

              <h2>Loading events...</h2>

              <p>
                Please wait while we retrieve the latest
                published events.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="events-page">
        <section className="events-header">
          <div className="container">
            <p className="events-eyebrow">
              EXPLORE EVENTS
            </p>

            <h1>Find your next experience.</h1>

            <p className="events-header-description">
              Discover concerts, conferences, sports
              events, comedy shows, parties, and other
              experiences happening around you.
            </p>
          </div>
        </section>

        <section className="events-content">
          <div className="container">
            <div className="events-empty-state">
              <p className="events-empty-eyebrow">
                UNAVAILABLE
              </p>

              <h2>Unable to load events</h2>

              <p>{errorMessage}</p>

              <button
                type="button"
                className="events-empty-button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const categoryNames = categories
    .map((category) => category?.name)
    .filter(Boolean);

  return (
    <main className="events-page">
      {/* HEADER */}

      <section className="events-header">
        <div className="container">
          <p className="events-eyebrow">
            EXPLORE EVENTS
          </p>

          <h1>Find your next experience.</h1>

          <p className="events-header-description">
            Discover concerts, conferences, sports
            events, comedy shows, parties, and other
            experiences happening around you.
          </p>

          <div className="events-search-wrapper">
            <span
              className="events-search-icon"
              aria-hidden="true"
            >
              Search
            </span>

            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search events, locations or categories..."
              aria-label="Search events"
            />

            {searchTerm && (
              <button
                type="button"
                className="events-search-clear"
                onClick={() => {
                  setSearchTerm("");

                  updateUrlParams(
                    "",
                    selectedCategory,
                  );
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* EVENTS CONTENT */}

      <section className="events-content">
        <div className="container">
          <div className="events-toolbar">
            <div className="events-categories">
              <button
                type="button"
                className={
                  selectedCategory === "All"
                    ? "events-category events-category-active"
                    : "events-category"
                }
                onClick={() =>
                  handleCategoryChange("All")
                }
              >
                All
              </button>

              {categoryNames.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={
                    selectedCategory === category
                      ? "events-category events-category-active"
                      : "events-category"
                  }
                  onClick={() =>
                    handleCategoryChange(category)
                  }
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="events-toolbar-info">
              <p className="events-result-count">
                <strong>
                  {filteredEvents.length}
                </strong>{" "}
                {filteredEvents.length === 1
                  ? "event"
                  : "events"}
              </p>

              {(searchTerm ||
                selectedCategory !== "All") && (
                <button
                  type="button"
                  className="events-clear-filters"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {(searchTerm ||
            selectedCategory !== "All") && (
            <div className="events-active-filters">
              <span>Showing results for:</span>

              {searchTerm && (
                <span className="events-filter-tag">
                  "{searchTerm}"
                </span>
              )}

              {selectedCategory !== "All" && (
                <span className="events-filter-tag">
                  {selectedCategory}
                </span>
              )}
            </div>
          )}

          {/* EVENT RESULTS */}

          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}
            </div>
          ) : (
            <div className="events-empty-state">
              <p className="events-empty-eyebrow">
                NO RESULTS
              </p>

              <h2>No events found</h2>

              <p>
                We couldn't find any published events
                matching your current search or category.
              </p>

              {(searchTerm ||
                selectedCategory !== "All") && (
                <button
                  type="button"
                  className="events-empty-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* BOTTOM CTA */}

          {filteredEvents.length > 0 && (
            <div className="events-bottom-cta">
              <p>
                Looking for something specific?
              </p>

              <Link
                to="/"
                className="events-home-link"
              >
                Back to home →
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Events;