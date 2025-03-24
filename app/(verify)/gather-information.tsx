import {View, Text, ScrollView, ActivityIndicator} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import InputField from "@/components/InputField";
import {useUpload} from "@/context/UploadContext";
import CustomButton from "@/components/CustomButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {addDriver} from "@/api/api";

const GatherInformation = () => {

    const [isLoggedIn, setIsLoggedIn] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-grow">
                <View className="flex justify-center  mx-4 mt-10" style={{
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
                            title={submitting ? "Submitting..." : "Submit"}
                            onPress={handleSubmit}
                            className="mt-8 py-4 w-full"
                            disabled={submitting}
                        >
                            {submitting && (
                                <ActivityIndicator
                                    size="small"
                                    color="#ffffff"
                                    style={{marginRight: 8}}
                                />
                            )}
                        </CustomButton>

                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
export default GatherInformation
