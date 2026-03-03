import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Command API Stub
 * 
 * Simulates AI responses for testing without real LLM integration
 */

interface CommandRequest {
    command: string;
    provider?: 'gemini' | 'gpt-4';
}

interface CommandResponse {
    action: string;
    confidence: number;
    data: any;
    fallback?: boolean;
}

/**
 * POST /api/ai/command
 * 
 * Processes natural language commands and returns structured actions
 */
export async function POST(request: NextRequest) {
    try {
        const body: CommandRequest = await request.json();
        const { command } = body;

        if (!command || command.trim().length === 0) {
            return NextResponse.json(
                { error: 'Command is required' },
                { status: 400 }
            );
        }

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Parse command and return structured response
        const response = parseCommand(command);

        return NextResponse.json(response);

    } catch (error) {
        console.error('AI Command error:', error);
        return NextResponse.json(
            { error: 'Failed to process command' },
            { status: 500 }
        );
    }
}

/**
 * Simple command parser (stub logic)
 * 
 * In production, this would call Gemini/GPT-4 API
 */
function parseCommand(command: string): CommandResponse {
    const lowerCommand = command.toLowerCase();

    // Booking creation patterns
    if (
        lowerCommand.includes('créer') &&
        (lowerCommand.includes('rdv') || lowerCommand.includes('rendez-vous') || lowerCommand.includes('réservation'))
    ) {
        return {
            action: 'create_booking',
            confidence: 0.85,
            data: extractBookingData(command)
        };
    }

    // Analytics patterns
    if (
        lowerCommand.includes('affiche') &&
        (lowerCommand.includes('revenu') || lowerCommand.includes('statistique') || lowerCommand.includes('analytics'))
    ) {
        return {
            action: 'show_analytics',
            confidence: 0.90,
            data: {
                period: extractPeriod(lowerCommand)
            }
        };
    }

    // Block time patterns
    if (lowerCommand.includes('bloq') && lowerCommand.includes('journée')) {
        return {
            action: 'block_time',
            confidence: 0.75,
            data: extractBlockTimeData(command)
        };
    }

    // List clients patterns
    if (lowerCommand.includes('liste') && lowerCommand.includes('client')) {
        return {
            action: 'list_clients',
            confidence: 0.80,
            data: {
                filter: extractClientFilter(lowerCommand)
            }
        };
    }

    // Fallback: couldn't understand
    return {
        action: 'show_form',
        confidence: 0.0,
        data: {},
        fallback: true
    };
}

/**
 * Extract booking data from command
 */
function extractBookingData(command: string) {
    const data: any = {};

    // Extract client name (basic pattern matching)
    const clientMatch = command.match(/pour\s+(\w+)/i);
    if (clientMatch) {
        data.clientName = clientMatch[1];
    }

    // Extract date
    if (command.includes('demain')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        data.date = tomorrow.toISOString().split('T')[0];
    } else if (command.includes('aujourd\'hui')) {
        data.date = new Date().toISOString().split('T')[0];
    }

    // Extract time (pattern: 14h, 14h00, 14:00)
    const timeMatch = command.match(/(\d{1,2})(?:h|:)(\d{2})?/i);
    if (timeMatch) {
        const hours = timeMatch[1].padStart(2, '0');
        const minutes = timeMatch[2] || '00';
        data.time = `${hours}:${minutes}`;
    }

    // Extract worker name
    const workerMatch = command.match(/avec\s+(\w+)/i);
    if (workerMatch) {
        data.workerName = workerMatch[1];
    }

    return data;
}

/**
 * Extract time period from command
 */
function extractPeriod(command: string): string {
    if (command.includes('semaine')) return 'week';
    if (command.includes('mois')) return 'month';
    if (command.includes('année')) return 'year';
    if (command.includes('jour')) return 'day';
    return 'month'; // default
}

/**
 * Extract block time data
 */
function extractBlockTimeData(command: string) {
    const data: any = {};

    // Extract day
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    for (const day of days) {
        if (command.toLowerCase().includes(day)) {
            data.day = day;
            break;
        }
    }

    // Extract worker
    const workerMatch = command.match(/pour\s+(\w+)/i);
    if (workerMatch) {
        data.workerName = workerMatch[1];
    }

    return data;
}

/**
 * Extract client filter
 */
function extractClientFilter(command: string): string | undefined {
    if (command.includes('depuis 3 mois')) {
        return 'not_visited_3_months';
    }
    if (command.includes('inactif')) {
        return 'inactive';
    }
    return undefined;
}
