// This empty import makes this file a MODULE, which turns
// `declare module` blocks below into AUGMENTATIONS (merge)
// instead of REPLACEMENTS.
export { };

declare module "react-native" {
    interface ViewProps {
        className?: string;
    }
    interface TextProps {
        className?: string;
    }
    interface TouchableWithoutFeedbackProps {
        className?: string;
    }
    interface ScrollViewProps {
        className?: string;
        contentContainerClassName?: string;
        indicatorClassName?: string;
    }
    interface TextInputProps {
        className?: string;
        placeholderClassName?: string;
    }
    interface SwitchProps {
        className?: string;
    }
    interface ImagePropsBase {
        className?: string;
    }
}

declare module "react-native-safe-area-context" {
    interface NativeSafeAreaViewProps {
        className?: string;
    }
}
