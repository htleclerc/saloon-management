import { getCurrentProvider } from '@/lib/providers/types';

export const tokenService = {
    /**
     * Create a new one-time token
     */
    createToken: async (type: string, payload: any, expiresInMinutes: number = 60): Promise<string | null> => {
        return getCurrentProvider().createOneTimeToken(type, payload, expiresInMinutes);
    },

    /**
     * Consume a token (mark as used)
     * Returns payload if valid and unused, null otherwise
     */
    consumeToken: async (tokenId: string): Promise<any | null> => {
        return getCurrentProvider().consumeOneTimeToken(tokenId);
    }
};
