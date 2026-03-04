import {View, Text, ScrollView, Modal, Animated, Easing, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity} from 'react-native'
import React, {useEffect, useState, useRef} from 'react'
import InputField from "@/components/InputField";
import {useUpload} from "@/context/UploadContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {addDriver} from "@/api/api";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const GatherInformation = () => {
    // Existing state variables
    const [isLoggedIn, setIsLoggedIn] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Animation values for the loading progress
    const progressAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const uid = await AsyncStorage.getItem('userId');
                const loginStatus = await AsyncStorage.getItem('isLoggedIn');
                const verificationStatus = await AsyncStorage.getItem('verification_status');
                setUserId(uid);
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
        <View style={{flex: 1, backgroundColor: '#f1f5f9'}}>
            {/* Navy Header */}
            <View style={{backgroundColor: '#242b4d', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20}}>
                <Text className="text-white font-JakartaExtraBold text-2xl">Driver Details</Text>
                <Text className="text-white/60 font-JakartaMedium text-sm mt-1">Complete all fields to verify your identity</Text>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{flex: 1}}
            >
            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{padding: 20, paddingBottom: 40}}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2}}>
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

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={submitting}
                            style={{backgroundColor: '#242b4d', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24}}
                        >
                            {submitting ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-JakartaBold text-base">Submit</Text>}
                        </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>

            {/* Loading Modal */}
            <Modal
                visible={submitting}
                transparent={true}
                animationType="fade"
            >
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24}}>
                    <View style={{backgroundColor: 'white', borderRadius: 24, width: '100%', maxWidth: 360, padding: 28, shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10}}>
                        <View style={{alignItems: 'center', marginBottom: 24}}>
                            <Animated.View style={{transform: [{scale: pulseAnim}]}}>
                                <View style={{backgroundColor: 'rgba(36,43,77,0.08)', padding: 18, borderRadius: 50, marginBottom: 12}}>
                                    <MaterialCommunityIcons name="shield-account" size={36} color="#242b4d" />
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
                        <View style={{height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, width: '100%', overflow: 'hidden', marginTop: 8}}>
                            <Animated.View
                                style={{height: '100%', backgroundColor: '#242b4d', borderRadius: 4, width: progressWidth}}
                            />
                        </View>

                        {/* Processing steps */}
                        <View style={{marginTop: 20, gap: 12}}>
                            {[
                                {icon: 'document-text' as const,    label: 'Uploading documents'},
                                {icon: 'shield-checkmark' as const,  label: 'Verifying identity'},
                                {icon: 'save' as const,              label: 'Saving your information'},
                            ].map((s, i) => (
                                <View key={i} style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={{backgroundColor: 'rgba(36,43,77,0.08)', padding: 8, borderRadius: 20}}>
                                        <Ionicons name={s.icon} size={18} color="#242b4d" />
                                    </View>
                                    <Text className="ml-3 text-gray-700 font-JakartaMedium">{s.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default GatherInformation