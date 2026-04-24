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
import { Check, Loader2, Minus, Pencil, PowerOff, RefreshCw, Save, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
    komisi?: number
}

interface SavedProduct {
    id: string
    code: string
    label: string
    name: string
    price: number
    base_price: number
    period: string
    status: number
    fee: number | null
    komisi?: number | null
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

function makeColumns(
    supported: boolean,
    isPostpaid: boolean,
    onEdit: (product: SavedProduct) => void,
    onToggle: (product: SavedProduct) => void,
): ColumnDef<SavedProduct>[] {
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
                    <div className="w-72 truncate font-medium" title={row.original.name}>{row.original.name}</div>
                    <div className="text-xs text-muted-foreground">{row.original.label}</div>
                </div>
            ),
        },
        {
            accessorKey: 'price',
            header: isPostpaid ? 'Biaya Layanan' : 'Harga',
            cell: ({ row, getValue }) => {
                if (isPostpaid) {
                    const fee = row.original.fee ?? 0
                    const komisi = (row.original.komisi ?? 0) as number
                    return (
                        <div className="space-y-0.5">
                            <div className="text-xs">
                                <span className="text-muted-foreground">Biaya provider:&nbsp;</span>
                                <span className="font-medium">{formatRupiah(fee)}</span>
                            </div>
                            <div className="text-xs">
                                <span className="text-muted-foreground">Komisi balik:&nbsp;</span>
                                <span className="font-medium text-emerald-600">{komisi ? `+ ${formatRupiah(komisi)}` : '—'}</span>
                            </div>
                        </div>
                    )
                }
                const v = getValue() as number
                return (
                    <span className="font-medium">
                        {v > 0 ? formatRupiah(v) : <span className="text-muted-foreground italic">Sesuai tagihan</span>}
                    </span>
                )
            },
        },
        ...(isPostpaid ? [{
            accessorKey: 'price' as const,
            id: 'margin_col',
            header: 'Biaya Admin Anda',
            cell: ({ row }: { row: any }) => {
                const rawPrice = row.original.price as number
                const fee = (row.original.fee ?? 0) as number
                const komisi = (row.original.komisi ?? 0) as number
                const effectivePrice = rawPrice > 0 ? rawPrice : komisi
                const margin = effectivePrice - fee + komisi
                const isDefault = rawPrice === 0 || rawPrice == null
                return (
                    <div>
                        <span className="font-medium">
                            {formatRupiah(effectivePrice)}
                            {isDefault && <span className="ml-1 text-xs text-muted-foreground">(default)</span>}
                        </span>
                        <div className={`text-xs font-medium ${margin >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                            {margin >= 0 ? `untung ${formatRupiah(margin)}` : `rugi ${formatRupiah(Math.abs(margin))}`}
                        </div>
                    </div>
                )
            },
        }] : []),
        ...(!isPostpaid ? [{
            accessorKey: 'period' as const,
            header: 'Masa Aktif',
            cell: ({ getValue }: { getValue: () => unknown }) => formatPeriod(getValue() as string),
        }] : []),
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const v = row.original.status
                return (
                    <Badge variant={v === 1 ? 'default' : 'secondary'}>
                        {v === 1 ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                )
            },
        },
        {
            id: 'aksi',
            header: 'Aksi',
            enableSorting: false,
            cell: ({ row }) => {
                const product = row.original
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1.5 px-2.5 text-xs"
                            onClick={() => onEdit(product)}
                        >
                            <Pencil className="size-3" />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant={product.status === 1 ? 'destructive' : 'secondary'}
                            className="h-7 gap-1.5 px-2.5 text-xs"
                            onClick={() => onToggle(product)}
                        >
                            <PowerOff className="size-3" />
                            {product.status === 1 ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                    </div>
                )
            },
        },
    ]
}

export default function ServicePage({ service, supported, products }: Props) {
    // ── Local products state (for optimistic updates) ───────────────
    const [localProducts, setLocalProducts] = useState<SavedProduct[]>(products)
    useEffect(() => { setLocalProducts(products) }, [products])

    const isPostpaid = supported && !['pulsa', 'data', 'pln', 'emoney'].includes(service.code)

    // ── Edit dialog state ───────────────────────────────────────────
    const [editOpen, setEditOpen]       = useState(false)
    const [editProduct, setEditProduct] = useState<SavedProduct | null>(null)
    const [editForm, setEditForm]       = useState({ label: '', name: '', price: 0 })
    const [editSaving, setEditSaving]   = useState(false)

    const handleEdit = useCallback((product: SavedProduct) => {
        setEditProduct(product)
        setEditForm({
            label: product.label,
            name: product.name,
            price: product.price > 0 ? product.price : (product.komisi ?? 0),
        })
        setEditOpen(true)
    }, [])

    const handleEditSave = async () => {
        if (!editProduct) return
        setEditSaving(true)
        try {
            await axios.patch(`/admin/ppob/products/${editProduct.id}`, editForm)
            // Optimistic update — langsung update datatable tanpa tunggu reload
            setLocalProducts(prev =>
                prev.map(p => p.id === editProduct!.id
                    ? { ...p, label: editForm.label, name: editForm.name, price: editForm.price }
                    : p
                )
            )
            toast.success('Produk berhasil diperbarui.')
            setEditOpen(false)
            router.reload({ only: ['products'] })
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Gagal memperbarui produk.')
        } finally {
            setEditSaving(false)
        }
    }

    const handleToggle = useCallback(async (product: SavedProduct) => {
        const newStatus = product.status === 1 ? 0 : 1
        const label     = newStatus === 0 ? 'nonaktifkan' : 'aktifkan'

        // Optimistic update — langsung update data
        setLocalProducts(prev =>
            prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p)
        )

        try {
            await axios.patch(`/admin/ppob/products/${product.id}/toggle`)
            toast.success(`Produk berhasil di${label}.`)
            router.reload({ only: ['products'] })
        } catch (err: any) {
            // Revert jika gagal
            setLocalProducts(prev =>
                prev.map(p => p.id === product.id ? { ...p, status: product.status } : p)
            )
            toast.error(err?.response?.data?.message ?? 'Gagal mengubah status produk.')
        }
    }, [])

    const columns = useMemo(
        () => makeColumns(supported, isPostpaid, handleEdit, handleToggle),
        [supported, isPostpaid, handleEdit, handleToggle],
    )

    // ── Sync dialog state ───────────────────────────────────────────
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
            // Pre-select produk yang sudah aktif di DB
            const activeCodes = new Set(
                products.filter(p => p.status === 1).map(p => p.code)
            )
            // Jika belum ada produk tersimpan sama sekali, pilih semua otomatis
            if (products.length === 0) {
                newItems.forEach(i => activeCodes.add(i.code))
            }
            setSelected(activeCodes)
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
    }, [service.code, products])

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
                    data={localProducts}
                    pagination
                    search={{
                        mode: 'multiple',
                        keys: ['name', 'label'],
                        placeholder: 'Cari nama produk...',
                    }}
                />
            </div>

            {/* Edit product modal */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-md" showCloseButton={!editSaving}>
                    <DialogHeader>
                        <DialogTitle>Edit Produk</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 px-6 py-2">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">Label / Operator</label>
                            <input
                                type="text"
                                value={editForm.label}
                                onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-inset focus:ring-2 focus:ring-primary/30"
                                placeholder="Contoh: Telkomsel"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">Nama Produk</label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-inset focus:ring-2 focus:ring-primary/30"
                                placeholder="Contoh: Pulsa 50.000"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">{isPostpaid ? 'Biaya Admin (ditagihkan ke user)' : 'Harga Jual'}</label>
                            <div
                                className={[
                                    'flex overflow-hidden rounded-lg border bg-background text-sm transition-colors',
                                    'focus-within:ring-2 focus-within:ring-inset',
                                    editProduct && editForm.price < editProduct.base_price
                                        ? 'border-destructive focus-within:ring-destructive/30'
                                        : 'focus-within:ring-primary/30',
                                ].join(' ')}
                            >
                                <span className="flex select-none items-center border-r bg-muted px-3 text-muted-foreground">
                                    Rp
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={editForm.price === 0 ? '' : editForm.price.toLocaleString('id-ID')}
                                    onChange={e => {
                                        const raw = e.target.value.replace(/\D/g, '')
                                        setEditForm(f => ({ ...f, price: raw === '' ? 0 : parseInt(raw, 10) }))
                                    }}
                                    className="flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-muted-foreground"
                                    placeholder="0"
                                />
                            </div>
                            {editProduct && editForm.price < editProduct.base_price ? (
                                <p className="text-xs text-destructive">
                                    Harga tidak boleh di bawah harga dasar {formatRupiah(editProduct.base_price)}
                                </p>
                            ) : isPostpaid && editProduct ? (
                                <>
                                    {editProduct.base_price > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Harga dasar: {formatRupiah(editProduct.base_price)}
                                        </p>
                                    )}
                                    {(() => {
                                        const fee = editProduct.fee ?? 0
                                        const komisi = editProduct.komisi ?? 0
                                        const margin = editForm.price - fee + komisi
                                        const breakeven = fee - komisi
                                        return (
                                            <div className={`rounded-md border p-2.5 text-xs space-y-1.5 ${
                                                margin < 0
                                                    ? 'border-destructive/30 bg-destructive/5 text-destructive'
                                                    : 'border-emerald-200 bg-emerald-50'
                                            }`}>
                                                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                                                    <span>Biaya provider:</span>
                                                    <span className="text-right font-medium text-foreground">− {formatRupiah(fee)}</span>
                                                    <span>Komisi balik ke saldo:</span>
                                                    <span className="text-right font-medium text-emerald-600">+ {formatRupiah(komisi)}</span>
                                                    <span className="font-semibold text-foreground">Biaya admin kamu:</span>
                                                    <span className="text-right font-semibold text-foreground">+ {formatRupiah(editForm.price)}</span>
                                                </div>
                                                <div className="border-t pt-1.5">
                                                    {margin < 0 ? (
                                                        <>
                                                            <p className="font-semibold">⚠️ Terlalu rendah, kamu akan rugi {formatRupiah(Math.abs(margin))} per transaksi!</p>
                                                            <p>Naikkan minimal ke <span className="font-semibold">{formatRupiah(breakeven)}</span> agar tidak rugi.</p>
                                                        </>
                                                    ) : (
                                                        <p className="font-semibold text-emerald-700">✓ Estimasi untung {formatRupiah(margin)} per transaksi</p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </>
                            ) : editProduct && editProduct.base_price > 0 ? (
                                <p className="text-xs text-muted-foreground">
                                    Harga dasar: {formatRupiah(editProduct.base_price)}
                                </p>
                            ) : null}
                        </div>

                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
                            Batal
                        </Button>
                        <Button
                            onClick={handleEditSave}
                            disabled={
                                editSaving ||
                                !editForm.label.trim() ||
                                !editForm.name.trim() ||
                                (editProduct !== null && editForm.price < editProduct.base_price) ||
                                (isPostpaid && editProduct !== null && editForm.price <= (editProduct.fee ?? 0) - (editProduct.komisi ?? 0))
                            }
                        >
                            {editSaving ? <Loader2 className="animate-spin" /> : <Save />}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sync result modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className={isThreeCol ? 'max-w-6xl' : 'max-w-lg'}
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
                                                {item.price > 0 ? formatRupiah(item.price) : 'Sesuai tagihan'}
                                            </span>
                                            {item.fee != null && item.fee > 0 && (
                                                <>
                                                    <span>&middot;</span>
                                                    <span>Biaya admin {formatRupiah(item.fee)}</span>
                                                </>
                                            )}
                                            {item.komisi != null && item.komisi > 0 && (
                                                <>
                                                    <span>&middot;</span>
                                                    <span className="text-green-600 font-medium">Komisi {formatRupiah(item.komisi)}</span>
                                                </>
                                            )}
                                            {item.price > 0 && (
                                                <>
                                                    <span>&middot;</span>
                                                    <span>{formatPeriod(item.period)}</span>
                                                </>
                                            )}
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

