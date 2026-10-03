import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/public/Home";
import Events from "../pages/public/Events";
import EventDetails from "../pages/public/EventDetails";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Tickets from "../pages/attendee/Tickets";
import Profile from "../pages/attendee/Profile";

import CheckIn from "../pages/organizer/CheckIn";
import OrganizerEvents from "../pages/organizer/Events";
import CreateEvent from "../pages/organizer/CreateEvent";
import EditEvent from "../pages/organizer/EditEvent";
import Dashboard from "../pages/organizer/Dashboard";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/" element={<Home />} />

        <Route path="/events" element={<Events />} />

        <Route path="/events/:id" element={<EventDetails />} />

        {/* =========================
            AUTHENTICATION ROUTES
        ========================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        {/* =========================
            PROTECTED ATTENDEE ROUTES
        ========================= */}

        <Route element={<ProtectedRoute />}>
          <Route path="/tickets" element={<Tickets />} />

          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* =========================
            PROTECTED ORGANIZER / ADMIN ROUTES
        ========================= */}

        <Route
          element={<ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]} />}
        >
          <Route path="/organizer/dashboard" element={<Dashboard />} />

          <Route path="/organizer/events" element={<OrganizerEvents />} />

          <Route path="/organizer/events/new" element={<CreateEvent />} />

          <Route path="/organizer/events/:id/edit" element={<EditEvent />} />

          <Route path="/organizer/check-in" element={<CheckIn />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
