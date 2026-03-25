"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import {
    Package,
    Plus,
    Search,
    Edit,
    Trash2,
    AlertTriangle,
    CheckCircle,
    TrendingDown,
    TrendingUp,
    X,
} from "lucide-react";
import { useToast } from "@/context/ToastProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useTranslation } from "@/i18n";
import { useCurrency } from "@/hooks/useCurrency";

import { productService } from "@/lib/services";
import { useEffect } from "react";

export default function InventoryPage() {
    const { t } = useTranslation();
    const { format: formatCurrency, symbol } = useCurrency();
    const [products, setProducts] = useState<any[]>([]);
    const { canModify, activeSalonId } = useAuth();
    const { addToast } = useToast();
    const { confirm } = useConfirm();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formCategory, setFormCategory] = useState("");
    const [formPrice, setFormPrice] = useState(0);
    const [formStock, setFormStock] = useState(0);

    // Load Products
    const loadProducts = () => {
        if (activeSalonId) {
            productService.getAll(Number(activeSalonId)).then(setProducts);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [activeSalonId]);

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Modal handlers
    const handleOpenModal = (product?: any) => {
        if (handleReadOnlyClick()) return;
        if (product) {
            setEditingId(product.id);
            setFormName(product.name);
            setFormDescription(product.description || "");
            setFormCategory(product.category || "");
            setFormPrice(product.price || 0);
            setFormStock(product.stock || 0);
        } else {
            setEditingId(null);
            setFormName("");
            setFormDescription("");
            setFormCategory("General");
            setFormPrice(0);
            setFormStock(0);
        }
        setIsModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (handleReadOnlyClick()) return;
        if (!formName.trim()) return;

        const productData = {
            name: formName.trim(),
            description: formDescription.trim() || undefined,
            category: formCategory.trim() || undefined,
            price: formPrice,
            stock: formStock,
            isActive: true,
            isLinkedToService: false,
        };

        try {
            if (editingId) {
                await productService.update(editingId, productData);
                loadProducts();
                addToast(t("configuration.inventory.productUpdated"), "success");
            } else {
                await productService.create({ ...productData, salonId: Number(activeSalonId) });
                loadProducts();
                addToast(t("configuration.inventory.productAdded"), "success");
            }
            setIsModalOpen(false);
        } catch (e) {
            addToast(editingId ? t("configuration.inventory.updateError") : t("configuration.inventory.addError"), "error");
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (handleReadOnlyClick()) return;

        const confirmed = await confirm({
            title: t("configuration.inventory.deleteProduct"),
            message: t("configuration.inventory.deleteConfirm", { name }),
            confirmText: t("common.delete"),
            type: "error"
        });

        if (confirmed) {
            try {
                await productService.delete(id);
                loadProducts();
                addToast(t("configuration.inventory.productRemoved", { name }), "success");
            } catch (e) {
                addToast(t("configuration.inventory.deleteError"), "error");
            }
        }
    };

    const handleUpdateStock = (id: number, currentStock: number, delta: number) => {
        if (handleReadOnlyClick()) return;

        productService.update(id, { stock: Math.max(0, currentStock + delta) })
            .then(() => {
                loadProducts();
                addToast(t("configuration.inventory.stockUpdated"), "success");
            })
            .catch(() => addToast(t("configuration.inventory.updateError"), "error"));
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-[var(--color-primary-light)] to-white border-[var(--color-primary-light)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-primary)] rounded-lg text-white">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t("configuration.inventory.totalProducts")}</p>
                            <p className="text-2xl font-black text-[var(--color-primary)]">{products.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-[var(--color-warning-light)] to-white border-[var(--color-warning-light)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-warning)] rounded-lg text-white">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t("configuration.inventory.lowStock")}</p>
                            <p className="text-2xl font-black text-[var(--color-warning)]">
                                {products.filter(p => (p.stock || 0) < 5).length}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-[var(--color-success-light)] to-white border-[var(--color-success-light)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-success)] rounded-lg text-white">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t("configuration.inventory.totalValue")}</p>
                            <p className="text-2xl font-black text-[var(--color-success)]">
                                {formatCurrency(products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0))}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-[var(--color-secondary-light)] to-white border-[var(--color-secondary-light)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-secondary)] rounded-lg text-white">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t("configuration.inventory.inStock")}</p>
                            <p className="text-2xl font-black text-[var(--color-secondary)]">
                                {products.filter(p => (p.stock || 0) >= 5).length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t("configuration.inventory.searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] h-11"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 h-11">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat!)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${categoryFilter === cat ? 'bg-[var(--color-primary)] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="primary"
                        disabled={!canModify}
                        className="h-11 rounded-xl shadow-lg border-none bg-gradient-to-r from-[var(--color-primary)] to-gray-900 disabled:opacity-50"
                        onClick={() => handleOpenModal()}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        {t("configuration.inventory.addProduct")}
                    </Button>
                </div>
            </div>

            {/* Products Table */}
            <Card className="overflow-hidden border-none shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">{t("configuration.inventory.product")}</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">{t("common.category")}</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">{t("common.stock")}</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">{t("common.price")}</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">{t("common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center text-[var(--color-primary)] font-black text-xl">
                                                {product.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{product.description || t("configuration.inventory.noDescription")}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider">
                                            {product.category || t("configuration.inventory.uncategorized")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleUpdateStock(product.id, product.stock, -1)}
                                                    disabled={!canModify}
                                                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-400 hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)] transition-colors disabled:opacity-30"
                                                >
                                                    <TrendingDown className="w-3 h-3" />
                                                </button>
                                                <span className={`text-sm font-black w-8 text-center ${(product.stock || 0) < 5 ? 'text-[var(--color-error)]' : 'text-gray-900'}`}>
                                                    {product.stock || 0}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateStock(product.id, product.stock, 1)}
                                                    disabled={!canModify}
                                                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-400 hover:bg-[var(--color-success-light)] hover:text-[var(--color-success)] transition-colors disabled:opacity-30"
                                                >
                                                    <TrendingUp className="w-3 h-3" />
                                                </button>
                                            </div>
                                            {(product.stock || 0) < 5 && (
                                                <span className="text-[10px] text-[var(--color-error)] font-black animate-pulse flex items-center gap-1">
                                                    <AlertTriangle className="w-2.5 h-2.5" />
                                                    {t("configuration.inventory.lowStockAlert")}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="font-black text-[var(--color-primary)] text-lg">{formatCurrency(product.price)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <ReadOnlyGuard>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenModal(product)}
                                                    className="h-8 w-8 p-0 rounded-lg hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] border-none"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </ReadOnlyGuard>
                                            <ReadOnlyGuard>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    className="h-8 w-8 p-0 rounded-lg hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)] border-none"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </ReadOnlyGuard>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                                <Package className="w-8 h-8" />
                                            </div>
                                            <p className="text-gray-500 font-bold">{t("configuration.inventory.noProductsFound")}</p>
                                            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategoryFilter("All") }}>
                                                {t("configuration.inventory.clearFilters")}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add/Edit Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">
                                {editingId ? t("configuration.inventory.editProduct") : t("configuration.inventory.newProduct")}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("configuration.inventory.productName")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary font-medium"
                                placeholder={t("configuration.inventory.productNamePlaceholder")}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("configuration.inventory.description")}
                            </label>
                            <textarea
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                rows={2}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                placeholder={t("configuration.inventory.descriptionPlaceholder")}
                            />
                        </div>

                        {/* Category & Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("common.category")}
                                </label>
                                <input
                                    type="text"
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="General"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {`${t("common.price")} (${symbol()})`}
                                </label>
                                <input
                                    type="number"
                                    value={formPrice}
                                    onChange={(e) => setFormPrice(Number(e.target.value))}
                                    min={0}
                                    step={0.01}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold"
                                />
                            </div>
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {editingId ? t("common.stock") : t("configuration.inventory.initialStock")}
                            </label>
                            <input
                                type="number"
                                value={formStock}
                                onChange={(e) => setFormStock(Number(e.target.value))}
                                min={0}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold"
                            />
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleSaveProduct}
                                disabled={!formName.trim()}
                            >
                                {t("configuration.inventory.saveProduct")}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
