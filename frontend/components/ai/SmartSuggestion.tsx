"use client";

import { useAI } from "@/context/AIProvider";
import { Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SmartSuggestionProps {
    type: 'info' | 'warning' | 'success';
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Smart Suggestion Component
 * 
 * Displays inline AI-powered suggestions with optional actions
 */
export default function SmartSuggestion({ type, message, action }: SmartSuggestionProps) {
    const { config } = useAI();

    // Don't show if suggestions are disabled
    if (!config.enabled || !config.features.suggestions) {
        return null;
    }

    const icons = {
        info: <Lightbulb className="w-5 h-5 text-blue-600" />,
        warning: <AlertTriangle className="w-5 h-5 text-orange-600" />,
        success: <CheckCircle2 className="w-5 h-5 text-green-600" />
    };

    const styles = {
        info: "bg-blue-50 border-blue-200 text-blue-900",
        warning: "bg-orange-50 border-orange-200 text-orange-900",
        success: "bg-green-50 border-green-200 text-green-900"
    };

    const buttonStyles = {
        info: "bg-blue-600 hover:bg-blue-700 text-white",
        warning: "bg-orange-600 hover:bg-orange-700 text-white",
        success: "bg-green-600 hover:bg-green-700 text-white"
    };

    return (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${styles[type]} animate-in fade-in slide-in-from-top-2 duration-300`}>
            <div className="flex-shrink-0 mt-0.5">
                {icons[type]}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
            </div>
            {action && (
                <button
                    onClick={action.onClick}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${buttonStyles[type]}`}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

/**
 * Hook to generate smart suggestions based on context
 */
export function useSmartSuggestions() {
    const { config, isAvailable } = useAI();

    const checkBookingConflict = async (date: string, time: string, workerIds: number[]): Promise<SmartSuggestionProps | null> => {
        if (!isAvailable || !config.features.suggestions) {
            return null;
        }

        // TODO: Call AI API to check conflicts
        // For now, simple mock logic
        const hasConflict = false; // Placeholder

        if (hasConflict) {
            return {
                type: 'warning',
                message: 'Conflit horaire détecté ! Le worker est déjà réservé à cette heure.',
                action: {
                    label: 'Voir alternatives',
                    onClick: () => console.log('Show alternatives')
                }
            };
        }

        return null;
    };

    const suggestPrice = async (serviceIds: number[]): Promise<SmartSuggestionProps | null> => {
        if (!isAvailable || !config.features.suggestions) {
            return null;
        }

        // TODO: Call AI API for price suggestion
        return {
            type: 'info',
            message: 'Prix recommandé basé sur l\'historique : 120€',
            action: {
                label: 'Appliquer',
                onClick: () => console.log('Apply suggested price')
            }
        };
    };



    return {
        checkBookingConflict,
        suggestPrice
    };
}
