"use client";
export const Button = ({
    label, onClick, className, disabled,
}: {
    label: string;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={className ?? `relative py-2 px-8 text-base font-bold rounded-2xl overflow-hidden bg-white transition-all duration-400 border ${disabled ? "text-gray-600" : "text-black"}`}
    >
        {label}
    </button>
);
