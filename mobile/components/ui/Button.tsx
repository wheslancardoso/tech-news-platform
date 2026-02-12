import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, ViewStyle, TextStyle } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg";
    isLoading?: boolean;
}

const variantStyles: Record<string, ViewStyle> = {
    default: {
        backgroundColor: "#0f172a",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    destructive: {
        backgroundColor: "#ef4444",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    outline: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    ghost: {
        backgroundColor: "transparent",
    },
};

const sizeStyles: Record<string, ViewStyle> = {
    default: { height: 44, paddingHorizontal: 24, paddingVertical: 8 },
    sm: { height: 36, paddingHorizontal: 12, borderRadius: 8 },
    lg: { height: 48, paddingHorizontal: 32, borderRadius: 12 },
};

const textColors: Record<string, string> = {
    default: "#ffffff",
    destructive: "#ffffff",
    outline: "#0f172a",
    ghost: "#0f172a",
};

export function Button({
    children,
    variant = "default",
    size = "default",
    isLoading,
    disabled,
    style,
    ...props
}: ButtonProps) {
    return (
        <TouchableOpacity
            style={[
                {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                },
                variantStyles[variant],
                sizeStyles[size],
                (isLoading || disabled) && { opacity: 0.5 },
                style as ViewStyle,
            ]}
            disabled={isLoading || disabled}
            activeOpacity={0.7}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#0f172a" : "#ffffff"} />
            ) : (
                <Text style={{
                    fontSize: size === "sm" ? 13 : 15,
                    fontWeight: "600",
                    color: textColors[variant],
                }}>
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
}
