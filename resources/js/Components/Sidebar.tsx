import { Link, usePage } from "@inertiajs/react";

export default function Sidebar() {
    const { url } = usePage();

    const menu = [
        { name: "Pricelist", href: "/ppob/pricelist", icon: "" },
        { name: "Transaksi", href: "/ppob/transactions", icon: "" },
        { name: "History", href: "/ppob/history", icon: "" },
    ];

    const isActive = (href: string) =>
        url.startsWith(href)
            ? "bg-blue-100 text-blue-600"
            : "text-gray-700 hover:bg-gray-100";

    return (
        <aside className="w-64 bg-white border-r flex flex-col">
            {/* LOGO */}
            <div className="p-4 font-bold text-lg border-b">Menu</div>

            {/* MENU */}
            <nav className="flex-1 p-4 space-y-2">
                {menu.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${isActive(item.href)}`}
                    >
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
