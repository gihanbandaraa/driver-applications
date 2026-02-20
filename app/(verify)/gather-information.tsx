import {View, Text, ScrollView, Modal, Animated, Easing} from 'react-native'
import React, {useEffect, useState, useRef} from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import InputField from "@/components/InputField";
import {useUpload} from "@/context/UploadContext";
import CustomButton from "@/components/CustomButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {addDriver} from "@/api/api";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const GatherInformation = () => {
    // Existing state variables
    const [isLoggedIn, setIsLoggedIn] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Animation values for the loading progress
    const progressAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const loginStatus = await AsyncStorage.getItem('isLoggedIn');
                const verificationStatus = await AsyncStorage.getItem('verification_status');
                setIsLoggedIn(loginStatus);
                setVerificationStatus(verificationStatus);
                setLoading(false);
            } catch (error) {
                console.error('AsyncStorage error:', error);
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Animate progress bar when submitting
    useEffect(() => {
        if (submitting) {
            // Reset progress animation
            progressAnim.setValue(0);

            // Animate progress
            Animated.timing(progressAnim, {
                toValue: 100,
                duration: 3000,
                useNativeDriver: false,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }).start();

            // Pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [submitting]);

    const {nationalID, drivingLicense, selfie} = useUpload();
    const [fullName, setFullName] = useState('');
    const [nic, setNic] = useState('');
    const [licenceNumber, setLicenceNumber] = useState('');
    const [address, setAddress] = useState('');
    const [dob, setDob] = useState('');
    const [phoneNum, setPhoneNum] = useState('');
    const nicUri = nationalID as string
    const selfieUri = selfie as string
    const licenseUri = drivingLicense as string

    const isValidDate = (dateString: string) => {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(dateString)) return false;

        const [day, month, year] = dateString.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    };

    async function handleSubmit() {
        if (!fullName || !nic || !licenceNumber || !address || !dob || !phoneNum) {
            alert("Please fill all the fields")
            return
        }

        if (!isValidDate(dob)) {
            alert("Please enter a valid date of birth in the format DD/MM/YYYY");
            return;
        }
        try {
            setSubmitting(true);
            const userId = await AsyncStorage.getItem('userId') as string;
            await addDriver(
                userId,
                fullName,
                nic,
                licenceNumber,
                phoneNum,
                address,
                dob,
                selfieUri,
                nicUri,
                licenseUri
            )
        } catch (error) {
            console.error('Error submitting driver information:', error);
            alert("Failed to submit information. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-grow">
                <View className="flex justify-center mx-4 mt-10" style={{
                    marginBottom: 12,
                }}>
                    <Text className="text-4xl font-JakartaExtraBold text-blue-500">Verify Your Identity</Text>
                    <Text className="text-lg font-JakartaLight mt-4">Enter the required details to complete your
                        verification securely.</Text>
                    <View className="flex mt-8 mx-2">
                        <InputField label={"Full Name"} placeholder={"Enter your full name"}
                                    value={fullName} onChangeText={setFullName}
                        />
                        <InputField label={"National ID Number"} placeholder={"Enter your national ID number"}
                                    value={nic} onChangeText={setNic}
                        />
                        <InputField label={"Driving Licence Number"} placeholder={"Enter your driving licence number"}
                                    value={licenceNumber} onChangeText={setLicenceNumber}
                        />
                        <InputField label={"Phone Number"} placeholder={"Enter your phone number"}
                                    value={phoneNum} onChangeText={setPhoneNum} type={"numeric"}
                        />
                        <InputField label={"Date of Birth"} placeholder={"DD/MM/YYYY"}
                                    value={dob} onChangeText={setDob}
                        />
                        <InputField label={"Address"} placeholder={"Enter your address"}
                                    value={address} onChangeText={setAddress}/>

                        <CustomButton
                            title="Submit"
                            onPress={handleSubmit}
                            className="mt-8 py-4 w-full"
                            disabled={submitting}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Loading Modal */}
            <Modal
                visible={submitting}
                transparent={true}
                animationType="fade"
            >
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-6">
                    <View className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl">
                        <View className="items-center mb-6">
                            <Animated.View style={{transform: [{scale: pulseAnim}]}}>
                                <View className="bg-blue-100 p-4 rounded-full mb-3">
                                    <MaterialCommunityIcons name="shield-account" size={36} color="#1E3A8A" />
                                </View>
                            </Animated.View>

                            <Text className="text-xl font-JakartaBold text-gray-800 text-center">
                                Verifying Your Information
                            </Text>

                            <Text className="text-gray-500 font-JakartaMedium mt-2 text-center">
                                Please wait while we process your details
                            </Text>
                        </View>

                        {/* Progress bar container */}
                        <View className="h-2 bg-gray-200 rounded-full w-full overflow-hidden mt-2">
                            <Animated.View
                                className="h-full bg-blue-600 rounded-full"
                                style={{width: progressWidth}}
                            />
                        </View>

                        {/* Processing steps */}
                        <View className="mt-8 space-y-3">
                            <View className="flex-row items-center">
                                <View className="bg-blue-100 p-2 rounded-full">
                                    <Ionicons name="document-text" size={18} color="#1E3A8A" />
                                </View>
                                <Text className="ml-3 text-gray-700 font-JakartaMedium">
                                    Uploading documents
                                </Text>
                            </View>

                            <View className="flex-row items-center mt-2">
                                <View className="bg-blue-100 p-2 rounded-full">
                                    <Ionicons name="shield-checkmark" size={18} color="#1E3A8A" />
                                </View>
                                <Text className="ml-3 text-gray-700 font-JakartaMedium">
                                    Verifying identity
                                </Text>
                            </View>

                            <View className="flex-row items-center mt-2">
                                <View className="bg-blue-100 p-2 rounded-full">
                                    <Ionicons name="save" size={18} color="#1E3A8A" />
                                </View>
                                <Text className="ml-3 text-gray-700 font-JakartaMedium">
                                    Saving your information
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default GatherInformation