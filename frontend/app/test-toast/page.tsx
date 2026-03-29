"use client";

import React from 'react';
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useToast } from "@/context/ToastProvider";

import { useConfirm } from "@/context/ConfirmProvider";

export default function TestToastPage() {
    const { addToast } = useToast();
    const { confirm } = useConfirm();

    const handleConfirmTest = async (type: any) => {
        const result = await confirm({
            title: "Action Requise",
            message: "Êtes-vous sûr de vouloir effectuer cette action ? Cette action est irréversible et aura un impact sur les données.",
            type: type,
            confirmText: "Oui, Continuer",
            cancelText: "Non, Annuler"
        });

        if (result) {
            addToast("Action confirmée et exécutée avec succès !", "success");
        } else {
            addToast("L'action a été annulée.", "info");
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Toast Tests */}
                    <Card className="p-8">
                        <h1 className="text-2xl font-bold mb-6">Notifications Toast</h1>
                        <p className="text-gray-600 mb-8">
                            Feedback premium utilisant le flou de mouvement et la thématisation dynamique.
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            <Button
                                onClick={() => addToast("Succès ! Votre profil est à jour.", "success")}
                                className="bg-[var(--color-success)] hover:bg-[var(--color-success-dark)] text-white"
                            >
                                Success Toast
                            </Button>

                            <Button
                                onClick={() => addToast("Erreur : Connexion perdue.", "error")}
                                className="bg-[var(--color-error)] hover:bg-[var(--color-error-dark)] text-white"
                            >
                                Error Toast
                            </Button>

                            <Button
                                onClick={() => addToast("Avertissement : Stock faible.", "warning")}
                                className="bg-[var(--color-warning)] hover:bg-[var(--color-warning-dark)] text-white"
                            >
                                Warning Toast
                            </Button>
                        </div>
                    </Card>

                    {/* Confirm Tests */}
                    <Card className="p-8">
                        <h1 className="text-2xl font-bold mb-6">Dialogues de Confirmation</h1>
                        <p className="text-gray-600 mb-8">
                            Modales de validation critiques remplaçant les popups navigateurs natifs.
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            <Button
                                onClick={() => handleConfirmTest("warning")}
                                className="bg-[var(--color-warning)] hover:bg-[var(--color-warning-dark)] text-white"
                            >
                                Warning Confirm
                            </Button>

                            <Button
                                onClick={() => handleConfirmTest("error")}
                                className="bg-[var(--color-error)] hover:bg-[var(--color-error-dark)] text-white"
                            >
                                Danger Confirm
                            </Button>

                            <Button
                                onClick={() => handleConfirmTest("success")}
                                className="bg-[var(--color-success)] hover:bg-[var(--color-success-dark)] text-white"
                            >
                                Success Confirm
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
