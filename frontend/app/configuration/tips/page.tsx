"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTips } from "@/context/TipsProvider";
import { useAuth } from "@/context/AuthProvider";
import { TipsDistributionRule } from "@/types";
import { Check, Coins, Users, Building2, PieChart, Wallet } from "lucide-react";
import { useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

const options: { id: TipsDistributionRule; label: string; description: string; icon: any }[] = [
    {
        id: 'EQUAL_WORKERS',
        label: 'Equal to Workers',
        description: 'Tips are split strictly between active workers on the booking. Salon gets 0%.',
        icon: Users
    },
    {
        id: 'EQUAL_ALL',
        label: 'Equal (incl. Salon)',
        description: 'Salon counts as one worker. Split equally among N workers + 1 Salon share.',
        icon: Building2
    },
    {
        id: 'SALON_KEY',
        label: 'Use Sharing Key',
        description: "Apply each worker's sharing key (e.g. 50/50) to their portion of the tips.",
        icon: PieChart
    },
    {
        id: 'CUSTOM_PERCENTAGE',
        label: 'Custom Salon %',
        description: 'Salon takes a fixed percentage off the top, remainder split equally among workers.',
        icon: Check // Placeholder
    },
    {
        id: 'POOL',
        label: 'Common Pool',
        description: '100% of tips go to the Salon/Pool account for later manual distribution.',
        icon: Wallet
    }
];

export default function TipsConfigPage() {
    const { configuration, updateConfiguration } = useTips();
    const { canModify } = useAuth();
    const [salonPct, setSalonPct] = useState(configuration.salonPercentage || 0);
    const { handleReadOnlyClick } = useReadOnlyGuard();

    const handleSave = () => {
        if (handleReadOnlyClick()) return;
        updateConfiguration({ salonPercentage: salonPct });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tips Configuration</h1>
                <p className="text-gray-500 text-sm">Define how tips are distributed among the team</p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <Coins className="w-6 h-6 text-yellow-600" />
                <div className="flex-1">
                    <p className="font-bold text-gray-900">Enable Tips Collection</p>
                    <p className="text-sm text-gray-600">Allow adding tips to income records</p>
                </div>
                <button
                    onClick={() => { if (!handleReadOnlyClick()) updateConfiguration({ isActive: !configuration.isActive }) }}
                    disabled={!canModify}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${configuration.isActive ? 'bg-yellow-500' : 'bg-gray-200'} disabled:opacity-50`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${configuration.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt) => (
                    <div
                        key={opt.id}
                        onClick={() => { if (!handleReadOnlyClick()) updateConfiguration({ rule: opt.id }) }}
                        className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${configuration.rule === opt.id
                            ? 'border-yellow-500 bg-yellow-50/50'
                            : 'border-transparent bg-white shadow-sm hover:shadow-md'
                            } ${!canModify ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {configuration.rule === opt.id && (
                            <div className="absolute top-4 right-4 text-yellow-600">
                                <Check className="w-6 h-6" />
                            </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${configuration.rule === opt.id ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                            <opt.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{opt.label}</h3>
                        <p className="text-sm text-gray-500">{opt.description}</p>

                        {opt.id === 'CUSTOM_PERCENTAGE' && configuration.rule === 'CUSTOM_PERCENTAGE' && (
                            <div className="mt-4 pt-4 border-t border-yellow-200" onClick={e => e.stopPropagation()}>
                                <label className="block text-xs font-bold text-yellow-800 uppercase tracking-widest mb-2">Salon Percentage</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={salonPct}
                                        onChange={(e) => setSalonPct(Number(e.target.value))}
                                        disabled={!canModify}
                                        className="w-full p-2 rounded-lg border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
                                        min={0}
                                        max={100}
                                    />
                                    <Button size="sm" onClick={handleSave} disabled={!canModify} className="bg-yellow-500 hover:bg-yellow-600 text-white border-none disabled:opacity-50">Save</Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Card className="bg-blue-50 border-blue-100">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-blue-600 font-bold">i</div>
                    <div className="text-sm text-blue-800">
                        <p className="font-bold mb-1">How it works</p>
                        <p>Changes to these rules apply immediately for <strong>new</strong> income records. Existing records retain the distribution calculated at the time of creation.</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
