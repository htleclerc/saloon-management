"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Scissors,
    Sparkles,
    Heart,
    Users,
    CheckCircle2,
    Plus,
    X,
    Mail,
    Building2
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/context/AuthProvider";

const salonTypes = [
    { id: "braids", icon: Sparkles, color: "from-purple-500 to-pink-500" },
    { id: "hair", icon: Scissors, color: "from-pink-500 to-rose-500" },
    { id: "nails", icon: Sparkles, color: "from-rose-500 to-orange-500" },
    { id: "barber", icon: Scissors, color: "from-blue-500 to-indigo-500" },
    { id: "beauty", icon: Heart, color: "from-teal-500 to-emerald-500" },
    { id: "spa", icon: Sparkles, color: "from-cyan-500 to-blue-500" },
];

const defaultServices: Record<string, string[]> = {
    braids: ["Box Braids", "Cornrows", "Twists", "Locs", "Crochet Braids", "Feed-in Braids", "Goddess Locs", "Passion Twists"],
    hair: ["Coupe", "Coloration", "Brushing", "Lissage", "Balayage", "Mèches", "Soin profond", "Coiffure événementielle"],
    nails: ["Manucure", "Pédicure", "Gel UV", "Nail Art", "French", "Pose capsules", "Vernis semi-permanent", "Soin des mains"],
    barber: ["Coupe classique", "Dégradé", "Barbe", "Rasage traditionnel", "Coupe + Barbe", "Design capillaire", "Soin barbe"],
    beauty: ["Maquillage", "Épilation", "Soin visage", "Extension cils", "Microblading", "Teinture sourcils", "Soin corps"],
    spa: ["Massage", "Gommage", "Enveloppement", "Hammam", "Soins du dos", "Réflexologie", "Aromathérapie"],
};

export default function SetupPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [teamMembers, setTeamMembers] = useState<{ name: string; email: string }[]>([]);
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");

    const handleTypeSelect = (typeId: string) => {
        setSelectedType(typeId);
        setSelectedServices([]);
    };

    const toggleService = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    const addTeamMember = () => {
        if (newMemberName && newMemberEmail) {
            setTeamMembers([...teamMembers, { name: newMemberName, email: newMemberEmail }]);
            setNewMemberName("");
            setNewMemberEmail("");
        }
    };

    const removeTeamMember = (index: number) => {
        setTeamMembers(teamMembers.filter((_, i) => i !== index));
    };

    const handleComplete = () => {
        // Save configuration and login
        const savedName = localStorage.getItem("signup_name") || "Nouveau Propriétaire";
        const savedEmail = localStorage.getItem("signup_email") || "user@example.com";

        login({
            id: `user_${Date.now()}`,
            name: savedName,
            email: savedEmail,
            role: "admin",
            tenantId: `tenant_${Date.now()}`,
            isDemo: false
        });

        localStorage.removeItem("signup_name");
        localStorage.removeItem("signup_email");

        router.push("/");
    };

    const canProceed = () => {
        if (step === 1) return selectedType !== null;
        if (step === 2) return selectedServices.length > 0;
        return true;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : router.push("/onboarding/verify")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">{t("onboarding.setup.back")}</span>
                    </button>

                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                        {t("onboarding.setup.title")}
                    </h1>

                    {/* Progress */}
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`flex-1 h-2 rounded-full transition-all ${s <= step ? "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]" : "bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span className={step >= 1 ? "text-[#8B5CF6] font-bold" : ""}>{t("onboarding.setup.step1")}</span>
                        <span className={step >= 2 ? "text-[#8B5CF6] font-bold" : ""}>{t("onboarding.setup.step2")}</span>
                        <span className={step >= 3 ? "text-[#8B5CF6] font-bold" : ""}>{t("onboarding.setup.step3")}</span>
                        <span className={step >= 4 ? "text-[#8B5CF6] font-bold" : ""}>{t("onboarding.setup.step4")}</span>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    {/* Step 1: Salon Type */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">{t("onboarding.setup.salonType")}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {salonTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => handleTypeSelect(type.id)}
                                            className={`relative p-6 rounded-2xl border-2 transition-all ${selectedType === type.id
                                                    ? "border-[#8B5CF6] bg-purple-50 shadow-lg scale-[1.02]"
                                                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                                                }`}
                                        >
                                            {selectedType === type.id && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle2 className="w-5 h-5 text-[#8B5CF6]" />
                                                </div>
                                            )}
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mx-auto mb-3`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 text-center">
                                                {t(`onboarding.setup.salonTypes.${type.id}`)}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Services */}
                    {step === 2 && selectedType && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">{t("onboarding.setup.selectServices")}</h2>
                            <div className="flex flex-wrap gap-3">
                                {defaultServices[selectedType]?.map((service) => (
                                    <button
                                        key={service}
                                        onClick={() => toggleService(service)}
                                        className={`px-4 py-2.5 rounded-full border-2 font-medium transition-all ${selectedServices.includes(service)
                                                ? "border-[#8B5CF6] bg-[#8B5CF6] text-white"
                                                : "border-gray-200 text-gray-700 hover:border-gray-300"
                                            }`}
                                    >
                                        {selectedServices.includes(service) && (
                                            <CheckCircle2 className="w-4 h-4 inline mr-2" />
                                        )}
                                        {service}
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                {selectedServices.length} service(s) sélectionné(s)
                            </p>
                        </div>
                    )}

                    {/* Step 3: Team */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">{t("onboarding.setup.addTeam")}</h2>

                            {/* Add member form */}
                            <div className="flex gap-3 mb-6">
                                <div className="flex-1 relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        placeholder="Nom"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
                                    />
                                </div>
                                <button
                                    onClick={addTeamMember}
                                    disabled={!newMemberName || !newMemberEmail}
                                    className="px-4 py-3 bg-[#8B5CF6] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7C3AED] transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Team list */}
                            {teamMembers.length > 0 ? (
                                <div className="space-y-3">
                                    {teamMembers.map((member, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-white font-bold">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{member.name}</p>
                                                    <p className="text-sm text-gray-500">{member.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeTeamMember(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Aucun membre ajouté</p>
                                    <p className="text-sm">Vous pourrez en ajouter plus tard</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">{t("onboarding.setup.review")}</h2>

                            <div className="space-y-6">
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Building2 className="w-5 h-5 text-[#8B5CF6]" />
                                        <span className="font-bold text-gray-900">Type de salon</span>
                                    </div>
                                    <p className="text-[#8B5CF6] font-medium ml-8">
                                        {selectedType && t(`onboarding.setup.salonTypes.${selectedType}`)}
                                    </p>
                                </div>

                                <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Sparkles className="w-5 h-5 text-pink-500" />
                                        <span className="font-bold text-gray-900">Services ({selectedServices.length})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 ml-8">
                                        {selectedServices.map((service) => (
                                            <span key={service} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-pink-200">
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users className="w-5 h-5 text-orange-500" />
                                        <span className="font-bold text-gray-900">Équipe ({teamMembers.length})</span>
                                    </div>
                                    {teamMembers.length > 0 ? (
                                        <div className="ml-8 space-y-1">
                                            {teamMembers.map((member, index) => (
                                                <p key={index} className="text-gray-700 text-sm">{member.name} - {member.email}</p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm ml-8">Aucun membre ajouté</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                    {step === 3 && (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                        >
                            {t("onboarding.setup.skip")}
                        </button>
                    )}

                    <button
                        onClick={() => step < 4 ? setStep(step + 1) : handleComplete()}
                        disabled={!canProceed()}
                        className={`flex-1 py-4 rounded-xl font-extrabold text-base transition-all flex items-center justify-center gap-2 ${canProceed()
                                ? "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white hover:scale-[1.02] shadow-[0_10px_20px_-5px_rgba(139,92,246,0.3)] active:scale-[0.98]"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {step < 4 ? (
                            <>
                                {t("onboarding.setup.next")}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        ) : (
                            <>
                                {t("onboarding.setup.complete")}
                                <CheckCircle2 className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
