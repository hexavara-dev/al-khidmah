import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Image, Pencil, Plus, Trash2, X } from 'lucide-react';

interface Slider {
    id: number;
    title: string;
    subtitle: string | null;
    button_text: string | null;
    button_url: string | null;
    image: string | null;
    bg_color: string;
    is_active: boolean;
    order: number;
}

interface Props {
    sliders: Slider[];
}

const BG_PRESETS = [
    { label: 'Teal Gelap', value: '#008f92' },
    { label: 'Teal Utama', value: '#00cacd' },
    { label: 'Hijau Teal', value: '#00736b' },
    { label: 'Biru Teal', value: '#00566b' },
    { label: 'Ungu', value: '#5b21b6' },
    { label: 'Merah', value: '#b91c1c' },
];

interface SliderFormData {
    title: string;
    subtitle: string;
    button_text: string;
    button_url: string;
    bg_color: string;
    is_active: boolean;
    order: string;
    image: File | null;
}

function SliderForm({
    initial,
    onClose,
    isEdit = false,
    sliderId,
}: {
    initial?: Partial<Slider>;
    onClose: () => void;
    isEdit?: boolean;
    sliderId?: number;
}) {
    const { data, setData, processing, errors, reset } = useForm<SliderFormData>({
        title: initial?.title ?? '',
        subtitle: initial?.subtitle ?? '',
        button_text: initial?.button_text ?? '',
        button_url: initial?.button_url ?? '#campaigns',
        bg_color: initial?.bg_color ?? '#008f92',
        is_active: initial?.is_active ?? true,
        order: String(initial?.order ?? 0),
        image: null,
    });

    const [preview, setPreview] = useState<string | null>(
        initial?.image ? `/storage/${initial.image}` : null
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('image', file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([key, val]) => {
            if (val instanceof File) formData.append(key, val);
            else if (typeof val === 'boolean') formData.append(key, val ? '1' : '0');
            else if (val !== null && val !== undefined) formData.append(key, String(val));
        });

        if (isEdit && sliderId) {
            formData.append('_method', 'PUT');
            router.post(`/admin/sliders/${sliderId}`, formData, {
                forceFormData: true,
                onSuccess: onClose,
            });
        } else {
            router.post('/admin/sliders', formData, {
                forceFormData: true,
                onSuccess: () => { reset(); onClose(); },
            });
        }
    };

    const field = (label: string, name: string, opts?: { type?: string; placeholder?: string; as?: 'textarea' }) => (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
            {opts?.as === 'textarea' ? (
                <textarea
                    value={String(data[name as keyof SliderFormData] ?? '')}
                    onChange={e => setData(name as keyof SliderFormData, e.target.value)}
                    placeholder={opts?.placeholder}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00cacd]/30 resize-none"
                />
            ) : (
                <input
                    type={opts?.type ?? 'text'}
                    value={String(data[name as keyof SliderFormData] ?? '')}
                    onChange={e => setData(name as keyof SliderFormData, e.target.value)}
                    placeholder={opts?.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00cacd]/30"
                />
            )}
            {errors[name as keyof SliderFormData] && <p className="text-xs text-red-500 mt-1">{errors[name as keyof SliderFormData]}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">
                        {isEdit ? 'Edit Slider' : 'Tambah Slider'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Image upload */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Gambar Latar (opsional)</label>
                        <div className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden">
                            {preview ? (
                                <div className="relative">
                                    <img src={preview} alt="preview" className="w-full h-36 object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setData('image', null); setPreview(null); }}
                                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-gray-50 transition">
                                    <Image className="w-6 h-6 text-gray-300 mb-1" />
                                    <span className="text-xs text-gray-400">Klik untuk upload gambar</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    {field('Judul *', 'title', { placeholder: 'Judul utama slider' })}
                    {field('Subjudul', 'subtitle', { as: 'textarea', placeholder: 'Deskripsi singkat...' })}

                    <div className="grid grid-cols-2 gap-3">
                        {field('Teks Tombol', 'button_text', { placeholder: 'Donasi Sekarang' })}
                        {field('URL Tombol', 'button_url', { placeholder: '#campaigns' })}
                    </div>

                    {/* BG Color */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Warna Latar</label>
                        <div className="flex gap-2 flex-wrap mb-2">
                            {BG_PRESETS.map(p => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setData('bg_color', p.value)}
                                    title={p.label}
                                    className="w-8 h-8 rounded-full border-2 transition-all"
                                    style={{
                                        backgroundColor: p.value,
                                        borderColor: data.bg_color === p.value ? '#fff' : 'transparent',
                                        boxShadow: data.bg_color === p.value ? `0 0 0 2px ${p.value}` : undefined,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={data.bg_color}
                                onChange={e => setData('bg_color', e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                            />
                            <span className="text-xs text-gray-400">Warna kustom: {data.bg_color}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {field('Urutan', 'order', { type: 'number', placeholder: '0' })}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                <input
                                    type="checkbox"
                                    checked={Boolean(data.is_active)}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 rounded accent-[#00cacd]"
                                />
                                <span className="text-sm text-gray-700">Aktif / Tampilkan</span>
                            </label>
                        </div>
                    </div>

                    {/* Preview bar */}
                    <div
                        className="rounded-xl p-4 text-white text-center relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${data.bg_color} 0%, #004f52 100%)` }}
                    >
                        <p className="text-xs text-white/60 mb-1">Preview</p>
                        <p className="font-bold text-sm">{data.title || 'Judul Slider'}</p>
                        {data.subtitle && <p className="text-white/70 text-xs mt-1">{data.subtitle}</p>}
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-2.5 rounded-xl bg-[#00cacd] text-white text-sm font-semibold hover:bg-[#00b8bb] transition disabled:opacity-60"
                        >
                            {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambahkan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Sliders({ sliders }: Props) {
    const [showAdd, setShowAdd] = useState(false);
    const [editSlider, setEditSlider] = useState<Slider | null>(null);

    const handleDelete = (id: number) => {
        if (!confirm('Hapus slider ini?')) return;
        router.delete(`/admin/sliders/${id}`);
    };

    const handleToggle = (s: Slider) => {
        router.post(
            `/admin/sliders/${s.id}`,
            { _method: 'PUT', title: s.title, subtitle: s.subtitle ?? '', button_text: s.button_text ?? '', button_url: s.button_url ?? '', bg_color: s.bg_color, is_active: s.is_active ? '0' : '1', order: String(s.order) },
            { preserveState: true }
        );
    };

    return (
        <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Kelola Slider' }]}>
            <Head title="Kelola Slider" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Kelola Slider</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Atur banner slider yang tampil di halaman donasi (maks. 5 slide).
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 bg-[#00cacd] hover:bg-[#00b8bb] text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Slide
                    </button>
                </div>

                {/* Live preview */}
                {sliders.length > 0 && (
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        <div
                            className="relative h-36 flex items-center justify-center text-center text-white"
                            style={{ background: `linear-gradient(135deg, ${sliders[0].bg_color} 0%, #004f52 100%)` }}
                        >
                            <div>
                                <p className="text-xs text-white/60 mb-1">🌙 Al-Khidmah Foundation</p>
                                <p className="font-bold text-lg">{sliders[0].title}</p>
                                {sliders[0].subtitle && <p className="text-white/70 text-xs mt-1">{sliders[0].subtitle}</p>}
                            </div>
                            <div className="absolute bottom-3 flex gap-2">
                                {sliders.map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-full"
                                        style={{ width: i === 0 ? 20 : 8, height: 8, backgroundColor: i === 0 ? 'white' : 'rgba(255,255,255,0.4)' }}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-center text-xs text-gray-400 py-2 bg-gray-50 border-t border-gray-100">
                            Preview slide pertama · Auto slide aktif
                        </p>
                    </div>
                )}

                {/* Slider list */}
                {sliders.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <Image className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Belum ada slider</p>
                        <p className="text-sm text-gray-400 mt-1">Klik "Tambah Slide" untuk memulai</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sliders.map((s, i) => (
                            <div
                                key={s.id}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 p-4 hover:shadow-md transition"
                            >
                                {/* Color swatch / image */}
                                <div
                                    className="flex-none w-16 h-14 rounded-lg overflow-hidden"
                                    style={{ background: `linear-gradient(135deg, ${s.bg_color} 0%, #004f52 100%)` }}
                                >
                                    {s.image && (
                                        <img src={`/storage/${s.image}`} alt={s.title} className="w-full h-full object-cover opacity-80" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                                        <h3 className="font-semibold text-gray-800 text-sm truncate">{s.title}</h3>
                                    </div>
                                    {s.subtitle && (
                                        <p className="text-xs text-gray-400 truncate">{s.subtitle}</p>
                                    )}
                                    {s.button_text && (
                                        <span className="inline-block text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1">
                                            {s.button_text} → {s.button_url}
                                        </span>
                                    )}
                                </div>

                                {/* Status toggle */}
                                <div className="flex items-center gap-2 flex-none">
                                    <button
                                        onClick={() => handleToggle(s)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${s.is_active ? 'bg-[#00cacd]' : 'bg-gray-300'}`}
                                        title={s.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    >
                                        <span
                                            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${s.is_active ? 'translate-x-4' : 'translate-x-1'}`}
                                        />
                                    </button>
                                    <button
                                        onClick={() => setEditSlider(s)}
                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAdd && <SliderForm onClose={() => setShowAdd(false)} />}
            {editSlider && (
                <SliderForm
                    isEdit
                    sliderId={editSlider.id}
                    initial={editSlider}
                    onClose={() => setEditSlider(null)}
                />
            )}
        </AdminLayout>
    );
}
