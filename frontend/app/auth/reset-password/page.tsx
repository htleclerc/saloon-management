"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError(t("auth.passwordTooShort"));
            return;
        }

        if (password !== confirmPassword) {
            setError(t("auth.passwordMismatch"));
            return;
        }

        setIsLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password,
            });

            if (updateError) {
                throw updateError;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
                <div className="bg-surface rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-color-primary mb-2">
                        {t("auth.passwordUpdated")}
                    </h1>
                    <p className="text-color-secondary">
                        {t("auth.redirecting")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
            <div className="bg-surface rounded-2xl shadow-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-color-primary">
                        {t("auth.newPassword")}
                    </h1>
                    <p className="text-color-secondary mt-2">
                        {t("auth.enterNewPassword")}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-color-secondary mb-1.5">
                            {t("auth.newPassword")}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-color-tertiary" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 border border-color-primary rounded-xl text-color-primary bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-color-tertiary hover:text-color-primary"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-color-secondary mb-1.5">
                            {t("auth.confirmPassword")}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-color-tertiary" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 border border-color-primary rounded-xl text-color-primary bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? t("auth.updating")
                            : t("auth.updatePassword")
                        }
                    </Button>
                </form>
            </div>
        </div>
    );
}
