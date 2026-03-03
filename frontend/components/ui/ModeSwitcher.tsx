"use client";

import { useDataMode } from "@/context/DataModeProvider";
import { DataMode } from "@/lib/providers/types";
import { Settings } from "lucide-react";
import { useState } from "react";

export default function ModeSwitcher() {
    const { mode, switchMode, isDemo } = useDataMode();
    const [isOpen, setIsOpen] = useState(false);

    const modes: { value: DataMode; label: string; description: string }[] = [
        {
            value: "demo-local",
            label: "💾 Demo Local",
            description: "localStorage (offline, fast)"
        },
        {
            value: "demo-supabase",
            label: "☁️ Demo Cloud",
            description: "Supabase (online, auto-cleanup)"
        },
        {
            value: "normal",
            label: "🚀 Production",
            description: "Go API (full features)"
        }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                title="Data Mode"
            >
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="hidden md:inline font-medium text-gray-700">
                    {modes.find(m => m.value === mode)?.label || mode}
                </span>
                {isDemo && (
                    <span className="hidden lg:inline text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                        DEMO
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2">
                        <div className="px-3 py-2 border-b border-gray-100 mb-2">
                            <h3 className="font-semibold text-gray-900">Data Mode</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Choose your data source</p>
                        </div>

                        {modes.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => {
                                    switchMode(m.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${mode === m.value
                                        ? "bg-purple-50 border-2 border-purple-500"
                                        : "hover:bg-gray-50 border-2 border-transparent"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{m.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
                                    </div>
                                    {mode === m.value && (
                                        <div className="flex-shrink-0 ml-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}

                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 px-3">
                                💡 Switching modes will reload the app
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
