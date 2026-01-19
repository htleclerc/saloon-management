"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Save, X, Trash2 } from "lucide-react";

export default function EditTeamMemberPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: "Orphelia",
        lastName: "Smith",
        email: "orphelia@adorablebraids.com",
        phone: "+33 6 12 34 56 78",
        sharingKey: 70,
        role: "Worker",
        address: "123 Rue de Paris",
        city: "Paris",
        zipCode: "75001",
        country: "France",
        status: "Active",
        notes: "Top performer, specializes in Box Braids",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Updated team member data:", formData);
        alert("Team member updated successfully!");
        router.push("/team");
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this team member? This action cannot be undone.")) {
            console.log("Deleting team member:", params.id);
            alert("Team member deleted successfully!");
            router.push("/team");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <TeamLayout title="Edit Team Member" description="Update team member information">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Team Member</h1>
                        <p className="text-gray-500 mt-1">Update team member information</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="danger" size="md" onClick={handleDelete}>
                            <Trash2 className="w-5 h-5" />
                            Delete
                        </Button>
                        <Button variant="danger" size="md" onClick={() => router.back()}>
                            <X className="w-5 h-5" />
                            Cancel
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sharing Key (%) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="sharingKey"
                                    value={formData.sharingKey}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                                <p className="text-xs text-gray-500 mt-1">Percentage of income this team member keeps</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option>Worker</option>
                                    <option>Admin</option>
                                    <option>Manager</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <Button type="submit" variant="success" size="lg" className="flex-1">
                                <Save className="w-5 h-5" />
                                Update Team Member
                            </Button>
                            <Button type="button" variant="danger" size="lg" onClick={() => router.back()}>
                                <X className="w-5 h-5" />
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </TeamLayout>
    );
}
