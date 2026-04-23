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
import { Check, Folder, Loader2, Minus, Pencil, Plus, PowerOff, RefreshCw, Save, Search, Trash2 } from 'lucide-react'
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
}

interface ServiceCategory {
    id: string
    name: string
    products_count?: number
}

interface CategoryProduct {
    id: string
    code: string
    name: string
    label: string
    price: number
    status: number
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
    const serviceType = service.code

    // ── Category management state ─────────────────────────────
    const [catOpen, setCatOpen]                       = useState(false)
    const [categories, setCategories]                 = useState<ServiceCategory[]>([])
    const [catLoading, setCatLoading]                 = useState(false)
    const [selectedCat, setSelectedCat]               = useState<ServiceCategory | null>(null)
    const [catProducts, setCatProducts]               = useState<CategoryProduct[]>([])
    const [catProductsLoading, setCatProductsLoading] = useState(false)
    const [addingCat, setAddingCat]                   = useState(false)
    const [newCatName, setNewCatName]                 = useState('')
    const [newCatSaving, setNewCatSaving]             = useState(false)
    const [editingCat, setEditingCat]                 = useState<ServiceCategory | null>(null)
    const [editCatName, setEditCatName]               = useState('')
    const [editCatSaving, setEditCatSaving]           = useState(false)
    const [deletingCatId, setDeletingCatId]           = useState<string | null>(null)

    const loadCategories = async () => {
        setCatLoading(true)
        try {
            const { data } = await axios.get(`/admin/ppob/${service.code}/categories`)
            setCategories(data)
        } catch {
            toast.error('Gagal memuat kategori.')
        } finally {
            setCatLoading(false)
        }
    }

    const loadCatProducts = async (cat: ServiceCategory) => {
        setSelectedCat(cat)
        setCatProducts([])
        setCatProductsLoading(true)
        try {
            const { data } = await axios.get(`/admin/ppob/${service.code}/categories/${cat.id}/products`)
            setCatProducts(data)
        } catch {
            toast.error('Gagal memuat produk.')
        } finally {
            setCatProductsLoading(false)
        }
    }

    const handleOpenCatDialog = () => {
        setCatOpen(true)
        setSelectedCat(null)
        setCatProducts([])
        setAddingCat(false)
        setNewCatName('')
        setEditingCat(null)
        loadCategories()
    }

    const handleAddCategory = async () => {
        if (!newCatName.trim()) return
        setNewCatSaving(true)
        try {
            const { data } = await axios.post(`/admin/ppob/${service.code}/categories`, { name: newCatName.trim() })
            setCategories(prev => [...prev, { ...data, products_count: 0 }].sort((a, b) => a.name.localeCompare(b.name)))
            setNewCatName('')
            setAddingCat(false)
            toast.success('Kategori berhasil ditambahkan.')
        } catch (err: any) {
            const msg = err?.response?.data?.errors?.name?.[0] ?? 'Gagal menambah kategori.'
            toast.error(msg)
        } finally {
            setNewCatSaving(false)
        }
    }

    const handleUpdateCategory = async () => {
        if (!editingCat || !editCatName.trim()) return
        setEditCatSaving(true)
        try {
            const { data } = await axios.patch(`/admin/ppob/${service.code}/categories/${editingCat.id}`, { name: editCatName.trim() })
            setCategories(prev => prev.map(c => c.id === data.id ? { ...c, name: data.name } : c).sort((a, b) => a.name.localeCompare(b.name)))
            if (selectedCat?.id === data.id) setSelectedCat(s => s ? { ...s, name: data.name } : s)
            setEditingCat(null)
            toast.success('Kategori berhasil diperbarui.')
        } catch (err: any) {
            const msg = err?.response?.data?.errors?.name?.[0] ?? 'Gagal memperbarui kategori.'
            toast.error(msg)
        } finally {
            setEditCatSaving(false)
        }
    }

    const handleDeleteCategory = async (catId: string) => {
        setDeletingCatId(catId)
        try {
            await axios.delete(`/admin/ppob/${service.code}/categories/${catId}`)
            setCategories(prev => prev.filter(c => c.id !== catId))
            if (selectedCat?.id === catId) { setSelectedCat(null); setCatProducts([]) }
            toast.success('Kategori berhasil dihapus.')
        } catch {
            toast.error('Gagal menghapus kategori.')
        } finally {
            setDeletingCatId(null)
        }
    }
    const [localProducts, setLocalProducts] = useState<SavedProduct[]>(products)
    useEffect(() => { setLocalProducts(products) }, [products])

    // ── Edit dialog state ───────────────────────────────────────────
    const [editOpen, setEditOpen]       = useState(false)
    const [editProduct, setEditProduct] = useState<SavedProduct | null>(null)
    const [editForm, setEditForm]       = useState({ label: '', name: '', price: 0 })
    const [editSaving, setEditSaving]   = useState(false)

    const handleEdit = useCallback((product: SavedProduct) => {
        setEditProduct(product)
        setEditForm({ label: product.label, name: product.name, price: product.price })
        setEditOpen(true)
    }, [])

    const handleEditSave = async () => {
        if (!editProduct) return
        setEditSaving(true)
        try {
            await axios.patch(`/admin/ppob/products/${editProduct.id}`, editForm)
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
        () => makeColumns(supported, handleEdit, handleToggle),
        [supported, handleEdit, handleToggle],
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
                        <>
                            {serviceType === "pulsa" || serviceType === "paket" ? (
                                <Button className="shrink-0" onClick={handleOpenCatDialog}>
                                    <Folder className="size-4" />
                                    Manajemen Kategori {serviceType}
                                </Button>
                            ) : null}
                            <Button onClick={handleSync} disabled={loading} className="shrink-0">
                                {loading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <RefreshCw />
                                )}
                                Sinkronisasi Produk
                            </Button>
                        </>
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
                            <label className="text-sm font-medium">Harga</label>
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
                                (editProduct !== null && editForm.price < editProduct.base_price)
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

            {/* Manajemen Kategori modal */}
            <Dialog open={catOpen} onOpenChange={setCatOpen}>
                <DialogContent className="max-w-5xl" showCloseButton>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Folder className="size-5" />
                            Manajemen Kategori — {service.description}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex h-[65vh] gap-0 overflow-hidden rounded-lg border">
                        {/* ── Left panel: category list ───────────────── */}
                        <div className="flex w-72 shrink-0 flex-col border-r">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                <span className="text-sm font-semibold">List Data Kategori</span>
                                <button
                                    type="button"
                                    onClick={() => { setAddingCat(true); setEditingCat(null); setNewCatName('') }}
                                    className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    <Plus className="size-3" />
                                    Tambah Data
                                </button>
                            </div>

                            {/* Add form */}
                            {addingCat && (
                                <div className="flex flex-col gap-2 border-b px-3 py-3">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newCatName}
                                        onChange={e => setNewCatName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') setAddingCat(false) }}
                                        placeholder="Nama kategori..."
                                        className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none ring-inset focus:ring-2 focus:ring-primary/30"
                                    />
                                    <div className="flex gap-1.5">
                                        <Button size="sm" onClick={handleAddCategory} disabled={newCatSaving || !newCatName.trim()} className="h-7 flex-1 text-xs">
                                            {newCatSaving ? <Loader2 className="size-3 animate-spin" /> : 'Simpan'}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setAddingCat(false)} className="h-7 flex-1 text-xs">
                                            Batal
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Category list */}
                            <div className="flex-1 overflow-y-auto">
                                {catLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : categories.length === 0 ? (
                                    <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                                        Belum ada kategori.
                                    </p>
                                ) : (
                                    categories.map(cat => (
                                        <div
                                            key={cat.id}
                                            className={[
                                                'group flex cursor-pointer items-center justify-between px-4 py-3 text-sm transition-colors',
                                                selectedCat?.id === cat.id
                                                    ? 'bg-primary/10 font-medium text-primary'
                                                    : 'hover:bg-muted/60',
                                            ].join(' ')}
                                            onClick={() => { setEditingCat(null); loadCatProducts(cat) }}
                                        >
                                            {editingCat?.id === cat.id ? (
                                                <div className="flex w-full flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={editCatName}
                                                        onChange={e => setEditCatName(e.target.value)}
                                                        onKeyDown={e => { if (e.key === 'Enter') handleUpdateCategory(); if (e.key === 'Escape') setEditingCat(null) }}
                                                        className="w-full rounded border bg-background px-2 py-1 text-xs outline-none ring-inset focus:ring-2 focus:ring-primary/30"
                                                    />
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={handleUpdateCategory}
                                                            disabled={editCatSaving || !editCatName.trim()}
                                                            className="flex-1 rounded bg-primary py-0.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                                                        >
                                                            {editCatSaving ? <Loader2 className="mx-auto size-3 animate-spin" /> : 'OK'}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingCat(null)}
                                                            className="flex-1 rounded border py-0.5 text-xs"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="min-w-0 flex-1 truncate">{cat.name}</span>
                                                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={e => { e.stopPropagation(); setEditingCat(cat); setEditCatName(cat.name); setAddingCat(false) }}
                                                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={e => { e.stopPropagation(); handleDeleteCategory(cat.id) }}
                                                            disabled={deletingCatId === cat.id}
                                                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                                            title="Hapus"
                                                        >
                                                            {deletingCatId === cat.id
                                                                ? <Loader2 className="size-3.5 animate-spin" />
                                                                : <Trash2 className="size-3.5" />
                                                            }
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* ── Right panel: products of selected category ── */}
                        <div className="flex flex-1 flex-col">
                            {/* Header */}
                            <div className="flex items-center border-b px-5 py-3">
                                <span className="text-sm font-semibold text-muted-foreground">
                                    {selectedCat
                                        ? <>Produk dalam kategori <span className="text-foreground">{selectedCat.name}</span></>
                                        : 'Pilih kategori untuk melihat produk'}
                                </span>
                            </div>

                            {/* Product list */}
                            <div className="flex-1 overflow-y-auto px-5 py-3">
                                {!selectedCat ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Folder className="size-10 opacity-25" />
                                        <p className="text-sm">Belum ada kategori dipilih</p>
                                    </div>
                                ) : catProductsLoading ? (
                                    <div className="flex h-full items-center justify-center">
                                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : catProducts.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Search className="size-8 opacity-25" />
                                        <p className="text-sm">Tidak ada produk dalam kategori ini.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                        {catProducts.map(p => (
                                            <div
                                                key={p.id}
                                                className="flex flex-col gap-0.5 rounded-lg border bg-background p-3 text-sm"
                                            >
                                                <span className="font-medium leading-snug">{p.name}</span>
                                                <span className="text-xs text-muted-foreground">{p.label}</span>
                                                <span className="mt-1 text-xs font-semibold">
                                                    {formatRupiah(p.price)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}

