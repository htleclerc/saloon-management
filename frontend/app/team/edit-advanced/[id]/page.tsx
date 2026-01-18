"use client";

import { useState, use, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    User,
    Briefcase,
    Scissors,
    Calendar,
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    Camera,
    Check,
    Save,
    Trash2,
} from "lucide-react";

const steps = [
    { id: 1, name: "Personal", icon: User, description: "Personal information" },
    { id: 2, name: "Employment", icon: Briefcase, description: "Employment details" },
    { id: 3, name: "Skills", icon: Scissors, description: "Skills & services" },
    { id: 4, name: "Schedule", icon: Calendar, description: "Schedule & availability" },
    { id: 5, name: "Finalize", icon: CheckCircle, description: "Final validation" },
];

const availableServices = [
    { id: 1, name: "Box Braids", duration: "3-4h", price: 120 },
    { id: 2, name: "Cornrows", duration: "2-3h", price: 85 },
    { id: 3, name: "Senegalese Twists", duration: "3-4h", price: 110 },
    { id: 4, name: "Locs", duration: "4-5h", price: 150 },
    { id: 5, name: "Men's Haircut", duration: "30min", price: 25 },
    { id: 6, name: "Coloring", duration: "2h", price: 80 },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function EditAdvancedTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const stepperRef = useRef<HTMLDivElement>(null);

    // Auto-scroll active step to center on mobile
    useEffect(() => {
        if (stepperRef.current) {
            const activeStepButton = stepperRef.current.querySelector(`[data-step-id="${currentStep}"]`);
            if (activeStepButton) {
                activeStepButton.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest'
                });
            }
        }
    }, [currentStep]);

    // Step 1: Personal Info - Pre-filled with team member data
    const [firstName, setFirstName] = useState("Orphelia");
    const [lastName, setLastName] = useState("Smith");
    const [email, setEmail] = useState("orphelia@adorablebraids.com");
    const [phone, setPhone] = useState("+33 6 12 34 56 78");
    const [address, setAddress] = useState("123 Rue de Paris");
    const [city, setCity] = useState("Paris");
    const [zipCode, setZipCode] = useState("75001");
    const [birthDate, setBirthDate] = useState("1990-05-15");
    const [gender, setGender] = useState("female");

    // Step 2: Employment
    const [role, setRole] = useState("Team Member");
    const [employeeType, setEmployeeType] = useState("full-time");
    const [startDate, setStartDate] = useState("2024-01-15");
    const [contractEndDate, setContractEndDate] = useState("");
    const [sharingKey, setSharingKey] = useState(70);
    const [baseSalary, setBaseSalary] = useState("2500");
    const [status, setStatus] = useState("Active");

    // Step 3: Skills
    const [selectedServices, setSelectedServices] = useState<number[]>([1, 2, 3]);
    const [specialties, setSpecialties] = useState("Box Braids, African Braids");
    const [experienceLevel, setExperienceLevel] = useState("expert");

    // Step 4: Schedule
    const [schedule, setSchedule] = useState<Record<string, { active: boolean; start: string; end: string }>>({
        Mon: { active: true, start: "09:00", end: "18:00" },
        Tue: { active: true, start: "09:00", end: "18:00" },
        Wed: { active: true, start: "09:00", end: "18:00" },
        Thu: { active: true, start: "09:00", end: "18:00" },
        Fri: { active: true, start: "09:00", end: "18:00" },
        Sat: { active: true, start: "09:00", end: "14:00" },
        Sun: { active: false, start: "", end: "" },
    });

    const toggleService = (id: number) => {
        setSelectedServices((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const toggleDay = (day: string) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: { ...prev[day], active: !prev[day].active },
        }));
    };

    const updateScheduleTime = (day: string, field: "start" | "end", value: string) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }));
    };

    const handleSubmit = () => {
        console.log("Updated team member data:", {
            id: id,
            firstName, lastName, email, phone, address, city, zipCode, birthDate, gender,
            role, employeeType, startDate, contractEndDate, sharingKey, baseSalary, status,
            selectedServices, Specialties, experienceLevel, schedule,
        });
        alert("Team member updated successfully!");
        router.push(`/team/detail/${id}`);
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this team member? This action cannot be undone.")) {
            console.log("Deleting team member:", id);
            alert("Team member deleted successfully!");
            router.push("/team");
        }
    };

    const renderStep1 = () => (
        <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Personal Information</h3>
                    <p className="text-xs text-gray-500">Identity and contact details of the team member</p>
                </div>
            </div>

            {/* Photo Upload */}
            <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : "?"}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 transition-colors">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <div>
                    <p className="font-medium text-gray-900 text-sm">Profile Picture</p>
                    <p className="text-xs text-gray-500 mb-2">JPG, PNG. Max 2MB</p>
                    <Button variant="outline" size="sm">Change Photo</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="First Name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Last Name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="email@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="+33 6 12 34 56 78"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="123 Rue de Paris"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Paris"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                    <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="75001"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </Card>
    );

    const renderStep2 = () => (
        <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Employment Details</h3>
                    <p className="text-xs text-gray-500">Role, contract, and compensation</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="Team Member">Team Member</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Administrator</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
                    <select
                        value={employeeType}
                        onChange={(e) => setEmployeeType(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="freelance">Freelance</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contract End Date (Optional)</label>
                    <input
                        type="date"
                        value={contractEndDate}
                        onChange={(e) => setContractEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Salary (€/month)</label>
                    <input
                        type="number"
                        value={baseSalary}
                        onChange={(e) => setBaseSalary(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Sharing Key Slider */}
            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sharing Key: <span className="text-purple-600 font-bold">{sharingKey}%</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sharingKey}
                    onChange={(e) => setSharingKey(parseInt(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0% (Company)</span>
                    <span>100% (Team Member)</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                    The team member will receive <strong>{sharingKey}%</strong> of the income, the company <strong>{100 - sharingKey}%</strong>
                </p>
            </div>
        </Card>
    );

    const renderStep3 = () => (
        <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Skills & Services</h3>
                    <p className="text-xs text-gray-500">Services this team member can perform</p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Assigned Services</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableServices.map((service) => {
                        const isSelected = selectedServices.includes(service.id);
                        return (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() => toggleService(service.id)}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-purple-300"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm text-gray-900">{service.name}</span>
                                    {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                                </div>
                                <div className="flex gap-2 text-xs text-gray-500">
                                    <span>{service.duration}</span>
                                    <span>•</span>
                                    <span>€{service.price}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        <option value="beginner">Beginner (0-2 years)</option>
                        <option value="intermediate">Intermediate (2-5 years)</option>
                        <option value="expert">Expert (5+ years)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                    <input
                        type="text"
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="e.g.: African braids, coloring..."
                    />
                </div>
            </div>
        </Card>
    );

    const renderStep4 = () => (
        <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Schedule & Availability</h3>
                    <p className="text-xs text-gray-500">Define working hours</p>
                </div>
            </div>

            <div className="space-y-3">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all ${schedule[day].active ? "bg-purple-50 border border-purple-200" : "bg-gray-50"
                            }`}
                    >
                        <label className="flex items-center gap-3 cursor-pointer w-20">
                            <input
                                type="checkbox"
                                checked={schedule[day].active}
                                onChange={() => toggleDay(day)}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className={`font-medium text-sm ${schedule[day].active ? "text-purple-700" : "text-gray-500"}`}>
                                {day}
                            </span>
                        </label>
                        {schedule[day].active && (
                            <div className="flex flex-wrap items-center gap-2 flex-1 justify-end md:justify-start">
                                <input
                                    type="time"
                                    value={schedule[day].start}
                                    onChange={(e) => updateScheduleTime(day, "start", e.target.value)}
                                    className="px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-24 md:w-auto"
                                />
                                <span className="text-gray-400 text-xs md:text-sm">to</span>
                                <input
                                    type="time"
                                    value={schedule[day].end}
                                    onChange={(e) => updateScheduleTime(day, "end", e.target.value)}
                                    className="px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-24 md:w-auto"
                                />
                            </div>
                        )}
                        {!schedule[day].active && (
                            <span className="text-sm text-gray-400">Rest day</span>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );

    const renderStep5 = () => (
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold">Recap & Validation</h3>
                    <p className="text-xs text-purple-100">Check information before update</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Personal */}
                <div className="p-4 bg-white/10 rounded-xl">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" /> Identity
                    </h4>
                    <p className="text-sm text-purple-100">
                        {firstName} {lastName} • {email} • {phone}
                    </p>
                </div>

                {/* Employment */}
                <div className="p-4 bg-white/10 rounded-xl">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Employment
                    </h4>
                    <p className="text-sm text-purple-100">
                        {role} • {employeeType === "full-time" ? "Full-time" : employeeType === "part-time" ? "Part-time" : "Freelance"} •
                        Sharing: {sharingKey}% • Status: {status}
                    </p>
                </div>

                {/* Services */}
                <div className="p-4 bg-white/10 rounded-xl">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Scissors className="w-4 h-4" /> Services
                    </h4>
                    <p className="text-sm text-purple-100">
                        {selectedServices.length} service(s) assigned • Level: {experienceLevel}
                    </p>
                </div>

                {/* Schedule */}
                <div className="p-4 bg-white/10 rounded-xl">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Schedule
                    </h4>
                    <p className="text-sm text-purple-100">
                        {Object.values(schedule).filter((s) => s.active).length} working day(s) per week
                    </p>
                </div>
            </div>

            {/* Delete Button */}
            <div className="mt-6 pt-4 border-t border-white/20">
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-200 hover:text-red-100 transition-colors text-sm"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete this team member
                </button>
            </div>
        </Card>
    );

    return (
        <TeamLayout
            title={`Edit ${firstName} ${lastName}`}
            description="Complete form to modify team member information"
        >
            {/* Mobile Step Indicator - Only visible on mobile */}
            <div className="md:hidden mb-4 p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white shadow-lg">
                <div className="text-sm font-medium opacity-90">Step {currentStep} of 5</div>
                <div className="text-lg font-bold mt-1">{steps[currentStep - 1].name}</div>
                <div className="text-xs opacity-75 mt-1">{steps[currentStep - 1].description}</div>
            </div>

            {/* Progress Steps */}
            <div ref={stepperRef} className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
                <div className="flex items-center justify-between min-w-[320px]">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        return (
                            <div key={step.id} className="flex items-center">
                                <button
                                    data-step-id={step.id}
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`flex flex-col items-center ${isActive || isCompleted ? "cursor-pointer" : "cursor-default"
                                        }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive
                                            ? "bg-purple-600 text-white shadow-lg"
                                            : isCompleted
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-200 text-gray-500"
                                            }`}
                                    >
                                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span
                                        className={`text-[10px] md:text-xs mt-1 font-medium whitespace-nowrap ${isActive ? "text-purple-600" : isCompleted ? "text-green-600" : "text-gray-400"
                                            }`}
                                    >
                                        {step.name}
                                    </span>
                                </button>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`w-16 md:w-24 h-1 mx-2 rounded ${currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                                            }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-between md:items-center mt-6">
                <Button
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className={`w-full md:w-auto ${currentStep === 1 ? "hidden md:invisible md:block" : ""}`}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </Button>

                {currentStep < 5 && (
                    <Button variant="secondary" size="md" onClick={handleSubmit} className="w-full md:w-auto text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                )}

                {currentStep < 5 ? (
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                        className="w-full md:w-auto"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button variant="primary" size="md" onClick={handleSubmit} className="w-full md:w-auto">
                        <Check className="w-4 h-4" />
                        Confirm & Update
                    </Button>
                )}
            </div>
        </TeamLayout>
    );
}
