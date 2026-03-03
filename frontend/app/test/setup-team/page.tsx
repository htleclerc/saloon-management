"use client";

import { useState } from "react";
import { workerService } from "@/lib/services";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";

export default function SetupTeamPage() {
    const [status, setStatus] = useState<string>("Ready");
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const initializeTeam = async () => {
        setStatus("Running...");
        setLogs([]);
        try {
            // Workers to add
            const workers = [
                { name: "Alice Worker", email: "alice@test.com", phone: "0601010101", sharingKey: 50, color: "#8B5CF6", salonId: 1 },
                { name: "Bob Colorist", email: "bob@test.com", phone: "0602020202", sharingKey: 45, color: "#EC4899", salonId: 1 },
                { name: "Charlie Junior", email: "charlie@test.com", phone: "0603030303", sharingKey: 30, color: "#10B981", salonId: 1 }
            ];

            addLog(`Starting creation of ${workers.length} workers...`);

            for (const w of workers) {
                // Check if exists (mock check by name for now as email check might be strict)
                const all = await workerService.getAll(1);
                const exists = all.find(existing => existing.name === w.name);

                if (exists) {
                    addLog(`Skipping ${w.name} (already exists)`);
                    continue;
                }

                await workerService.create({
                    ...w as any,
                    status: 'Active',
                    isActive: true,
                    specialties: []
                });
                addLog(`Created ${w.name}`);
            }

            setStatus("Done! Team initialized.");
            addLog("Navigate to Dashboard to verify stats.");

        } catch (error) {
            console.error(error);
            setStatus("Error: " + (error instanceof Error ? error.message : String(error)));
            addLog("Failed to complete initialization.");
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Test Data Setup</h1>
            <Card className="p-6 space-y-4">
                <h2 className="font-semibold">Initialize Team for Phase 2 Verification</h2>
                <p>This will add 3 test workers to the LocalStorage.</p>
                <Button onClick={initializeTeam} disabled={status === "Running..."}>
                    {status === "Running..." ? "Please wait..." : "Add 3 Test Workers"}
                </Button>

                <div className="pt-4 border-t mt-4">
                    <p className="font-mono text-sm mb-2">Status: <span className="font-bold">{status}</span></p>
                    <div className="bg-gray-100 p-4 rounded text-xs font-mono h-40 overflow-auto">
                        {logs.length === 0 ? "Logs will appear here..." : logs.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Link href="/team" className="text-blue-600 underline">Go to Team List</Link>
                    <Link href="/" className="text-blue-600 underline">Go to Dashboard</Link>
                </div>
            </Card>
        </div>
    );
}
