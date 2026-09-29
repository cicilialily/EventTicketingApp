import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import EventCard from "../../components/events/EventCard";
import { eventCategories, mockEvents } from "../../data/mockEvents";

import "./Events.css";

function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );

  // Keep the page state synchronized when the URL changes.
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "All");
  }, [searchParams]);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return mockEvents.filter((event) => {
      const title = event.title?.toLowerCase() || "";
      const location = event.location?.toLowerCase() || "";
      const category =
        typeof event.category === "string"
          ? event.category.toLowerCase()
          : event.category?.name?.toLowerCase() || "";
      const description = event.description?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        location.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" ||
        event.category === selectedCategory ||
        event.category?.name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const updateUrlParams = (search, category) => {
    const nextParams = new URLSearchParams();

    if (search.trim()) {
      nextParams.set("search", search.trim());
    }

    if (category !== "All") {
      nextParams.set("category", category);
    }

    setSearchParams(nextParams);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);
    updateUrlParams(value, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateUrlParams(searchTerm, category);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSearchParams({});
  };

  return (
    <main className="events-page">
      {/* =========================
          HEADER
      ========================= */}

      <section className="events-header">
        <div className="container">
          <p className="events-eyebrow">EXPLORE EVENTS</p>

          <h1>Find your next experience.</h1>

          <p className="events-header-description">
            Discover concerts, conferences, sports events, comedy shows,
            parties, and other experiences happening around you.
          </p>

          <div className="events-search-wrapper">
            <span className="events-search-icon" aria-hidden="true">
              🔍
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
                  updateUrlParams("", selectedCategory);
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =========================
          EVENTS CONTENT
      ========================= */}

      <section className="events-content">
        <div className="container">
          <div className="events-toolbar">
            <div className="events-categories">
              {eventCategories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={
                    selectedCategory === category
                      ? "events-category events-category-active"
                      : "events-category"
                  }
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="events-toolbar-info">
              <p className="events-result-count">
                <strong>{filteredEvents.length}</strong>{" "}
                {filteredEvents.length === 1 ? "event" : "events"}
              </p>

              {(searchTerm || selectedCategory !== "All") && (
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

          {/* Active filters */}
          {(searchTerm || selectedCategory !== "All") && (
            <div className="events-active-filters">
              <span>Showing results for:</span>

              {searchTerm && (
                <span className="events-filter-tag">"{searchTerm}"</span>
              )}

              {selectedCategory !== "All" && (
                <span className="events-filter-tag">{selectedCategory}</span>
              )}
            </div>
          )}

          {/* Event results */}
          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="events-empty-state">
              <div className="events-empty-icon" aria-hidden="true">
                🔎
              </div>

              <p className="events-empty-eyebrow">NO RESULTS</p>

              <h2>No events found</h2>

              <p>
                We couldn't find any events matching your current search or
                category. Try changing your filters.
              </p>

              <button
                type="button"
                className="events-empty-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Browse all */}
          {filteredEvents.length > 0 && (
            <div className="events-bottom-cta">
              <p>Looking for something specific?</p>

              <Link to="/" className="events-home-link">
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
