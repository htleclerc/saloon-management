"use client";

import { useState, useEffect, useCallback } from "react";
import { useAI } from "@/context/AIProvider";
import { X, Sparkles, Loader, AlertCircle } from "lucide-react";
import { useToast } from "@/context/ToastProvider";
import { bookingService, workerService, clientService } from "@/lib/services";

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const { executeCommand, config, isAvailable } = useAI();
    const { addToast } = useToast();
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    // Clear state when closing
    useEffect(() => {
        if (!isOpen) {
            setInput("");
            setResult(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!input.trim()) return;

        // Check if AI is disabled
        if (!isAvailable || !config.features.commandAssistant) {
            addToast('L\'assistant IA est désactivé. Activez-le dans les paramètres.', 'warning');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const commandResult = await executeCommand(input);

            if (commandResult.fallback) {
                addToast('Utilisez le formulaire classique pour continuer.', 'info');
                onClose();
                return;
            }

            setResult(commandResult);

        } catch (error) {
            addToast('Impossible de comprendre la commande. Essayez une formulation différente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const executeAction = async () => {
        if (!result) return;

        try {
            switch (result.action) {
                case 'create_booking':
                    // TODO: Implémenter création booking
                    addToast('La réservation a été créée avec succès', 'success');
                    break;

                case 'show_analytics':
                    // TODO: Naviguer vers analytics
                    addToast('Affichage des analytics...', 'info');
                    break;

                default:
                    addToast(`L'action "${result.action}" n'est pas encore implémentée`, 'warning');
            }

            onClose();
        } catch (error) {
            addToast('Impossible d\'exécuter l\'action', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-start justify-center z-50 pt-[20vh] pointer-events-none">
                <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-2xl pointer-events-auto animate-in zoom-in-95 slide-in-from-top-10 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Assistant IA</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Que voulez-vous faire ? (ex: Créer un rdv pour Sophie demain à 14h)"
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                                autoFocus
                                disabled={loading}
                            />
                            {loading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader className="w-5 h-5 text-purple-500 animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Help text */}
                        {!result && !loading && (
                            <div className="mt-4 text-sm text-gray-600">
                                <p className="font-medium mb-2">Exemples de commandes :</p>
                                <ul className="space-y-1 text-gray-500">
                                    <li>• "Créer un rendez-vous pour Sophie demain à 14h avec Orphelia"</li>
                                    <li>• "Affiche les revenus de cette semaine"</li>
                                    <li>• "Bloque toute la journée de mardi pour Orphelia"</li>
                                    <li>• "Liste mes clients qui n'ont pas visité depuis 3 mois"</li>
                                </ul>
                            </div>
                        )}
                    </form>

                    {/* Result */}
                    {result && !loading && (
                        <div className="px-6 pb-6">
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-purple-900">Action suggérée</h3>
                                        <p className="text-sm text-purple-700 mt-1">
                                            {result.action === 'create_booking' && 'Créer une nouvelle réservation'}
                                            {result.action === 'show_analytics' && 'Afficher les analytics'}
                                            {result.action === 'show_form' && 'Ouvrir le formulaire manuel'}
                                        </p>

                                        {result.data && Object.keys(result.data).length > 0 && (
                                            <div className="mt-3 p-3 bg-white rounded border border-purple-200">
                                                <pre className="text-xs text-gray-700 overflow-auto">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </div>
                                        )}

                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={executeAction}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                                            >
                                                Exécuter
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setResult(null);
                                                    setInput("");
                                                }}
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                                            >
                                                Recommencer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Disabled warning */}
                    {(!isAvailable || !config.features.commandAssistant) && (
                        <div className="px-6 pb-6">
                            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-900">Assistant IA désactivé</p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Activez l'assistant dans les paramètres pour utiliser cette fonctionnalité.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
