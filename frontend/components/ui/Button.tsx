import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

export default function Button({
    children,
    onClick,
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    type = "button",
}: ButtonProps) {
    const baseClasses = "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2";

    const variantClasses = {
        primary: "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md",
        secondary: "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-md",
        outline: "border-2 border-purple-600 text-purple-600 hover:bg-purple-50",
        danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md",
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-7 py-3.5 text-lg",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            {children}
        </button>
    );
}
