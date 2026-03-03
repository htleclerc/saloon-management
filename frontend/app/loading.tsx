import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] h-full w-full">
            <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
            <p className="text-gray-500 italic animate-pulse">Loading...</p>
        </div>
    );
}
