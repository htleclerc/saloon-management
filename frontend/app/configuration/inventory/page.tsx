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
    Filter,
    ArrowUpDown
} from "lucide-react";
import { useToast } from "@/context/ToastProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

import { productService } from "@/lib/services";
import { useEffect } from "react";

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([]);
    const { canModify, activeSalonId } = useAuth();

    // Load Products
    const loadProducts = () => {
        if (activeSalonId) {
            productService.getAll(Number(activeSalonId)).then(setProducts);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [activeSalonId]);

    const addProduct = async (data: any) => {
        try {
            await productService.create({ ...data, salonId: Number(activeSalonId) });
            loadProducts();
            addToast("Product added successfully", "success");
        } catch (e) {
            addToast("Failed to add product", "error");
        }
    };

    const updateProduct = async (id: number, data: any) => {
        try {
            await productService.update(id, data);
            loadProducts();
        } catch (e) {
            addToast("Failed to update product", "error");
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await productService.delete(id);
            loadProducts();
        } catch (e) {
            addToast("Failed to delete product", "error");
        }
    };
    const { addToast } = useToast();
    const { confirm } = useConfirm();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = async (id: number, name: string) => {
        if (handleReadOnlyClick()) return;

        const confirmed = await confirm({
            title: "Delete Product",
            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            confirmText: "Delete",
            type: "error"
        });

        if (confirmed) {
            deleteProduct(id);
            addToast(`${name} has been removed from inventory.`, "success");
        }
    };

    const handleUpdateStock = (id: number, currentStock: number, delta: number) => {
        if (handleReadOnlyClick()) return;

        updateProduct(id, { stock: Math.max(0, currentStock + delta) });
        addToast("Stock level updated successfully.", "success");
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
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Products</p>
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
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Low Stock</p>
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
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Value</p>
                            <p className="text-2xl font-black text-[var(--color-success)]">
                                €{products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0).toLocaleString()}
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
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">In Stock</p>
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
                        placeholder="Search products by name or description..."
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
                    <Button variant="primary" disabled={!canModify} className="h-11 rounded-xl shadow-lg border-none bg-gradient-to-r from-[var(--color-primary)] to-gray-900 disabled:opacity-50" onClick={() => { if (!handleReadOnlyClick()) addProduct({ name: "New Product", price: 0, category: "General", stock: 0 }) }}>
                        <Plus className="w-5 h-5 mr-2" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Products Table */}
            <Card className="overflow-hidden border-none shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
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
                                                <p className="text-xs text-gray-500 line-clamp-1">{product.description || 'No description'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider">
                                            {product.category || 'Uncategorized'}
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
                                                    LOW STOCK
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="font-black text-[var(--color-primary)] text-lg">€{product.price}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <ReadOnlyGuard>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] border-none">
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
                                            <p className="text-gray-500 font-bold">No products found matching your search</p>
                                            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategoryFilter("All") }}>
                                                Clear filters
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
