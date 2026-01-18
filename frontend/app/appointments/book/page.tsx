"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Check, X } from "lucide-react";

// Mock data
const services = [
    { id: 1, name: "Box Braids", description: "Classic box braids with extensions", duration: "3-4 hours", price: "€120", image: "🎀", category: "Braids" },
    { id: 2, name: "Cornrows", description: "Traditional cornrow braiding", duration: "2-3 hours", price: "€85", image: "🌾", category: "Braids" },
    { id: 3, name: "Twists", description: "Beautiful twist hairstyle", duration: "2.5-3 hours", price: "€95", image: "🌀", category: "Braids" },
    { id: 4, name: "Locs", description: "Professional locs maintenance", duration: "3-5 hours", price: "€150", image: "🔗", category: "Locs" },
    { id: 5, name: "Hair Treatment", description: "Deep conditioning treatment", duration: "1-2 hours", price: "€75", image: "💆", category: "Treatment" },
    { id: 6, name: "Senegalese Twists", description: "Elegant Senegalese twist style", duration: "4-5 hours", price: "€135", image: "✨", category: "Braids" },
];

const salons = [
    { id: "tenant_1", name: "Demo Salon" },
    { id: "tenant_2", name: "Downtown Branch" },
    { id: "tenant_3", name: "Luxury Spa" },
    { id: "tenant_4", name: "Afro Chic" },
];

const workers = [
    { id: 1, name: "Orphelia", avatar: "O", specialty: "Braids & Twists", rating: 4.9, clients: 187, available: true, color: "from-purple-500 to-purple-700" },
    { id: 2, name: "Worker 2", avatar: "W2", specialty: "All Services", rating: 4.8, clients: 156, available: true, color: "from-pink-500 to-pink-700" },
    { id: 3, name: "Worker 3", avatar: "W3", specialty: "Locs Specialist", rating: 4.7, clients: 165, available: false, color: "from-orange-500 to-orange-700" },
    { id: 4, name: "Worker 4", avatar: "W4", specialty: "Braids Expert", rating: 4.6, clients: 142, available: true, color: "from-teal-500 to-teal-700" },
];

const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

import { useAuth } from "@/context/AuthProvider";

export default function BookAppointmentPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const salonId = searchParams.get("salonId");
    const [step, setStep] = useState(1);
    const [selectedSalon, setSelectedSalon] = useState<any>(null);

    useEffect(() => {
        if (salonId) {
            const salon = salons.find(s => s.id === salonId);
            if (salon) setSelectedSalon(salon);
        }
    }, [salonId]);

    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedWorker, setSelectedWorker] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [clientInfo, setClientInfo] = useState({
        name: user?.name || "",
        phone: "", // We don't have phone in user object usually, but could be blank
        email: user?.email || "",
        isAnonymous: false
    });

    // Update client info if user changes
    useEffect(() => {
        if (user) {
            setClientInfo(prev => ({
                ...prev,
                name: user.name,
                email: user.email || ""
            }));
        }
    }, [user]);

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        // Here you would typically send the booking data to your backend
        console.log("Booking submitted:", {
            service: selectedService,
            worker: selectedWorker,
            date: selectedDate,
            time: selectedTime,
            client: clientInfo
        });
        router.push("/appointments");
    };

    const canProceed = () => {
        switch (step) {
            case 1: return selectedService !== null;
            case 2: return selectedWorker !== null;
            case 3: return selectedDate !== "" && selectedTime !== "";
            case 4: return clientInfo.isAnonymous || (clientInfo.name && clientInfo.phone);
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/appointments" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Appointments
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Book Your Appointment {selectedSalon ? `at ${selectedSalon.name}` : ""}
                    </h1>
                    <p className="text-gray-600">Follow the steps to schedule your visit</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-3xl mx-auto">
                        {[
                            { num: 1, label: "Service" },
                            { num: 2, label: "Worker" },
                            { num: 3, label: "Date & Time" },
                            { num: 4, label: "Details" }
                        ].map((s, idx) => (
                            <div key={s.num} className="flex items-center flex-1">
                                <div className={`flex flex-col items-center ${idx < 3 ? 'flex-1' : ''}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${step >= s.num ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {step > s.num ? <Check className="w-6 h-6" /> : s.num}
                                    </div>
                                    <span className={`text-sm mt-2 font-medium ${step >= s.num ? 'text-purple-600' : 'text-gray-500'}`}>{s.label}</span>
                                </div>
                                {idx < 3 && (
                                    <div className={`flex-1 h-1 mx-4 rounded transition-all ${step > s.num ? 'bg-purple-600' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 1: Select Service */}
                {step === 1 && (
                    <Card className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Service</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedService?.id === service.id
                                        ? 'border-purple-600 bg-purple-50 shadow-lg'
                                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="text-5xl mb-4">{service.image}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-purple-600 font-semibold flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> {service.duration}
                                        </span>
                                        <span className="text-gray-900 font-bold text-lg">{service.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Step 2: Select Worker */}
                {step === 2 && (
                    <Card className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Stylist</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                onClick={() => setSelectedWorker({ id: 0, name: "Any Available" })}
                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedWorker?.id === 0
                                    ? 'border-purple-600 bg-purple-50 shadow-lg'
                                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                        ?
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Any Available Worker</h3>
                                        <p className="text-sm text-gray-600">First available stylist</p>
                                    </div>
                                </div>
                            </div>
                            {workers.map((worker) => (
                                <div
                                    key={worker.id}
                                    onClick={() => worker.available && setSelectedWorker(worker)}
                                    className={`p-6 rounded-xl border-2 transition-all ${!worker.available
                                        ? 'opacity-50 cursor-not-allowed border-gray-200'
                                        : selectedWorker?.id === worker.id
                                            ? 'border-purple-600 bg-purple-50 shadow-lg cursor-pointer'
                                            : 'border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${worker.color} rounded-full flex items-center justify-center text-white font-bold text-2xl`}>
                                            {worker.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{worker.name}</h3>
                                            <p className="text-sm text-gray-600">{worker.specialty}</p>
                                            {!worker.available && <span className="text-xs text-red-600 font-medium">Not Available</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Rating: <span className="text-yellow-500 font-semibold">★ {worker.rating}</span></span>
                                        <span className="text-gray-600"><span className="font-semibold">{worker.clients}</span> clients</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Step 3: Select Date & Time */}
                {step === 3 && (
                    <Card className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pick Date & Time</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Time</label>
                                <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                                    {timeSlots.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${selectedTime === time
                                                ? 'border-purple-600 bg-purple-50 text-purple-600'
                                                : 'border-gray-200 hover:border-purple-300 text-gray-700'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 4: Client Information */}
                {step === 4 && (
                    <Card className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
                        <div className="max-w-2xl">
                            <div className="mb-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={clientInfo.isAnonymous}
                                        onChange={(e) => setClientInfo({ ...clientInfo, isAnonymous: e.target.checked })}
                                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-gray-700 font-medium">Book as Anonymous Client</span>
                                </label>
                            </div>

                            {!clientInfo.isAnonymous && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            value={clientInfo.name}
                                            onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={clientInfo.phone}
                                            onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="+33 6 12 34 56 78"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={clientInfo.email}
                                            onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Booking Summary */}
                            <div className="mt-8 p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                                <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service:</span>
                                        <span className="font-semibold text-gray-900">{selectedService?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Worker:</span>
                                        <span className="font-semibold text-gray-900">{selectedWorker?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-semibold text-gray-900">{selectedDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-semibold text-gray-900">{selectedTime}</span>
                                    </div>
                                    {selectedSalon && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Salon:</span>
                                            <span className="font-semibold text-gray-900">{selectedSalon.name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t border-purple-300">
                                        <span className="text-gray-900 font-bold">Total:</span>
                                        <span className="text-purple-600 font-bold text-lg">{selectedService?.price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleBack}
                        disabled={step === 1}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Previous
                    </Button>

                    {step < 4 ? (
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="bg-purple-600 hover:bg-purple-700 gap-2"
                        >
                            Next
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={!canProceed()}
                            className="bg-green-600 hover:bg-green-700 gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Confirm Booking
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
