import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import EventCard from "../../components/events/EventCard";
import { eventCategories, mockEvents } from "../../data/mockEvents";

import "./Events.css";

function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return mockEvents.filter((event) => {
      const matchesSearch =
        !normalizedSearch ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.location.toLowerCase().includes(normalizedSearch) ||
        event.category.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" || event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);

    const nextParams = new URLSearchParams(searchParams);

    if (value.trim()) {
      nextParams.set("search", value.trim());
    } else {
      nextParams.delete("search");
    }

    if (selectedCategory !== "All") {
      nextParams.set("category", selectedCategory);
    }

    setSearchParams(nextParams);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    const nextParams = new URLSearchParams(searchParams);

    if (category === "All") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }

    if (searchTerm.trim()) {
      nextParams.set("search", searchTerm.trim());
    }

    setSearchParams(nextParams);
  };

  return (
    <main className="events-page">
      <section className="events-header">
        <div className="container">
          <p className="events-eyebrow">EXPLORE EVENTS</p>

          <h1>Find your next experience.</h1>

          <p className="events-header-description">
            Browse upcoming concerts, conferences, sports events, comedy shows,
            parties, and more.
          </p>

          <div className="events-search-wrapper">
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search events, locations or categories..."
              aria-label="Search events"
            />
          </div>
        </div>
      </section>

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

            <p className="events-result-count">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"}
            </p>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="events-empty-state">
              <h2>No events found</h2>

              <p>Try a different search term or select another category.</p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSearchParams({});
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Events;
