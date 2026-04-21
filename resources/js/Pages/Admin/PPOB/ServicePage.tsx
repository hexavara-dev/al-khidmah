import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/datatable/DataTable'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import AdminLayout from '@/Layouts/AdminLayout'
import { Head, router } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'
import { Check, Loader2, Minus, RefreshCw, Save, Search } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

interface PPOBService {
    id: string
    code: string
    description: string
}

interface ProductItem {
    code: string
    label: string
    name: string
    price: number
    period: string
    type: string
    fee: number | null
}

interface SavedProduct {
    id: string
    label: string
    name: string
    price: number
    period: string
    status: number
    fee: number | null
}

interface Props {
    service: PPOBService
    supported: boolean
    products: SavedProduct[]
}

function formatRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount)
}

function formatPeriod(period: string) {
    const n = parseInt(period, 10)
    if (isNaN(n) || n === 0) return 'Seumur hidup'
    return `${n} hari`
}

const KNOWN_PROVIDERS = [
    { key: 'telkomsel', label: 'Telkomsel' },
    { key: 'indosat',   label: 'Indosat'   },
    { key: 'xl',        label: 'XL'        },
    { key: 'axis',      label: 'Axis'      },
    { key: 'tri',       label: 'Tri'       },
    { key: 'smartfren', label: 'Smartfren' },
] as const

function makeColumns(supported: boolean): ColumnDef<SavedProduct>[] {
    return [
        {
            id: 'no',
            header: 'No',
            cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
            enableSorting: false,
        },
        {
            accessorKey: 'name',
            header: 'Nama Produk',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-xs text-muted-foreground">{row.original.label}</div>
                </div>
            ),
        },
        {
            accessorKey: 'price',
            header: 'Harga',
            cell: ({ getValue }) => (
                <span className="font-medium">{formatRupiah(getValue() as number)}</span>
            ),
        },
        {
            accessorKey: 'period',
            header: 'Masa Aktif',
            cell: ({ getValue }) => formatPeriod(getValue() as string),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ getValue }) => {
                const v = getValue() as number
                return (
                    <Badge variant={v === 1 ? 'default' : 'secondary'}>
                        {v === 1 ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                )
            },
        },
    ]
}

export default function ServicePage({ service, supported, products }: Props) {
    const columns = useMemo(() => makeColumns(supported), [supported])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [items, setItems] = useState<ProductItem[]>([])
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [dialogSearch, setDialogSearch] = useState('')
    const [activeProvider, setActiveProvider] = useState<string | null>(null)

    const presentProviders = useMemo(() => {
        if (items.length === 0) return []
        const keys = new Set<string>()
        for (const item of items) {
            const l = item.label.toLowerCase()
            for (const p of KNOWN_PROVIDERS) {
                if (l.includes(p.key)) { keys.add(p.key); break }
            }
        }
        return KNOWN_PROVIDERS.filter(p => keys.has(p.key))
    }, [items])

    const showProviderTabs = presentProviders.length >= 2

    const providerItems = (showProviderTabs && activeProvider)
        ? items.filter(i => i.label.toLowerCase().includes(activeProvider))
        : items

    const filteredItems = dialogSearch.trim()
        ? providerItems.filter(i =>
            i.name.toLowerCase().includes(dialogSearch.toLowerCase()) ||
            i.code.toLowerCase().includes(dialogSearch.toLowerCase()) ||
            i.label.toLowerCase().includes(dialogSearch.toLowerCase())
        )
        : providerItems

    const selectTarget       = dialogSearch.trim() ? filteredItems : providerItems
    const allTargetSelected  = selectTarget.length > 0 && selectTarget.every(i => selected.has(i.code))
    const someTargetSelected = !allTargetSelected && selectTarget.some(i => selected.has(i.code))
    const isThreeCol         = items.length >= 10

    const handleSync = useCallback(async () => {
        setLoading(true)
        setItems([])
        setSelected(new Set())
        setDialogSearch('')
        setActiveProvider(null)
        try {
            const { data } = await axios.get(`/admin/ppob/${service.code}/sync`)
            const newItems: ProductItem[] = data.data ?? []
            setItems(newItems)
            // Auto-select first detected provider
            for (const p of KNOWN_PROVIDERS) {
                if (newItems.some(i => i.label.toLowerCase().includes(p.key))) {
                    setActiveProvider(p.key)
                    break
                }
            }
            setOpen(true)
        } catch (err: any) {
            toast.error(err?.response?.data?.error ?? 'Gagal mengambil data dari IAK.')
        } finally {
            setLoading(false)
        }
    }, [service.code])

    const toggleItem = (code: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            next.has(code) ? next.delete(code) : next.add(code)
            return next
        })
    }

    const toggleAll = () => {
        setSelected(prev => {
            const next = new Set(prev)
            if (allTargetSelected) {
                selectTarget.forEach(i => next.delete(i.code))
            } else {
                selectTarget.forEach(i => next.add(i.code))
            }
            return next
        })
    }

    const handleProviderChange = (key: string) => {
        setActiveProvider(key)
        setDialogSearch('')
    }

    const handleSave = async () => {
        const toSave = items.filter(i => selected.has(i.code))
        if (toSave.length === 0) return

        setSaving(true)
        try {
            const { data } = await axios.post(`/admin/ppob/${service.code}/save`, {
                items: toSave,
            })
            toast.success(data.message)
            setOpen(false)
            router.reload({ only: ['products'] })
        } catch (err: any) {
            const errors = err?.response?.data?.errors
            if (errors) {
                const first = Object.values(errors)[0] as string[]
                toast.error(first[0])
            } else {
                toast.error('Gagal menyimpan data.')
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <AdminLayout breadcrumbs={[{ label: 'PPOB' }, { label: service.description }]}>
            <Head title={`PPOB - ${service.description}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 pt-0">

                {/* Page header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">{service.description}</h1>
                        <p className="text-sm text-muted-foreground">
                            Daftar seluruh produk {service.description} yang tersinkronisasi
                        </p>
                    </div>

                    {supported ? (
                        <Button onClick={handleSync} disabled={loading} className="shrink-0">
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <RefreshCw />
                            )}
                            Sinkronisasi Produk
                        </Button>
                    ) : (
                        <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                            Postpaid &mdash; sync belum didukung
                        </Badge>
                    )}
                </div>

                {/* Data table */}
                <DataTable
                    columns={columns}
                    data={products}
                    pagination
                    search={{
                        mode: 'multiple',
                        keys: ['name', 'label'],
                        placeholder: 'Cari nama produk...',
                    }}
                />
            </div>

            {/* Sync result modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="max-w-6xl"
                    showCloseButton={!saving}
                >
                    <DialogHeader>
                        <DialogTitle>
                            Produk {service.description} &mdash; {items.length} item aktif
                        </DialogTitle>
                    </DialogHeader>

                    {/* Controls */}
                    <div className="flex flex-col gap-3 border-b px-6 pb-4">
                        {/* Search within dialog */}
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari nama, kode, atau operator..."
                                value={dialogSearch}
                                onChange={e => setDialogSearch(e.target.value)}
                                className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm outline-none ring-inset focus:ring-2 focus:ring-primary/30"
                            />
                        </div>

                        {/* Provider tabs */}
                        {showProviderTabs && (
                            <div className="flex flex-wrap gap-1.5">
                                {presentProviders.map(p => (
                                    <button
                                        key={p.key}
                                        type="button"
                                        onClick={() => handleProviderChange(p.key)}
                                        className={[
                                            'rounded-full px-3.5 py-1 text-xs font-medium transition-all',
                                            activeProvider === p.key
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/70',
                                        ].join(' ')}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Select all + counter */}
                        <div className="flex items-center justify-between cursor-pointer">
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="flex items-center gap-2.5 select-none"
                            >
                                <span
                                    className={[
                                        'flex size-[18px] shrink-0 items-center justify-center rounded border-2 transition-all',
                                        allTargetSelected
                                            ? 'border-primary bg-primary text-white'
                                            : someTargetSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border',
                                    ].join(' ')}
                                >
                                    {allTargetSelected && <Check className="size-3" strokeWidth={3} />}
                                    {someTargetSelected && <Minus className="size-3 text-primary" strokeWidth={3} />}
                                </span>
                                <span className="text-sm text-foreground">Pilih semua</span>
                            </button>

                            <div className="flex items-center gap-2">
                                {selected.size > 0 && (
                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                        {selected.size} dipilih
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    {filteredItems.length !== items.length
                                        ? `${filteredItems.length} dari ${items.length} produk`
                                        : `${items.length} produk aktif`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="overflow-y-auto px-6" style={{ maxHeight: '55vh' }}>
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                                <Search className="size-8 opacity-30" />
                                <p className="text-sm">Tidak ada produk yang cocok.</p>
                            </div>
                        ) : (
                        <div
                            className={
                                isThreeCol
                                    ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'
                                    : 'grid grid-cols-1 gap-3'
                            }
                        >
                            {filteredItems.map(item => {
                                const checked = selected.has(item.code)
                                return (
                                    <label
                                        key={item.code}
                                        className={[
                                            'relative flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-colors',
                                            checked
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border bg-background hover:bg-muted/50',
                                        ].join(' ')}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={checked}
                                            onChange={() => toggleItem(item.code)}
                                        />
                                        <span
                                            className={[
                                                'absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded border text-[10px] font-bold transition-colors',
                                                checked
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border bg-background',
                                            ].join(' ')}
                                            aria-hidden
                                        >
                                            {checked && '\u2713'}
                                        </span>

                                        <span className="pr-6 font-medium leading-snug">{item.name}</span>
                                        <span className="text-xs text-muted-foreground">{item.label}</span>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span className="font-semibold text-foreground">
                                                {formatRupiah(item.price)}
                                            </span>
                                            <span>&middot;</span>
                                            <span>{formatPeriod(item.period)}</span>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={saving}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={selected.size === 0 || saving}
                        >
                            {saving ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Save />
                            )}
                            Simpan {selected.size > 0 ? `${selected.size} produk` : 'produk'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}

