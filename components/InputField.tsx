import {InputFieldProps} from "@/types/type";
import React from "react";
import {Image, Text, TextInput, TouchableOpacity, View} from "react-native";

const InputField = React.forwardRef<TextInput, InputFieldProps>((
    {
        labelStyle,
        label,
        placeholder,
        icon,
        rightIcon,
        onRightIconPress,
        secureTextEntry = false,
        containerStyle,
        inputStyle,
        iconStyle,
        className,
        type,
        ...props
    },
    ref
) => (
    <View className="my-2 w-full">
        <Text className={`text-sm font-JakartaSemiBold mb-2 text-gray-600 ${labelStyle ?? ''}`}>
            {label}
        </Text>
        <View className={`flex-row items-center bg-gray-50 rounded-2xl border border-gray-200 ${containerStyle ?? ''}`}>
            {icon && (
                <Image
                    source={icon}
                    className={`w-5 h-5 ml-4 ${iconStyle ?? ''}`}
                    tintColor="#9CA3AF"
                    resizeMode="contain"
                />
            )}
            <TextInput
                ref={ref}
                className={`p-4 font-JakartaMedium text-[15px] flex-1 text-gray-900 ${inputStyle ?? ''}`}
                secureTextEntry={secureTextEntry}
                {...props}
                placeholderTextColor="#9CA3AF"
                placeholder={placeholder}
                keyboardType={type ?? "default"}
            />
            {rightIcon && (
                <TouchableOpacity onPress={onRightIconPress} className="px-4 py-3">
                    <Image
                        source={rightIcon}
                        className="w-5 h-5"
                        tintColor="#9CA3AF"
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            )}
        </View>
    </View>
));

InputField.displayName = 'InputField';

export default InputField;