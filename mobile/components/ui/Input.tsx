import { TextInput, TextInputProps, View, Text } from "react-native";
import { cn } from "../../lib/utils";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export function Input({ className, label, error, ...props }: InputProps) {
    return (
        <View className="mb-4 w-full">
            {label && <Text className="mb-1 text-sm font-medium text-foreground">{label}</Text>}
            <TextInput
                placeholderTextColor="#9ca3af" // muted-foreground
                className={cn(
                    "h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-primary",
                    error && "border-destructive",
                    className
                )}
                {...props}
            />
            {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}
        </View>
    );
}
