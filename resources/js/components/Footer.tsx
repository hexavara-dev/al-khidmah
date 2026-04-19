export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="font-semibold text-white mb-1">🕌 Donasi Al-Khidmah</p>
                <p className="text-sm">Bersama membangun kebaikan untuk sesama.</p>
                <p className="text-xs mt-4 text-gray-500">&copy; {new Date().getFullYear()} Al-Khidmah. All rights reserved.</p>
            </div>
        </footer>
    );
}
