import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    gradient?: string;
}

export default function Card({ children, className = "", gradient }: CardProps) {
    const baseClasses = "rounded-xl p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl";
    const gradientClasses = gradient || "bg-white";

    return (
        <div className={`${baseClasses} ${gradientClasses} ${className}`}>
            {children}
        </div>
    );
}
