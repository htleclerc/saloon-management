"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

/**
 * AI Configuration
 */
export interface AIConfig {
    enabled: boolean;
    provider: 'gemini' | 'gpt-4' | 'none';
    features: {
        commandAssistant: boolean;
        suggestions: boolean;
        autoComplete: boolean;
        analytics: boolean;
    };
}

/**
 * AI Command Result
 */
export interface AICommandResult {
    action: string;
    confidence: number;
    data: any;
    fallback?: boolean;
}

interface AIContextType {
    config: AIConfig;
    updateConfig: (updates: Partial<AIConfig>) => void;
    executeCommand: (command: string) => Promise<AICommandResult>;
    isAvailable: boolean;
    stats: {
        requests: number;
        cost: number;
    };
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const DEFAULT_CONFIG: AIConfig = {
    enabled: false, // Désactivé par défaut pour sécurité
    provider: 'gemini',
    features: {
        commandAssistant: true,
        suggestions: true,
        autoComplete: false, // Peut coûter cher
        analytics: true
    }
};

/**
 * AIProvider - Manages AI features and configuration
 */
export function AIProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<AIConfig>(() => {
        if (typeof window === 'undefined') return DEFAULT_CONFIG;

        const stored = localStorage.getItem('saloon-ai-config');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return DEFAULT_CONFIG;
            }
        }
        return DEFAULT_CONFIG;
    });

    const [stats, setStats] = useState<{ requests: number; cost: number }>(() => {
        if (typeof window === 'undefined') return { requests: 0, cost: 0 };

        const stored = localStorage.getItem('saloon-ai-stats');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return { requests: 0, cost: 0 };
            }
        }
        return { requests: 0, cost: 0 };
    });

    // Save config to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('saloon-ai-config', JSON.stringify(config));
    }, [config]);

    // Save stats to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('saloon-ai-stats', JSON.stringify(stats));
    }, [stats]);

    const updateConfig = useCallback((updates: Partial<AIConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    }, []);

    const isAvailable = config.enabled && config.provider !== 'none';

    const executeCommand = useCallback(async (command: string): Promise<AICommandResult> => {
        // Vérification 1: AI enabled?
        if (!config.enabled || !config.features.commandAssistant) {
            return {
                action: 'show_form',
                confidence: 0,
                data: {},
                fallback: true
            };
        }

        // Incrémenter stats
        setStats(prev => ({
            requests: prev.requests + 1,
            cost: prev.cost + 0.001 // Estimation $0.001 par requête
        }));

        try {
            // Call AI API
            const response = await fetch('/api/ai/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    command,
                    provider: config.provider
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('AI Command failed:', error);

            // Fallback gracieux
            return {
                action: 'show_form',
                confidence: 0,
                data: {},
                fallback: true
            };
        }
    }, [config]);

    return (
        <AIContext.Provider
            value={{
                config,
                updateConfig,
                executeCommand,
                isAvailable,
                stats
            }}
        >
            {children}
        </AIContext.Provider>
    );
}

/**
 * Hook to use AI features
 */
export function useAI() {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
}
