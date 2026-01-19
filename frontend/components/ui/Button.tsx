import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "outline" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    title?: string;
}

export default function Button({
    children,
    onClick,
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    type = "button",
    title,
}: ButtonProps) {
    const baseClasses = "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2";

    const variantClasses = {
        primary: "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] text-white hover:opacity-90 shadow-md",
        secondary: "bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary)] text-white hover:opacity-90 shadow-md",
        outline: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]",
        danger: "bg-[var(--color-error)] text-white hover:opacity-90 shadow-md",
        success: "bg-[var(--color-success)] text-white hover:opacity-90 shadow-md",
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
            title={title}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            {children}
        </button>
    );
}
