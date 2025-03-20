import {ButtonProps} from "@/types/type";
import {Text, TouchableOpacity} from "react-native";

const getBgVariantStyle = (variant: ButtonProps['bgVariant']) => {

    switch (variant) {
        case "secondary":
            return "bg-gray-500";
        case "danger":
            return "bg-red-500";
        case "success":
            return "bg-green-500";
        case "outline":
            return "border-neutral-300 border-[0.5px] ";
        default:
            return "bg-[#0286FF]";
    }
}
const getTextVariant = (variant: ButtonProps['textVariant']) => {

    switch (variant) {
        case "primary":
            return "text-black";
        case "secondary":
            return "text-gray-100";
        case "danger":
            return "text-red-100";
        case "success":
            return "text-green-100";
        case "outline":
            return "text-blue-500 ";
        default:
            return "text-white";
    }
}
const CustomButton = ({
                          onPress,
                          title,
                          bgVariant = "primary",
                          textVariant = "default",
                          IconLeft,
                          IconRight,
                          className,
                          ...props
                      }: ButtonProps) => (

    <TouchableOpacity
        onPress={onPress}
        className={`w-10/12 self-center rounded-full flex flex-row
            justify-center items-center shadow-md shadow-neutral-400/70  p-3
            ${getBgVariantStyle(bgVariant)} ${className} `}
        {...props}
    >
        {IconLeft && <IconLeft/>}
        <Text className={`text-lg font-bold  ${getTextVariant(textVariant)}`}>{title}</Text>
        {IconRight && <IconRight/>}
    </TouchableOpacity>
)

export default CustomButton;