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
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslation } from "@/i18n";



import { useServices, useWorkers } from "@/hooks/useServices";
import { workerService } from "@/lib/services/WorkerService";
import { useAuth } from "@/context/AuthProvider";
import { useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { WorkerStatus } from "@/types";

export default function EditAdvancedTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
    const { t } = useTranslation();
    const { id } = use(params);
    const router = useRouter();
    const { canModify } = useAuth();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const { services: availableServices } = useServices();
    const { updateWorker, deleteWorker } = useWorkers();
    const { format, symbol } = useCurrency();
    const [currentStep, setCurrentStep] = useState(1);
    const stepperRef = useRef<HTMLDivElement>(null);

    const steps = [
        { id: 1, name: t("team.steps.personal.name"), icon: User, description: t("team.steps.personal.description") },
        { id: 2, name: t("team.steps.employment.name"), icon: Briefcase, description: t("team.steps.employment.description") },
        { id: 3, name: t("team.steps.skills.name"), icon: Scissors, description: t("team.steps.skills.description") },
        { id: 4, name: t("team.steps.schedule.name"), icon: Calendar, description: t("team.steps.schedule.description") },
        { id: 5, name: t("team.steps.finalize.name"), icon: CheckCircle, description: t("team.steps.finalize.description") },
    ];

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
    // Step 1: Personal Info
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState("female");

    // Step 2: Employment
    const [role, setRole] = useState("Team Member");
    const [employeeType, setEmployeeType] = useState("full-time");
    const [startDate, setStartDate] = useState("");
    const [contractEndDate, setContractEndDate] = useState("");
    const [sharingKey, setSharingKey] = useState(50);
    const [baseSalary, setBaseSalary] = useState("");
    const [status, setStatus] = useState("Active");

    useEffect(() => {
        const fetchWorker = async () => {
            try {
                const data = await workerService.getById(Number(id));
                if (data) {
                    const names = data.name.split(' ');
                    setFirstName(names[0] || "");
                    setLastName(names.slice(1).join(' ') || "");
                    setEmail(data.email || "");
                    setPhone(data.phone || "");
                    setSharingKey(data.sharingKey);
                    setStatus(data.status as string);
                    // Other fields not in SalonWorker type are skipped for now or would need extended type
                }
            } catch (e) {
                console.error("Worker not found");
            }
        };
        fetchWorker();
    }, [id]);

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

    const handleSubmit = async () => {
        if (!canModify || handleReadOnlyClick()) return;

        try {
            await updateWorker(Number(id), {
                name: `${firstName} ${lastName}`.trim(),
                email: email || undefined,
                phone: phone || undefined,
                sharingKey,
                status: status as WorkerStatus,
                // Add other fields as supported by backend
            });
            router.push(`/team`);
        } catch (error) {
            console.error("Failed to update worker", error);
        }
    };

    const handleDelete = async () => {
        if (!canModify || handleReadOnlyClick()) return;
        if (confirm(t("team.deleteConfirmation"))) {
            await deleteWorker(Number(id));
            router.push("/team");
        }
    };

    const renderStep1 = () => (
        <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center border-none">
                    <User className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{t("team.personalInfo")}</h3>
                    <p className="text-xs text-gray-500">{t("team.identityDetails")}</p>
                </div>
            </div>

            {/* Photo Upload */}
            <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white text-2xl font-bold border-none">
                        {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : "?"}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <div>
                    <p className="font-medium text-gray-900 text-sm">{t("team.profilePicture")}</p>
                    <p className="text-xs text-gray-500 mb-2">{t("team.photoFormats")}</p>
                    <Button variant="outline" size="sm">{t("team.changePhoto")}</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("team.firstName")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                        placeholder={t("team.firstName")}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("team.lastName")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                        placeholder={t("team.lastName")}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("team.email")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                        placeholder="email@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("team.phone")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                        placeholder="+33 6 12 34 56 78"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.address")}</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                        placeholder="123 Rue de Paris"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.city")}</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                        placeholder="Paris"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.zipCode")}</label>
                    <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                        placeholder="75001"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.dateOfBirth")}</label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.gender")}</label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                    >
                        <option value="female">{t("team.genderFemale")}</option>
                        <option value="male">{t("team.genderMale")}</option>
                        <option value="other">{t("team.genderOther")}</option>
                    </select>
                </div>
            </div>
        </Card>
    );

    const renderStep2 = () => (
        <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] rounded-lg flex items-center justify-center border-none">
                    <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{t("team.employmentDetails")}</h3>
                    <p className="text-xs text-gray-500">{t("team.employmentSubtitle")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.role")}</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                    >
                        <option value="Team Member">{t("team.roleMember")}</option>
                        <option value="Manager">{t("team.roleManager")}</option>
                        <option value="Admin">{t("team.roleAdmin")}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.contractType")}</label>
                    <select
                        value={employeeType}
                        onChange={(e) => setEmployeeType(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                    >
                        <option value="full-time">{t("team.contractFull")}</option>
                        <option value="part-time">{t("team.contractPart")}</option>
                        <option value="freelance">{t("team.contractFreelance")}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.status")}</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                    >
                        <option value="Active">{t("team.statusActive")}</option>
                        <option value="Inactive">{t("team.statusInactive")}</option>
                        <option value="On Leave">{t("team.statusOnLeave")}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.hireDate")}</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.contractEndDate")}</label>
                    <input
                        type="date"
                        value={contractEndDate}
                        onChange={(e) => setContractEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.baseSalary")} ({symbol()}/month)</label>
                    <input
                        type="number"
                        value={baseSalary}
                        onChange={(e) => setBaseSalary(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Sharing Key Slider */}
            <div className="mt-6 p-4 bg-[var(--color-primary-light)] rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t("team.sharingKey")}: <span className="text-[var(--color-primary)] font-bold">{sharingKey}%</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sharingKey}
                    onChange={(e) => setSharingKey(parseInt(e.target.value))}
                    className="w-full h-2 bg-[var(--color-primary-light)] opacity-70 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0% ({t("team.sharingCompany")})</span>
                    <span>100% ({t("team.sharingMember")})</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                    {t("team.sharingDescription", { member: sharingKey, company: 100 - sharingKey })}
                </p>
            </div>
        </Card>
    );

    const renderStep3 = () => (
        <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-warning-dark)] rounded-lg flex items-center justify-center border-none">
                    <Scissors className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{t("team.skillsServices")}</h3>
                    <p className="text-xs text-gray-500">{t("team.skillsSubtitle")}</p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">{t("team.assignedServices")}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableServices.map((service) => {
                        const isSelected = selectedServices.includes(service.id);
                        return (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() => toggleService(service.id)}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                                    : "border-gray-200 hover:border-[var(--color-primary-light)]"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm text-gray-900">{service.name}</span>
                                    {isSelected && <Check className="w-4 h-4 text-[var(--color-primary)] font-bold" />}
                                </div>
                                <div className="flex gap-2 text-xs text-gray-500">
                                    <span>{service.duration}</span>
                                    <span>•</span>
                                    <span>{format(service.price)}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.experienceLevel")}</label>
                    <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                    >
                        <option value="beginner">{t("team.expBeginner")}</option>
                        <option value="intermediate">{t("team.expIntermediate")}</option>
                        <option value="expert">{t("team.expExpert")}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("team.specialties")}</label>
                    <input
                        type="text"
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-sm"
                        placeholder={t("team.specialtiesPlaceholder")}
                    />
                </div>
            </div>
        </Card>
    );

    const renderStep4 = () => (
        <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center border-none">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{t("team.scheduleAvailability")}</h3>
                    <p className="text-xs text-gray-500">{t("team.scheduleSubtitle")}</p>
                </div>
            </div>

            <div className="space-y-3">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all ${schedule[day].active ? "bg-[var(--color-primary-light)] border border-[var(--color-primary-light)]" : "bg-gray-50"
                            }`}
                    >
                        <label className="flex items-center gap-3 cursor-pointer w-20">
                            <input
                                type="checkbox"
                                checked={schedule[day].active}
                                onChange={() => toggleDay(day)}
                                className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary-light)]"
                            />
                            <span className={`font-medium text-sm ${schedule[day].active ? "text-[var(--color-primary)]" : "text-gray-500"}`}>
                                {t("common.days." + day)}
                            </span>
                        </label>
                        {schedule[day].active && (
                            <div className="flex flex-wrap items-center gap-2 flex-1 justify-end md:justify-start">
                                <input
                                    type="time"
                                    value={schedule[day].start}
                                    onChange={(e) => updateScheduleTime(day, "start", e.target.value)}
                                    className="px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] w-24 md:w-auto"
                                />
                                <span className="text-gray-400 text-xs md:text-sm">{t("common.to")}</span>
                                <input
                                    type="time"
                                    value={schedule[day].end}
                                    onChange={(e) => updateScheduleTime(day, "end", e.target.value)}
                                    className="px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] w-24 md:w-auto"
                                />
                            </div>
                        )}
                        {!schedule[day].active && (
                            <span className="text-sm text-gray-400">{t("team.restDay")}</span>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );

    const renderStep5 = () => (
        <Card className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white border-0">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center border-none">
                    <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold">{t("team.recapValidation")}</h3>
                    <p className="text-xs text-white opacity-80">{t("team.recapSubtitle")}</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Personal */}
                <div className="p-4 bg-white/10 rounded-xl">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" /> {t("team.identity")}
                    </h4>
                    <p className="text-sm text-white opacity-80">
                        {firstName} {lastName} • {email} • {phone}
                    </p>
                </div>

                {/* Employment */}
                <div className="p-4 bg-white/10 rounded-xl">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> {t("team.employment")}
                    </h4>
                    <p className="text-sm text-white opacity-80">
                        {role} • {employeeType === "full-time" ? "Full-time" : employeeType === "part-time" ? "Part-time" : "Freelance"} •
                        Sharing: {sharingKey}% • Status: {status}
                    </p>
                </div>

                {/* Services */}
                <div className="p-4 bg-white/10 rounded-xl">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Scissors className="w-4 h-4" /> {t("team.services")}
                    </h4>
                    <p className="text-sm text-white opacity-80">
                        {selectedServices.length} service(s) assigned • Level: {experienceLevel}
                    </p>
                </div>

                {/* Schedule */}
                <div className="p-4 bg-white/10 rounded-xl">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {t("team.schedule")}
                    </h4>
                    <p className="text-sm text-white opacity-80">
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
                    {t("team.deleteMember")}
                </button>
            </div>
        </Card>
    );

    return (
        <TeamLayout
            title={t("team.editMemberTitle", { firstName, lastName })}
            description={t("team.editMemberDescription")}
        >
            {/* Mobile Step Indicator - Only visible on mobile */}
            <div className="md:hidden mb-4 p-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-xl text-white shadow-lg">
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
                                            ? "bg-[var(--color-primary)] text-white shadow-lg"
                                            : isCompleted
                                                ? "bg-[var(--color-success)] text-white"
                                                : "bg-gray-200 text-gray-500"
                                            }`}
                                    >
                                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span
                                        className={`text-[10px] md:text-xs mt-1 font-medium whitespace-nowrap ${isActive ? "text-[var(--color-primary)]" : isCompleted ? "text-[var(--color-success)]" : "text-gray-400"
                                            }`}
                                    >
                                        {step.name}
                                    </span>
                                </button>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`w-16 md:w-24 h-1 mx-2 rounded ${currentStep > step.id ? "bg-[var(--color-success)]" : "bg-gray-200"
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
                    {t("common.previous")}
                </Button>

                {currentStep < 5 && (
                    <Button variant="secondary" size="md" onClick={handleSubmit} className="w-full md:w-auto text-[var(--color-primary)] bg-[var(--color-primary-light)] hover:opacity-80 border-[var(--color-primary-light)]">
                        <Save className="w-4 h-4" />
                        {t("common.saveChanges")}
                    </Button>
                )}

                {currentStep < 5 ? (
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                        className="w-full md:w-auto"
                    >
                        {t("common.next")}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button variant="primary" size="md" onClick={handleSubmit} className="w-full md:w-auto">
                        <Check className="w-4 h-4" />
                        {t("team.confirmUpdate")}
                    </Button>
                )}
            </div>
        </TeamLayout>
    );
}
