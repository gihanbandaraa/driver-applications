import {View, Text, ScrollView, Image, ActivityIndicator} from 'react-native'
import React, {useEffect} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {images, icons} from "@/constants";

const PendingVerification = () => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                <View className="flex-1 min-h-screen">
                    <Image
                        source={images.pending_background}
                        className="w-full h-[400px]"
                        resizeMode="cover"
                    />
                    <View className="flex-1 justify-center items-center -mt-20 mx-4 mb-2 bg-white rounded-3xl p-6"
                          style={{
                              elevation: 5,
                              shadowColor: '#000',
                              shadowOffset: {width: 0, height: 2},
                              shadowOpacity: 0.25,
                              shadowRadius: 3.84
                          }}>

                        <Image
                            source={icons.checkmark}
                            className="w-16 h-16 bg-blue-500 rounded-full p-4 mb-4"
                        />
                        <Text className="text-3xl font-JakartaExtraBold text-blue-500 text-center">
                            Please Be Patient
                        </Text>
                        <Text className="text-3xl mt-2 font-JakartaExtraBold text-blue-500 text-center">
                            Under Review
                        </Text>
                        <ActivityIndicator
                            size="large"
                            color="#3B82F6"
                            style={{marginVertical: 24}}
                        />
                        <Text className="text-center text-gray-600 text-2xl font-Jakarta mb-2">
                            Your account is being verified
                        </Text>
                        <Text className="text-center mt-4 text-gray-500 font-JakartaLight px-4">
                            We're reviewing your submitted information. This process usually takes 24-48 hours.
                            We'll notify you once the verification is complete.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default PendingVerification
