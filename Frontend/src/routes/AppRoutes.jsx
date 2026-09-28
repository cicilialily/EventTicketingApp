import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/public/Home";
import Events from "../pages/public/Events";
import EventDetails from "../pages/public/EventDetails";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Tickets from "../pages/attendee/Tickets";
import Profile from "../pages/attendee/Profile";

import ProtectedRoute from "./ProtectedRoute";

import ForgotPassword from "../pages/auth/ForgotPassword";

import ResetPassword from "../pages/auth/ResetPassword";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected attendee routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
