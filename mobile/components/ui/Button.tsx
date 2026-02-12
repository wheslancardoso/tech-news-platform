import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from "react-native";
import { cn } from "../../lib/utils";

interface ButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg";
    isLoading?: boolean;
    className?: string;
}

export function Button({
    className,
    children,
    variant = "default",
    size = "default",
    isLoading,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "flex-row items-center justify-center rounded-md font-medium transition-opacity";

    const variants = {
        default: "bg-primary shadow-sm",
        destructive: "bg-destructive shadow-sm",
        outline: "border border-input bg-background shadow-sm",
        ghost: "bg-transparent",
    };

    const sizes = {
        default: "h-11 px-8 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8",
    };

    const textColors = {
        default: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        outline: "text-foreground",
        ghost: "text-foreground",
    };

    return (
        <TouchableOpacity
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                (isLoading || disabled) && "opacity-50",
                className
            )}
            disabled={isLoading || disabled}
            activeOpacity={0.7}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#000" : "#FFF"} />
            ) : (
                <Text
                    className={cn(
                        "text-base font-medium",
                        textColors[variant]
                    )}
                >
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
}
