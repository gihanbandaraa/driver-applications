import {ButtonProps} from "@/types/type";
import {ActivityIndicator, Text, TouchableOpacity} from "react-native";

const getBgVariantStyle = (variant: ButtonProps['bgVariant']) => {
    switch (variant) {
        case "secondary": return "bg-gray-500";
        case "danger":    return "bg-red-500";
        case "success":   return "bg-green-500";
        case "outline":   return "border border-gray-300 bg-white";
        default:          return "bg-[#242b4d]";
    }
};

const getTextVariant = (variant: ButtonProps['textVariant']) => {
    switch (variant) {
        case "primary":   return "text-black";
        case "secondary": return "text-gray-100";
        case "danger":    return "text-red-100";
        case "success":   return "text-green-100";
        case "outline":   return "text-[#242b4d]";
        default:          return "text-white";
    }
};

const CustomButton = ({
    onPress,
    title,
    bgVariant = "primary",
    textVariant = "default",
    IconLeft,
    IconRight,
    className,
    loading,
    disabled,
    ...props
}: ButtonProps) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={loading || disabled}
        className={`w-10/12 self-center rounded-2xl flex-row justify-center items-center shadow-sm p-4 ${getBgVariantStyle(bgVariant)} ${loading ? 'opacity-70' : ''} ${className ?? ''}`}
        {...props}
    >
        {loading ? (
            <ActivityIndicator color="white" size="small" />
        ) : (
            <>
                {IconLeft && <IconLeft />}
                <Text className={`text-base font-JakartaBold ${getTextVariant(textVariant)}`}>{title}</Text>
                {IconRight && <IconRight />}
            </>
        )}
    </TouchableOpacity>
);

export default CustomButton;