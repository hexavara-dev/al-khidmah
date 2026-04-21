import AdminLayout from '@/Layouts/AdminLayout';

/**
 * DashboardLayout — thin wrapper around AdminLayout.
 * Digunakan oleh halaman-halaman di Pages/dashboard/ agar
 * tampil dengan sidebar & header admin yang sama.
 */
export default function DashboardLayout({ children }) {
    return <AdminLayout>{children}</AdminLayout>;
}
