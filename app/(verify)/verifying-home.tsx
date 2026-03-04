import React from 'react';
import {View, Text, TouchableOpacity, Modal, Alert, ScrollView} from 'react-native';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import CustomModal from '@/components/CustomModal';
import {signOut} from '@/api/api';

const STEPS = [
    {icon: 'card-outline' as const,       label: 'Upload NIC',          desc: 'A clear photo of your national ID card'},
    {icon: 'car-outline' as const,        label: 'Upload Driving License', desc: 'Front of your valid driving license'},
    {icon: 'camera-outline' as const,     label: 'Take a Selfie',       desc: 'A real-time photo for face verification'},
    {icon: 'document-text-outline' as const, label: 'Submit Details',   desc: 'Enter your personal information'},
];

const VerifyingHome = () => {
    const router = useRouter();
    const [modalVisible, setModalVisible] = React.useState(false);

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); }},
        ]);
    };

    return (
        <View style={{flex: 1, backgroundColor: '#f1f5f9'}}>
            {/* Navy Header */}
            <View style={{backgroundColor: '#242b4d', paddingTop: 64, paddingBottom: 36, paddingHorizontal: 24, alignItems: 'center'}}>
                <View style={{width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 14}}>
                    <Ionicons name="shield-checkmark-outline" size={36} color="white" />
                </View>
                <Text className="text-white font-JakartaExtraBold text-2xl text-center">Identity Verification</Text>
                <Text className="text-white/60 font-JakartaMedium text-sm text-center mt-2" style={{maxWidth: 280}}>
                    Complete the steps below to start transporting students safely.
                </Text>
            </View>

            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{padding: 20, paddingBottom: 40}}
                showsVerticalScrollIndicator={false}
            >
                {/* Steps Card */}
                <View style={{backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 20}}>
                    <Text className="text-gray-900 font-JakartaBold text-base mb-4">Verification Steps</Text>
                    {STEPS.map((step, idx) => (
                        <View key={idx} style={{flexDirection: 'row', alignItems: 'flex-start', marginBottom: idx < STEPS.length - 1 ? 18 : 0}}>
                            {/* Step number + connector */}
                            <View style={{alignItems: 'center', marginRight: 14, width: 36}}>
                                <View style={{width: 36, height: 36, borderRadius: 18, backgroundColor: '#242b4d', alignItems: 'center', justifyContent: 'center'}}>
                                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 14}}>{idx + 1}</Text>
                                </View>
                                {idx < STEPS.length - 1 && (
                                    <View style={{width: 2, height: 28, backgroundColor: '#e2e8f0', marginTop: 4}} />
                                )}
                            </View>
                            <View style={{flex: 1, paddingTop: 6}}>
                                <Text className="font-JakartaBold text-gray-900 text-sm">{step.label}</Text>
                                <Text className="font-JakartaMedium text-gray-500 text-xs mt-0.5">{step.desc}</Text>
                            </View>
                            <Ionicons name={step.icon} size={20} color="#242b4d" style={{marginTop: 6}} />
                        </View>
                    ))}
                </View>

                {/* Start Verification */}
                <TouchableOpacity
                    onPress={() => router.push('/(verify)/upload-nic')}
                    style={{backgroundColor: '#242b4d', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12}}
                >
                    <Text className="text-white font-JakartaBold text-base">Start Verification</Text>
                </TouchableOpacity>

                {/* Sign Out */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    style={{backgroundColor: 'white', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0', marginBottom: 16}}
                >
                    <Text className="text-gray-700 font-JakartaBold text-base">Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text className="text-center font-JakartaMedium text-primary-900 underline text-sm">View Terms &amp; Conditions</Text>
                </TouchableOpacity>
            </ScrollView>

            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Terms & Conditions"
                content="By using this service, you agree to our Terms and Conditions. Please ensure that all provided information is accurate. Your data will be securely processed in compliance with regulations."
            />
        </View>
    );
};

export default VerifyingHome;

