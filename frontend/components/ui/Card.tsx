import { ReactNode, CSSProperties, MouseEvent } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    gradient?: string;
    style?: CSSProperties;
    onClick?: (e: MouseEvent) => void;
}

export default function Card({ children, className = "", gradient, style, onClick }: CardProps) {
    const baseClasses = `rounded-xl p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`;
    const gradientClasses = gradient || "bg-white";

    return (
        <div className={`${baseClasses} ${gradientClasses} ${className}`} style={style} onClick={onClick}>
            {children}
        </div>
    );
}
