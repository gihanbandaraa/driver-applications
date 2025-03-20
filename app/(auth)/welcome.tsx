import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import Swiper from "react-native-swiper";
import { useRef, useState } from "react";
import { onboarding } from "@/constants";
import CustomButton from "@/components/CustomButton";


const Onboarding = () => {

    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const isLastSlide = activeIndex === onboarding.length - 1;
    return (
        <SafeAreaView className="flex h-full items-center justify-between bg-white">

            <Swiper ref={swiperRef}
                loop={false}
                dot={<View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />}
                activeDot={<View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />}
                onIndexChanged={(index) => setActiveIndex(index)}
            >
                {onboarding.map((item) => (
                    <View key={item.id} className="flex items-center justify-center relative ">
                        <TouchableOpacity
                            className="absolute top-3 right-2 z-10 py-2 px-3  bg-gray-100 rounded-lg"
                            onPress={() => router.replace("/(auth)/sign-up")}
                        >
                            <Text className="text-blue-500 font-JakartaBold text-lg">Skip</Text>
                        </TouchableOpacity>
                        <Image
                            source={item.image}
                            className="w-full "
                            resizeMode="cover"
                        />
                        <View className="flex flex-row items-center justify-center w-full mt-10">
                            <Text className="text-[#3B82F6] text-4xl font-extrabold mx-10 text-center">{item.title}</Text>
                        </View>
                        <Text className="text-[#858585] text-lg font-JakartaSemiBold text-center mt-3 mx-10">{item.description}</Text>
                    </View>
                ))}
            </Swiper>
            <CustomButton
                title={isLastSlide ? "Login" : "Next"}
                className="w-11/12 my-6 py-4  text-white font-JakartaBold "
                onPress={() => isLastSlide ?
                    router.replace("/(auth)/sign-in") :
                    swiperRef.current?.scrollBy(1)}
            />
        </SafeAreaView>
    )
}

export default Onboarding