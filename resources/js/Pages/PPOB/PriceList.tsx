import { useState } from "react";
import { ReactNode } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Product } from "@/types/pricelist";

function PriceList() {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("pln");
    const [selected, setSelected] = useState<Product | null>(null);

    const loadPricelist = async () => {
        setLoading(true);

        try {
            const res = await fetch(`/api/ppob/pricelist/${type}`);
            const json = await res.json();

            setData(json?.data?.pricelist || []);
        } catch (err) {
            console.error(err);
            alert("Gagal load data");
        }

        setLoading(false);
    };

    return (
        <div className="p-6 space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold">Pricelist</h1>
                <p className="text-gray-500 text-sm">
                    Pilih produk untuk lanjut ke transaksi
                </p>
            </div>

            {/* FILTER */}
            <div className="flex flex-wrap gap-2 items-center">
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="border px-3 py-2 rounded-lg"
                >
                    <option value="pulsa">Pulsa</option>
                    <option value="data">Data</option>
                    <option value="pln">PLN</option>
                    <option value="game">Game</option>
                    <option value="etoll">E-Toll</option>
                    <option value="voucher">Voucher</option>
                </select>

                <button
                    onClick={loadPricelist}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    {loading ? "Loading..." : "Load"}
                </button>
            </div>

            {/* SELECTED PRODUCT */}
            {selected && (
                <div className="p-4 border rounded-lg bg-green-50">
                    <p className="text-sm text-gray-600">Produk dipilih:</p>
                    <p className="font-semibold">
                        {selected.product_description}{" "}
                        {selected.product_nominal}
                    </p>
                    <p className="text-green-600 font-bold">
                        Rp{" "}
                        {Number(selected.product_price).toLocaleString("id-ID")}
                    </p>
                </div>
            )}

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                    <thead className="bg-gray-100 text-sm">
                        <tr>
                            <th className="p-3 border">Icon</th>
                            <th className="p-3 border">Kode</th>
                            <th className="p-3 border">Produk</th>
                            <th className="p-3 border">Harga</th>
                            <th className="p-3 border">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center p-6">
                                    Loading data...
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((item, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setSelected(item)}
                                >
                                    <td className="border p-2 text-center">
                                        <img
                                            src={item.icon_url}
                                            className="w-8 h-8 mx-auto"
                                        />
                                    </td>

                                    <td className="border p-2">
                                        {item.product_code}
                                    </td>

                                    <td className="border p-2">
                                        {item.product_description}{" "}
                                        {item.product_nominal}
                                    </td>

                                    <td className="border p-2">
                                        Rp{" "}
                                        {Number(
                                            item.product_price,
                                        ).toLocaleString("id-ID")}
                                    </td>

                                    <td className="border p-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${
                                                item.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center p-6">
                                    Belum ada data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

PriceList.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default PriceList;
