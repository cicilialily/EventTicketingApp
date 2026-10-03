import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  DollarSign,
  LoaderCircle,
  Ticket,
  Users,
} from "lucide-react";

import { getOrganizerAnalytics } from "../../services/analytics.service";

import "./Dashboard.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getOrganizerAnalytics();

        setAnalytics(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);

        setErrorMessage(
          error.message || "Unable to load your dashboard. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <main className="organizer-dashboard-page">
        <div className="dashboard-state">
          <LoaderCircle size={38} className="dashboard-spinner" />

          <h2>Loading dashboard...</h2>

          <p>Please wait while we retrieve your event statistics.</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="organizer-dashboard-page">
        <div className="dashboard-state">
          <div className="dashboard-state-icon">
            <CircleAlert size={34} />
          </div>

          <h2>Unable to load dashboard</h2>

          <p>{errorMessage}</p>
        </div>
      </main>
    );
  }

  const data = analytics || {};

  return (
    <main className="organizer-dashboard-page">
      <div className="organizer-dashboard-container">
        <section className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">ORGANIZER DASHBOARD</span>

            <h1>Overview</h1>

            <p>
              Keep track of your events, ticket sales, revenue, and attendee
              check-ins.
            </p>
          </div>
        </section>

        <section className="dashboard-metrics">
          <div className="dashboard-metric-card">
            <div className="dashboard-metric-icon">
              <CalendarDays size={21} />
            </div>

            <div>
              <span>Total Events</span>
              <strong>{data.totalEvents ?? 0}</strong>
            </div>
          </div>

          <div className="dashboard-metric-card">
            <div className="dashboard-metric-icon">
              <Ticket size={21} />
            </div>

            <div>
              <span>Tickets Sold</span>
              <strong>{data.ticketsSold ?? 0}</strong>
            </div>
          </div>

          <div className="dashboard-metric-card">
            <div className="dashboard-metric-icon">
              <DollarSign size={21} />
            </div>

            <div>
              <span>Revenue</span>
              <strong>{formatCurrency(data.revenue)}</strong>
            </div>
          </div>

          <div className="dashboard-metric-card">
            <div className="dashboard-metric-icon">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Checked In</span>
              <strong>{data.checkedInTickets ?? 0}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-content-grid">
          <div className="dashboard-overview-card">
            <div className="dashboard-card-heading">
              <div>
                <h2>Event Overview</h2>
                <p>Current status of your events.</p>
              </div>

              <CalendarDays size={20} />
            </div>

            <div className="dashboard-overview-list">
              <div>
                <span>Published Events</span>
                <strong>{data.publishedEvents ?? 0}</strong>
              </div>

              <div>
                <span>Draft Events</span>
                <strong>{data.draftEvents ?? 0}</strong>
              </div>

              <div>
                <span>Cancelled Events</span>
                <strong>{data.cancelledEvents ?? 0}</strong>
              </div>

              <div>
                <span>Upcoming Events</span>
                <strong>{data.upcomingEvents ?? 0}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-overview-card">
            <div className="dashboard-card-heading">
              <div>
                <h2>Sales Overview</h2>
                <p>Ticket activity from completed payments.</p>
              </div>

              <Ticket size={20} />
            </div>

            <div className="dashboard-sales-summary">
              <div>
                <span>Paid Orders</span>
                <strong>{data.paidOrders ?? 0}</strong>
              </div>

              <div>
                <span>Tickets Sold</span>
                <strong>{data.ticketsSold ?? 0}</strong>
              </div>

              <div>
                <span>Checked In</span>
                <strong>{data.checkedInTickets ?? 0}</strong>
              </div>

              <div>
                <span>Total Revenue</span>
                <strong>{formatCurrency(data.revenue)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-quick-actions">
          <div>
            <div className="dashboard-quick-icon">
              <Clock3 size={20} />
            </div>

            <div>
              <h2>Upcoming Events</h2>

              <p>
                You currently have <strong>{data.upcomingEvents ?? 0}</strong>{" "}
                upcoming event
                {(data.upcomingEvents ?? 0) === 1 ? "" : "s"}.
              </p>
            </div>
          </div>

          <div>
            <div className="dashboard-quick-icon">
              <Users size={20} />
            </div>

            <div>
              <h2>Attendee Check-In</h2>

              <p>
                <strong>{data.checkedInTickets ?? 0}</strong> ticket
                {(data.checkedInTickets ?? 0) === 1 ? "" : "s"} checked in so
                far.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
