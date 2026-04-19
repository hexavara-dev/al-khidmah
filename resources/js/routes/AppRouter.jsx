import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute, GuestRoute } from './guards';

import HomePage              from '../pages/home/HomePage';
import CampaignDetailPage    from '../pages/campaign/CampaignDetailPage';
import MyDonationsPage       from '../pages/campaign/MyDonationsPage';
import LoginPage             from '../pages/auth/LoginPage';
import RegisterPage          from '../pages/auth/RegisterPage';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public */}
                    <Route path="/donasi"               element={<HomePage />} />
                    <Route path="/campaigns/:id"  element={<CampaignDetailPage />} />

                    {/* Guest only */}
                    <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

                    {/* Authenticated user */}
                    <Route path="/my-donations" element={<ProtectedRoute><MyDonationsPage /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to="/donasi" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
