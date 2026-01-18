import { ReactNode, CSSProperties } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    gradient?: string;
    style?: CSSProperties;
}

export default function Card({ children, className = "", gradient, style }: CardProps) {
    const baseClasses = "rounded-xl p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl";
    const gradientClasses = gradient || "bg-white";

    return (
        <div className={`${baseClasses} ${gradientClasses} ${className}`} style={style}>
            {children}
        </div>
    );
}
