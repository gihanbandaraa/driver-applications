import {View, Text, Image, Alert, ScrollView, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import * as ImagePicker from 'expo-image-picker';
import {images} from '@/constants';
import CustomModal from "@/components/CustomModal";
import {useUpload} from "@/context/UploadContext";
import {router} from "expo-router";
import {Ionicons} from '@expo/vector-icons';

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
        <View style={{flex: 1, backgroundColor: '#f1f5f9'}}>
            {/* Navy Header */}
            <View style={{backgroundColor: '#242b4d', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center'}}
                    >
                        <Ionicons name="chevron-back" size={22} color="white" />
                    </TouchableOpacity>
                    <View style={{flexDirection: 'row', gap: 6}}>
                        {[1,2,3].map(n => (
                            <View key={n} style={{width: n === 2 ? 28 : 8, height: 8, borderRadius: 4, backgroundColor: n <= 2 ? 'white' : 'rgba(255,255,255,0.3)'}} />
                        ))}
                    </View>
                    <View style={{width: 40}} />
                </View>
                <Text className="text-white font-JakartaExtraBold text-xl">Driving License</Text>
                <Text className="text-white/60 font-JakartaMedium text-sm mt-1">Step 2 of 3 â€” Upload a clear photo of your license</Text>
            </View>

            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{padding: 20, paddingBottom: 40}}
                showsVerticalScrollIndicator={false}
            >
                {/* Upload Zone */}
                <TouchableOpacity
                    onPress={pickImage}
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: 'white', borderRadius: 20, height: 220,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2, borderStyle: 'dashed', borderColor: drivingLicense ? '#242b4d' : '#d1d5db',
                        shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
                        marginBottom: 14,
                    }}
                >
                    {drivingLicense ? (
                        <Image source={{uri: drivingLicense}} style={{width: '100%', height: '100%', borderRadius: 18}} resizeMode="contain" />
                    ) : (
                        <View style={{alignItems: 'center'}}>
                            <View style={{width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(36,43,77,0.07)', alignItems: 'center', justifyContent: 'center', marginBottom: 12}}>
                                <Ionicons name="car-outline" size={32} color="#242b4d" />
                            </View>
                            <Text className="font-JakartaBold text-gray-700">Tap to upload license photo</Text>
                            <Text className="font-JakartaMedium text-gray-400 text-xs mt-1">JPG, PNG â€” max 10MB</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Actions */}
                <TouchableOpacity
                    onPress={openCamera}
                    style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: '#e2e8f0', marginBottom: 10}}
                >
                    <Ionicons name="camera-outline" size={20} color="#242b4d" />
                    <Text className="ml-2 font-JakartaBold text-gray-700">Open Camera</Text>
                </TouchableOpacity>

                {drivingLicense && (
                    <TouchableOpacity
                        onPress={resetImage}
                        style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', borderRadius: 14, paddingVertical: 14, marginBottom: 10}}
                    >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        <Text className="ml-2 font-JakartaBold text-red-500">Remove Photo</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => setModalVisible(true)} style={{alignItems: 'center', marginBottom: 24}}>
                    <Text className="font-JakartaMedium text-primary-900 text-sm underline">View Sample Image</Text>
                </TouchableOpacity>

                {/* Continue */}
                <TouchableOpacity
                    onPress={() => {
                        if (!drivingLicense) {
                            Alert.alert('Image Required', 'Please upload a photo of your driving license to continue.');
                            return;
                        }
                        router.push('/(verify)/upload-selfie');
                    }}
                    style={{backgroundColor: '#242b4d', borderRadius: 16, paddingVertical: 16, alignItems: 'center'}}
                >
                    <Text className="text-white font-JakartaBold text-base">Continue</Text>
                </TouchableOpacity>
            </ScrollView>

            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Sample License"
                image={images.sample_license}
                content="Ensure the entire license is visible without cropping. Use proper lighting and a plain background for best results."
            />
        </View>
    );
};

export default UploadLicense;