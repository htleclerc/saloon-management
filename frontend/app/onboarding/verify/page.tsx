"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function VerifyPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [email, setEmail] = useState("");
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const savedEmail = localStorage.getItem("signup_email") || "email@exemple.com";
        setEmail(savedEmail);
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }

        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = [...code];
        pastedData.split("").forEach((char, i) => {
            if (i < 6) newCode[i] = char;
        });
        setCode(newCode);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleResend = () => {
        setCountdown(60);
        setCanResend(false);
        // Simulate resend
    };

    const handleVerify = () => {
        const fullCode = code.join("");
        if (fullCode.length !== 6) return;

        setIsVerifying(true);

        // Simulate verification
        setTimeout(() => {
            setIsVerifying(false);
            setIsVerified(true);

            setTimeout(() => {
                router.push("/onboarding/setup");
            }, 1000);
        }, 1500);
    };

    const isCodeComplete = code.every(digit => digit !== "");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/login")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Retour</span>
                </button>

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {isVerified ? (
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        ) : (
                            <Mail className="w-8 h-8 text-white" />
                        )}
                    </div>

                    <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-2">
                        {t("onboarding.verify.title")}
                    </h1>
                    <p className="text-gray-500 text-center mb-8">
                        {t("onboarding.verify.subtitle")}<br />
                        <span className="font-bold text-gray-700">{email}</span>
                    </p>

                    {/* OTP Input */}
                    <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none ${digit
                                        ? "border-[#8B5CF6] bg-purple-50"
                                        : "border-gray-200 bg-white"
                                    } focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10`}
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <button
                        onClick={handleVerify}
                        disabled={!isCodeComplete || isVerifying || isVerified}
                        className={`w-full py-4 rounded-xl font-extrabold text-base transition-all ${isCodeComplete && !isVerifying && !isVerified
                                ? "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white hover:scale-[1.02] shadow-[0_10px_20px_-5px_rgba(139,92,246,0.3)] active:scale-[0.98]"
                                : isVerified
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isVerifying ? (
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Vérification...
                            </span>
                        ) : isVerified ? (
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Vérifié !
                            </span>
                        ) : (
                            t("onboarding.verify.verify")
                        )}
                    </button>

                    {/* Resend */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm mb-2">{t("onboarding.verify.didntReceive")}</p>
                        {canResend ? (
                            <button
                                onClick={handleResend}
                                className="text-[#8B5CF6] font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {t("onboarding.verify.resend")}
                            </button>
                        ) : (
                            <p className="text-gray-400 text-sm">
                                {t("onboarding.verify.resendIn")} <span className="font-bold">{countdown}s</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Demo hint */}
                <p className="text-center text-gray-400 text-xs mt-6">
                    💡 Pour la démo, entrez n'importe quel code à 6 chiffres
                </p>
            </div>
        </div>
    );
}
