import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute, AdminRoute, GuestRoute } from './guards';

import HomePage              from '../pages/home/HomePage';
import CampaignDetailPage    from '../pages/campaign/CampaignDetailPage';
import MyDonationsPage       from '../pages/campaign/MyDonationsPage';
import LoginPage             from '../pages/auth/LoginPage';
import RegisterPage          from '../pages/auth/RegisterPage';
import DashboardOverviewPage from '../pages/dashboard/DashboardOverviewPage';
import DashboardCampaignsPage  from '../pages/dashboard/DashboardCampaignsPage';
import DashboardCategoriesPage from '../pages/dashboard/DashboardCategoriesPage';
import DashboardDonationsPage  from '../pages/dashboard/DashboardDonationsPage';
import DashboardUsersPage      from '../pages/dashboard/DashboardUsersPage';

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

                    {/* Admin */}
                    <Route path="/dashboard"             element={<AdminRoute><DashboardOverviewPage /></AdminRoute>} />
                    <Route path="/dashboard/campaigns"   element={<AdminRoute><DashboardCampaignsPage /></AdminRoute>} />
                    <Route path="/dashboard/categories"  element={<AdminRoute><DashboardCategoriesPage /></AdminRoute>} />
                    <Route path="/dashboard/donations"   element={<AdminRoute><DashboardDonationsPage /></AdminRoute>} />
                    <Route path="/dashboard/users"       element={<AdminRoute><DashboardUsersPage /></AdminRoute>} />

                    <Route path="*" element={<Navigate to="/donasi" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
