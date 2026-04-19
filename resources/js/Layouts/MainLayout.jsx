import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNavbar from '../components/BottomNavbar';

export default function MainLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Top navbar — shown on desktop, hidden on mobile */}
            <div className="hidden md:block">
                <Navbar />
            </div>

            <main className="flex-1 pb-16 md:pb-0">
                {children}
            </main>

            {/* Footer — desktop only */}
            <div className="hidden md:block">
                <Footer />
            </div>

            {/* Bottom navbar — mobile only */}
            <BottomNavbar />
        </div>
    );
}
