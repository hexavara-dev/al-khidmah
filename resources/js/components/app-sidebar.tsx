import * as React from 'react'
import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'
import { usePage } from '@inertiajs/react'
import {
    BarChart3,
    CreditCard,
    Heart,
    Image,
    LayoutDashboard,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Users,
    Zap,
} from 'lucide-react'

const navMain = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: <LayoutDashboard /> },
    {
        title: 'PPOB',
        url: '/admin/ppob/pulsa',
        icon: <Zap />,
        isActive: true,
        items: [
            { title: 'Pulsa', url: '/admin/ppob/pulsa' },
            { title: 'Paket Data', url: '/admin/ppob/data' },
            { title: 'Token Listrik', url: '/admin/ppob/pln' },
            { title: 'Top Up E-Money', url: '/admin/ppob/emoney' },
            { title: 'TV Kabel', url: '/admin/ppob/tv' },
        ],
    },
    {
        title: 'Donasi',
        url: '/admin/donations',
        icon: <Heart />,
        items: [
            { title: 'Overview Donasi',   url: '/admin/donations/overview' },
            { title: 'Manajemen Donasi',  url: '/admin/donations' },
            { title: 'Kelola Campaign',   url: '/admin/donations/campaigns' },
            { title: 'Kelola Kategori',   url: '/admin/donations/categories' },
        ],
    },
    {
        title: 'Toko',
        url: '/admin/store',
        icon: <ShoppingBag />,
        items: [
            { title: 'Produk', url: '/admin/store/products' },
            { title: 'Pesanan', url: '/admin/store/orders' },
        ],
    },
]

const navAdmin = [
    { name: 'Transaksi', url: '/admin/transactions', icon: <ShoppingCart /> },
    { name: 'Pengguna', url: '/admin/users', icon: <Users /> },
    { name: 'Laporan', url: '/admin/reports', icon: <BarChart3 /> },
    { name: 'Pembayaran', url: '/admin/payments', icon: <CreditCard /> },
    { name: 'Pengaturan', url: '/admin/settings', icon: <Settings /> },
]

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage().props as any
    const user = auth?.user

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2.5 px-2 py-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
                            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.91-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                        </svg>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">Al-Khidmah</span>
                        <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
                <NavProjects projects={navAdmin} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser
                    user={{
                        name: user?.name ?? 'Admin',
                        email: user?.email ?? '',
                        initials: user ? getInitials(user.name) : 'A',
                    }}
                />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

