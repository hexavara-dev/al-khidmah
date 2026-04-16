import { ReactNode } from "react";
import Sidebar from "@/Components/Sidebar";

type Props = {
    children: ReactNode;
};

export default function AppLayout({ children }: Props) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* SIDEBAR */}
            <Sidebar />

            {/* CONTENT */}
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
    );
}
