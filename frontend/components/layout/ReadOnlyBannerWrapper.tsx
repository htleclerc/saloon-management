'use client';

import { useAuth } from '@/context/AuthProvider';
import ReadOnlyBanner from './ReadOnlyBanner';

export default function ReadOnlyBannerWrapper() {
    const { isReadOnlyMode, readOnlySalonInfo } = useAuth();

    if (!readOnlySalonInfo) {
        return null;
    }

    return (
        <ReadOnlyBanner
            salonName={readOnlySalonInfo.name}
            ownerName={readOnlySalonInfo.ownerName}
        />
    );
}
