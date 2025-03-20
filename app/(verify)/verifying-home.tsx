import {View, Text, Image, Modal, Pressable, Alert} from 'react-native'
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {images} from "@/constants";
import CustomButton from "@/components/CustomButton";
import CustomModal from "@/components/CustomModal";
import {useRouter} from "expo-router";
import {signOut} from "@/api/api";

const VerifyingHome = () => {
    const router = useRouter()
    const [modalVisible, setModalVisible] = React.useState(false);

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Sign Out", onPress: async () => {
                        await signOut()
                    }
                }
            ],
            {cancelable: false}
        );
    }
    return (
        <SafeAreaView className="flex h-full bg-white">
            <View className="flex items-center mt-8 justify-center ">
                <Image source={images.verify}/>
                <View className="flex items-center justify-center px-8">
                    <Text className="text-4xl font-JakartaExtraBold text-blue-500">Verify your Identity</Text>
                    <Text className="text-lg mt-8 font-JakartaLight text-center">For a secure experience, we need to
                        verify your
                        identity. Please follow the steps to upload your photo and scan your ID.</Text>
                </View>

            </View>
            <CustomButton title='Start Verification' onPress={
                () => router.push("/(verify)/upload-nic")
            } className='mt-16 py-4'/>

            <CustomButton title='Sign Out' onPress={handleSignOut} className='mt-4 py-4'/>

            <Pressable onPress={() => setModalVisible(true)}>
                <Text className="text-center text-blue-500 mt-5 underline">
                    View Terms & Conditions
                </Text>
            </Pressable>

            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Terms & Conditions"
                content="By using this service, you agree to our Terms and Conditions.
                         Please ensure that all provided information is accurate.
                         Your data will be securely processed in compliance with regulations."
            />


        </SafeAreaView>

    )
}
export default VerifyingHome
