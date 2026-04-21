import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    DollarSign,
    Heart,
    ShoppingBag,
    ShoppingCart,
    TrendingUp,
    Users,
    Wallet,
    Zap,
} from 'lucide-react';

interface Stats {
    totalTransactions: number;
    totalRevenue: number;
    totalUsers: number;
    successRate: number;
    recentTransactions: Transaction[];
}

interface Transaction {
    id: number;
    order_id: string;
    customer_name: string;
    product_name: string;
    amount: number;
    status: 'success' | 'pending' | 'failed';
    created_at: string;
}

interface Props {
    stats?: Stats;
    iakBalance?: number;
    midtransBalance?: number;
    midtransSandbox?: boolean;
}

const statusConfig = {
    success: { label: 'Berhasil', variant: 'default' as const, className: 'bg-green-100 text-green-700 hover:bg-green-100' },
    pending: { label: 'Pending', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
    failed: { label: 'Gagal', variant: 'destructive' as const, className: '' },
};

function formatRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function BalanceCard({
    title,
    subtitle,
    balance,
    isSandbox,
    gradient,
    icon: Icon,
}: {
    title: string;
    subtitle: string;
    balance: number;
    isSandbox?: boolean;
    gradient: string;
    icon: React.ElementType;
}) {
    return (
        <div className={`relative overflow-hidden rounded-xl p-6 text-white ${gradient}`}>
            {/* decorative blob */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/10" />

            <div className="relative flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-white/80">{title}</p>
                    <p className="text-2xl font-bold tracking-tight">{formatRupiah(balance)}</p>
                    <p className="text-xs text-white/60">{subtitle}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-white" />
                </div>
            </div>

            {isSandbox && (
                <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Sandbox
                </span>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    trend?: { value: string; up: boolean };
}) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold tracking-tight">{value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center gap-1.5">
                        {trend.up ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                            <ArrowDownRight className="h-4 w-4 text-destructive" />
                        )}
                        <span className={`text-xs font-medium ${trend.up ? 'text-green-600' : 'text-destructive'}`}>
                            {trend.value}
                        </span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                    </div>
                )}
                {!trend && <p className="mt-4 text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
}

// Demo data when no real stats passed
const demoTransactions: Transaction[] = [
    { id: 1, order_id: 'TRX-001', customer_name: 'Ahmad Fauzi', product_name: 'Pulsa Telkomsel 50K', amount: 51500, status: 'success', created_at: '2026-04-19 10:30' },
    { id: 2, order_id: 'TRX-002', customer_name: 'Siti Rahmah', product_name: 'Donasi Zakat Fitrah', amount: 75000, status: 'success', created_at: '2026-04-19 09:45' },
    { id: 3, order_id: 'TRX-003', customer_name: 'Budi Santoso', product_name: 'Token PLN 100K', amount: 101500, status: 'pending', created_at: '2026-04-19 09:10' },
    { id: 4, order_id: 'TRX-004', customer_name: 'Dewi Lestari', product_name: 'Sajadah Premium', amount: 185000, status: 'success', created_at: '2026-04-19 08:55' },
    { id: 5, order_id: 'TRX-005', customer_name: 'Rizky Pratama', product_name: 'Paket Data XL 10GB', amount: 65000, status: 'failed', created_at: '2026-04-19 08:20' },
];

export default function AdminDashboard({ stats, iakBalance = 0, midtransBalance = 0, midtransSandbox = true }: Props) {
    const totalRevenue = stats?.totalRevenue ?? 12_850_000;
    const totalTransactions = stats?.totalTransactions ?? 248;
    const totalUsers = stats?.totalUsers ?? 1_432;
    const successRate = stats?.successRate ?? 94.2;
    const recentTransactions = stats?.recentTransactions ?? demoTransactions;

    return (
        <AdminLayout breadcrumbs={[{ label: 'Dashboard' }]}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Balance Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <BalanceCard
                        title="Saldo IAK"
                        subtitle="Saldo prabayar untuk layanan PPOB"
                        balance={iakBalance}
                        gradient="bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600"
                        icon={Wallet}
                    />
                    <BalanceCard
                        title="Saldo Midtrans"
                        subtitle={midtransSandbox ? 'Mode sandbox aktif' : 'Saldo payment gateway'}
                        balance={midtransSandbox ? 0 : midtransBalance}
                        isSandbox={midtransSandbox}
                        gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"
                        icon={CreditCard}
                    />
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Pendapatan"
                        value={formatRupiah(totalRevenue)}
                        icon={DollarSign}
                        trend={{ value: '12.5%', up: true }}
                        description="dari bulan lalu"
                    />
                    <StatCard
                        title="Total Transaksi"
                        value={totalTransactions.toLocaleString('id-ID')}
                        icon={ShoppingCart}
                        trend={{ value: '8.2%', up: true }}
                        description="dari bulan lalu"
                    />
                    <StatCard
                        title="Pengguna Aktif"
                        value={totalUsers.toLocaleString('id-ID')}
                        icon={Users}
                        trend={{ value: '3.1%', up: true }}
                        description="dari bulan lalu"
                    />
                    <StatCard
                        title="Tingkat Keberhasilan"
                        value={`${successRate}%`}
                        icon={TrendingUp}
                        description="Rata-rata seluruh layanan"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Recent Transactions */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
                                    <CardDescription>5 transaksi terakhir di platform</CardDescription>
                                </div>
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {recentTransactions.map((trx) => {
                                    const status = statusConfig[trx.status];
                                    return (
                                        <div key={trx.id} className="flex items-center gap-4 px-6 py-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <Zap className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{trx.product_name}</p>
                                                <p className="text-xs text-muted-foreground">{trx.customer_name} · {trx.order_id}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-medium">{formatRupiah(trx.amount)}</p>
                                                <Badge className={`text-xs mt-0.5 ${status.className}`} variant={status.variant}>
                                                    {status.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Ringkasan Hari Ini</CardTitle>
                            <CardDescription>Per layanan — {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* PPOB */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PPOB</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Pulsa & Data</span>
                                    <span className="text-sm font-medium">124 trx</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Token PLN</span>
                                    <span className="text-sm font-medium">58 trx</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Air & Internet</span>
                                    <span className="text-sm font-medium">31 trx</span>
                                </div>
                            </div>
                            <Separator />
                            {/* Donasi */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Donasi</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Zakat & Infaq</span>
                                    <span className="text-sm font-medium">19 trx</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Wakaf</span>
                                    <span className="text-sm font-medium">7 trx</span>
                                </div>
                            </div>
                            <Separator />
                            {/* Toko */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Toko</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Produk Islami</span>
                                    <span className="text-sm font-medium">9 trx</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">Total Hari Ini</span>
                                <span className="text-sm font-semibold">{formatRupiah(3_240_000)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
