import React from 'react';
import {View, Text, ActivityIndicator, ScrollView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

const STEPS = [
    {label: 'Documents uploaded', done: true},
    {label: 'Identity verification in progress', done: false},
    {label: 'Admin review', done: false},
    {label: 'Account activated', done: false},
];

const PendingVerification = () => {
    return (
        <View style={{flex: 1, backgroundColor: '#f1f5f9'}}>
            {/* Navy Header */}
            <View style={{backgroundColor: '#242b4d', paddingTop: 64, paddingBottom: 36, paddingHorizontal: 24, alignItems: 'center'}}>
                <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16}}>
                    <Ionicons name="time-outline" size={42} color="white" />
                </View>
                <Text className="text-white font-JakartaExtraBold text-2xl text-center">Under Review</Text>
                <Text className="text-white/60 font-JakartaMedium text-sm text-center mt-2" style={{maxWidth: 280}}>
                    Your identity verification is being processed
                </Text>
            </View>

            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{padding: 20, paddingBottom: 40}}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Card */}
                <View style={{backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
                        <ActivityIndicator size="small" color="#242b4d" />
                        <Text className="font-JakartaBold text-gray-900 text-base ml-3">Verification In Progress</Text>
                    </View>
                    <Text className="font-JakartaMedium text-gray-500 text-sm">
                        We're reviewing your submitted documents. This typically takes 24–48 hours. You'll receive a notification when your account is activated.
                    </Text>
                </View>

                {/* Progress Steps */}
                <View style={{backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2}}>
                    <Text className="font-JakartaBold text-gray-900 text-base mb-4">Verification Progress</Text>
                    {STEPS.map((step, idx) => (
                        <View key={idx} style={{flexDirection: 'row', alignItems: 'flex-start', marginBottom: idx < STEPS.length - 1 ? 18 : 0}}>
                            <View style={{alignItems: 'center', marginRight: 14, width: 28}}>
                                <View style={{
                                    width: 28, height: 28, borderRadius: 14,
                                    backgroundColor: step.done ? '#242b4d' : '#e2e8f0',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {step.done
                                        ? <Ionicons name="checkmark" size={15} color="white" />
                                        : <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#94a3b8'}} />
                                    }
                                </View>
                                {idx < STEPS.length - 1 && (
                                    <View style={{width: 2, height: 22, backgroundColor: step.done ? '#242b4d' : '#e2e8f0', marginTop: 3}} />
                                )}
                            </View>
                            <Text
                                className={`font-JakartaMedium text-sm pt-1 ${step.done ? 'text-gray-900' : 'text-gray-400'}`}
                                style={{flex: 1}}
                            >
                                {step.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Info box */}
                <View style={{flexDirection: 'row', marginTop: 16, backgroundColor: 'rgba(36,43,77,0.06)', borderRadius: 14, padding: 14}}>
                    <Ionicons name="information-circle-outline" size={18} color="#242b4d" style={{marginTop: 1}} />
                    <Text className="text-primary-900 font-JakartaMedium text-xs ml-2 flex-1">
                        Once your account is verified you'll be automatically redirected to the driver dashboard.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default PendingVerification;

