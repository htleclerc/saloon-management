"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    Sparkles,
    Clock,
    Euro,
    Image as ImageIcon,
    Plus,
    Trash2,
    CheckCircle,
    Layout
} from "lucide-react";

interface ServiceFormProps {
    initialData?: any;
    mode: "simple" | "advanced";
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function ServiceForm({ initialData, mode, onSubmit, onCancel }: ServiceFormProps) {
    const [formData, setFormData] = useState(initialData || {
        name: "",
        description: "",
        price: "",
        duration: "",
        category: "Braiding",
        image: "",
        gallery: [],
        status: "active"
    });

    const isAdvanced = mode === "advanced";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-xl shadow-gray-200/50 bg-white rounded-[2rem] p-8">
                <div className="space-y-8">
                    {/* Mode Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${isAdvanced ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isAdvanced ? <Sparkles className="w-6 h-6" /> : <Layout className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isAdvanced ? "Advanced Configuration" : "Quick Update"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {isAdvanced ? "Detailed service management & media" : "Basic service details for fast updates"}
                                </p>
                            </div>
                        </div>
                        {isAdvanced && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status:</span>
                                <select
                                    className="bg-gray-50 border-none text-sm font-bold rounded-lg px-3 py-1.5 focus:ring-0"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Always visible: Base fields */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Service Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Box Braids"
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 font-bold text-gray-900 transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Euro className="w-4 h-4" />
                                Price (€)
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 font-bold text-gray-900 transition-all"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Duration
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., 2-3 hours"
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 font-bold text-gray-900 transition-all"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                required
                            />
                        </div>

                        {/* Advanced Fields */}
                        {isAdvanced && (
                            <>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 font-bold text-gray-900 transition-all appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Braiding">Braiding</option>
                                        <option value="Tailoring">Tailoring</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Consultation">Consultation</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Detailed Description</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe the service details, maintenance tips, etc."
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 font-medium text-gray-700 transition-all"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {/* Media Section */}
                                <div className="md:col-span-2 space-y-6 pt-4">
                                    <h4 className="text-sm font-black text-gray-900 border-l-4 border-purple-500 pl-3">Media & Gallery</h4>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Cover Image URL</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                placeholder="https://images.unsplash.com/..."
                                                className="flex-1 px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 font-medium text-gray-600 transition-all"
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            />
                                            {formData.image && (
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                                                    <img src={formData.image} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Gallery Preview</label>
                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                            {formData.gallery?.map((img: string, idx: number) => (
                                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                        onClick={() => {
                                                            const newGallery = [...formData.gallery];
                                                            newGallery.splice(idx, 1);
                                                            setFormData({ ...formData, gallery: newGallery });
                                                        }}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors group"
                                            >
                                                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="px-8 py-6 rounded-2xl font-bold"
                >
                    Discard
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    className="px-10 py-6 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20"
                >
                    {initialData ? "Save Changes" : "Publish Service"}
                    <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </form>
    );
}
