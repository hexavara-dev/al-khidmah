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
    {
        title: 'PPOB',
        url: '/admin/ppob',
        icon: <Zap />,
        isActive: true,
        items: [
            { title: 'Pulsa & Data', url: '/admin/ppob/pulsa' },
            { title: 'Token PLN', url: '/admin/ppob/pln' },
            { title: 'Air & Internet', url: '/admin/ppob/air' },
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
    { name: 'Dashboard', url: '/admin/dashboard', icon: <LayoutDashboard /> },
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
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                        <img src="/images/assets/eKhidmah_logo.png" alt="eKhidmah" className="size-8 object-contain" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">eKhidmah</span>
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

