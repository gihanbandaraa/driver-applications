import {View, Text, Image, Alert, ScrollView, TouchableOpacity, Pressable} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';

import * as ImagePicker from 'expo-image-picker';
import {images} from '@/constants';
import CustomModal from "@/components/CustomModal";
import {useUpload} from "@/context/UploadContext";
import {router} from "expo-router";

const UploadLicense = () => {

    const [modalVisible, setModalVisible] = useState(false);
    const {drivingLicense, setDrivingLicense} = useUpload();


    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [3, 2],
                quality: 1,
            });

            if (!result.canceled) {
                setDrivingLicense(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const resetImage = () => {
        setDrivingLicense(null);
    };


    const openCamera = async () => {
        try {
            const {status} = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [3, 2],
                quality: 1,
            });

            if (!result.canceled) {
                setDrivingLicense(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to open camera');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-grow">
                <View className="flex justify-center mt-8" style={{
                    marginBottom: 8,
                }}>

                    <View className="flex mx-4 mt-8 justify-center">
                        <Text className="text-4xl font-JakartaExtraBold" style={{lineHeight: 50}}>
                            Upload a photo of your Driving License Card
                        </Text>
                        <Text className="text-lg mt-8 font-JakartaLight">
                            Regulations require you to upload a driving license.
                            Don't worry, your data will stay safe and private.
                        </Text>
                    </View>

                    <View className="flex items-center justify-center mt-8">
                        <TouchableOpacity
                            onPress={pickImage}
                            style={{
                                width: '90%',
                                maxWidth: 350,
                                borderRadius: 20,
                                height: 300,

                            }}
                            className="w-full aspect-[3/2] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4"
                        >
                            {drivingLicense ? (
                                <Image
                                    source={{uri: drivingLicense}}
                                    style={{
                                        width: '100%',
                                        height: '70%'
                                    }}
                                    className="rounded-lg"
                                    resizeMode="contain"
                                />
                            ) : (
                                <View className="flex items-center justify-center p-4">
                                    <Image
                                        source={images.upload}
                                        className="w-16 h-16 mb-2"
                                        resizeMode="contain"
                                    />
                                    <Text className="text-gray-500 text-center mt-4">
                                        Tap to upload a photo of your Driving License
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <Pressable className='my-4' onPress={() => setModalVisible(true)}>
                            <Text className="text-blue-500 font-JakartaBold">View Sample</Text>
                        </Pressable>

                        <CustomModal
                            visible={modalVisible}
                            onClose={() => setModalVisible(false)}
                            title="Sample Driving License"
                            image={images.sample_license}
                            content="To upload a good image, ensure you have proper lighting to avoid shadows and glare. Make sure the entire ID is visible without any cropping, and hold the camera steady to prevent blurriness. Use a plain background for better clarity, and upload a high-quality image without reflections or any damage."
                        />

                    </View>
                    <View className="flex flex-row justify-center items-center gap-x-3">
                        <View className="flex-1 h-[1px] bg-general-100"/>
                        <Text className="text-lg font-JakartaBold">Or</Text>
                        <View className="flex-1 h-[1px] bg-general-100"/>
                    </View>

                    <CustomButton
                        title="Open Camera & Take Photo"
                        onPress={openCamera}
                        className="mt-8 py-4"
                        bgVariant='outline'
                        textVariant='outline'
                    />


                    {drivingLicense && (
                        <CustomButton
                            title="Reset"
                            onPress={resetImage}
                            bgVariant='danger'
                            className="py-3 mt-3"
                        />
                    )}
                    <CustomButton
                        title="Next"
                        onPress={() => {
                            if (!drivingLicense) {
                                Alert.alert(
                                    "Image Required",
                                    "Please upload a photo of your Driving License Card to continue.",
                                    [
                                        {
                                            text: "Upload Now",
                                            onPress: pickImage,
                                            style: "default",
                                        },
                                        {
                                            text: "Take Photo",
                                            onPress: openCamera,
                                        },
                                        {
                                            text: "Cancel",
                                            style: "cancel",
                                        },
                                    ]
                                );
                                return;
                            }
                            router.push('/upload-selfie');
                        }}
                        className="mt-6 py-4"
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}
export default UploadLicense
