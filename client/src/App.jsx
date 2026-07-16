import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';

import SearchMalls from './pages/user/SearchMalls.jsx';
import MallDetails from './pages/user/MallDetails.jsx';
import BookingForm from './pages/user/BookingForm.jsx';
import UserDashboard from './pages/user/UserDashboard.jsx';
import BookingHistory from './pages/user/BookingHistory.jsx';

import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';
import ManageMall from './pages/owner/ManageMall.jsx';
import ManageFloors from './pages/owner/ManageFloors.jsx';
import OwnerAnalytics from './pages/owner/OwnerAnalytics.jsx';

import GuardDashboard from './pages/guard/GuardDashboard.jsx';
import ScanQR from './pages/guard/ScanQR.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ApproveMalls from './pages/admin/ApproveMalls.jsx';
import Analytics from './pages/admin/Analytics.jsx';

import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<SearchMalls />} />
      <Route path="/malls/:id" element={<MallDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* User */}
      <Route element={<ProtectedRoute roles={['user']} />}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/book/:mallId" element={<BookingForm />} />
        <Route path="/bookings" element={<BookingHistory />} />
      </Route>

      {/* Owner */}
      <Route element={<ProtectedRoute roles={['owner']} />}>
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/owner/malls/:mallId" element={<ManageMall />} />
        <Route path="/owner/malls/:mallId/floors" element={<ManageFloors />} />
        <Route path="/owner/analytics" element={<OwnerAnalytics />} />
      </Route>

      {/* Guard */}
      <Route element={<ProtectedRoute roles={['guard']} />}>
        <Route path="/guard" element={<GuardDashboard />} />
        <Route path="/guard/scan" element={<ScanQR />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/malls" element={<ApproveMalls />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
