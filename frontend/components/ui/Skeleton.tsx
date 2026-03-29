interface SkeletonProps {
    className?: string;
    variant?: 'rectangular' | 'circular' | 'text';
}

export default function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
    const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
    const variantClasses = {
        rectangular: 'rounded-xl',
        circular: 'rounded-full',
        text: 'rounded-md',
    };

    return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
}
