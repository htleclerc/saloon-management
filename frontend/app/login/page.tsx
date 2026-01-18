"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    Globe,
    Clock,
    Star,
    LayoutDashboard,
    Users,
    Shield,
    CheckCircle2,
    ArrowRight,
    User
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/context/AuthProvider";

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { login, demoLogin } = useAuth();
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleDemoMode = (role: "super_admin" | "admin" | "manager" | "worker" | "client") => {
        demoLogin(role);
        router.push("/");
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login({
            id: "1",
            name: "User",
            email: email,
            role: "admin",
            tenantId: "tenant_1",
            isDemo: false
        });
        router.push("/");
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        // Store signup data temporarily
        localStorage.setItem("signup_email", email);
        localStorage.setItem("signup_name", fullName);
        router.push("/onboarding/verify");
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white font-poppins">
            {/* Left Panel - Marketing */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#8B5CF6] via-[#EC4899] to-[#F59E0B] p-12 text-white flex-col justify-between relative overflow-hidden">
                {/* Subtle background patterns */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.5 4.5L12 9L7.5 4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7.5 19.5L12 15L16.5 19.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.5" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{t("auth.marketing.title")}</h1>
                            <p className="text-white/80 text-sm font-medium">{t("auth.marketing.subtitle")}</p>
                        </div>
                    </div>

                    <div className="space-y-10 max-w-lg">
                        <div className="flex gap-5">
                            <div className="bg-white/15 p-3 rounded-2xl h-fit backdrop-blur-lg border border-white/10 shrink-0">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{t("auth.marketing.feature1")}</h3>
                                <p className="text-white/70 leading-relaxed">{t("auth.marketing.feature1Desc")}</p>
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <div className="bg-white/15 p-3 rounded-2xl h-fit backdrop-blur-lg border border-white/10 shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{t("auth.marketing.feature2")}</h3>
                                <p className="text-white/70 leading-relaxed">{t("auth.marketing.feature2Desc")}</p>
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <div className="bg-white/15 p-3 rounded-2xl h-fit backdrop-blur-lg border border-white/10 shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{t("auth.marketing.feature3")}</h3>
                                <p className="text-white/70 leading-relaxed">{t("auth.marketing.feature3Desc")}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem]">
                        <div className="flex gap-4 items-center mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-lg">Sophie Martin</p>
                                <div className="flex gap-1 text-yellow-400">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                            </div>
                        </div>
                        <p className="text-white/90 italic text-lg leading-relaxed">
                            "{t("auth.marketing.testimonial")}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-10 lg:p-16 bg-gray-50/50">
                <div className="w-full max-w-md">
                    {/* Tabs */}
                    <div className="bg-gray-100/80 p-1 rounded-xl flex gap-1 mb-4 border border-gray-200">
                        <button
                            onClick={() => setActiveTab("login")}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "login"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {t("auth.login")}
                        </button>
                        <button
                            onClick={() => setActiveTab("signup")}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "signup"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {t("auth.signup")}
                        </button>
                    </div>

                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
                            {activeTab === "login" ? t("auth.welcomeBack") : t("auth.welcomeNew")}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {activeTab === "login" ? t("auth.connectToAccess") : t("auth.signupDesc")}
                        </p>
                    </div>

                    <div className="space-y-3 mb-5">
                        <Button variant="outline" className="w-full py-3 border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-3 rounded-xl transition-all hover:border-purple-200">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            <span className="font-bold">{t("auth.googleLogin")}</span>
                        </Button>
                        <Button variant="outline" className="w-full py-3 border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-3 rounded-xl transition-all hover:border-purple-200">
                            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                            <span className="font-bold">{t("auth.facebookLogin")}</span>
                        </Button>
                    </div>

                    <div className="relative mb-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-50 px-4 text-gray-400 font-extrabold tracking-widest">{t("auth.orWithEmail")}</span>
                        </div>
                    </div>

                    {/* LOGIN FORM */}
                    {activeTab === "login" && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">
                                    {t("auth.emailOrPhone")}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                                        placeholder={t("auth.emailPlaceholder")}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">
                                    {t("auth.password")}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                                        placeholder={t("auth.passwordPlaceholder")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-5 w-5 text-[#8B5CF6] focus:ring-[#8B5CF6] border-gray-300 rounded-md cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-600 cursor-pointer">
                                        {t("auth.rememberMe")}
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <a href="#" className="font-bold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">
                                        {t("auth.forgotPassword")}
                                    </a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white transform transition-all border-none hover:scale-[1.02] shadow-[0_10px_20px_-5px_rgba(139,92,246,0.3)] active:scale-[0.98] font-extrabold text-base"
                            >
                                {t("auth.login")}
                            </button>
                        </form>
                    )}

                    {/* SIGNUP FORM */}
                    {activeTab === "signup" && (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">
                                    {t("auth.fullName")}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                                        placeholder={t("auth.fullNamePlaceholder")}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">
                                    {t("auth.emailOrPhone")}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                                        placeholder={t("auth.emailPlaceholder")}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">
                                    {t("auth.password")}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                                        placeholder={t("auth.passwordPlaceholder")}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">
                                    {t("auth.confirmPassword")}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                                        placeholder={t("auth.passwordPlaceholder")}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 text-center px-2">
                                {t("auth.termsAccept")}{" "}
                                <a href="#" className="text-[#8B5CF6] hover:underline">{t("auth.termsOfService")}</a>
                                {" "}{t("auth.and")}{" "}
                                <a href="#" className="text-[#8B5CF6] hover:underline">{t("auth.privacyPolicy")}</a>
                            </p>

                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white transform transition-all border-none hover:scale-[1.02] shadow-[0_10px_20px_-5px_rgba(139,92,246,0.3)] active:scale-[0.98] font-extrabold text-base"
                            >
                                {t("auth.createAccount")}
                            </button>
                        </form>
                    )}

                    <div className="mt-5 text-center">
                        <p className="text-gray-500 text-sm font-medium">
                            {activeTab === "login" ? t("auth.notRegistered") : t("auth.alreadyRegistered")}{" "}
                            <button
                                onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
                                className="text-[#8B5CF6] font-bold hover:underline"
                            >
                                {activeTab === "login" ? t("auth.createAccount") : t("auth.loginNow")}
                            </button>
                        </p>
                    </div>

                    <div className="mt-6 flex flex-col items-center gap-4">
                        {/* Demo Mode Button */}
                        <button
                            onClick={() => handleDemoMode("admin")}
                            className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-orange-100 text-orange-700 font-bold hover:bg-orange-200 transition-colors border-2 border-orange-200"
                        >
                            <Globe className="w-4 h-4 animate-pulse" />
                            <span>{t("auth.tryDemo")}</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>

                        <div className="flex items-center gap-6 text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{t("auth.secureSsl")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{t("auth.rgpd")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{t("auth.freeTrial")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
