"use client";

import { useState, useEffect } from "react";
import CommandPalette from "@/components/ai/CommandPalette";

/**
 * Global keyboard shortcut handler for Command Palette (Cmd/Ctrl+K)
 */
export default function CommandPaletteProvider() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <CommandPalette
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
        />
    );
}
