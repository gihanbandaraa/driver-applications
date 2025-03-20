import {View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from 'expo-router';
import {MaterialCommunityIcons, Ionicons, FontAwesome5} from '@expo/vector-icons';
import {signOut} from "@/api/api";

const Profile = () => {
    const [driverData, setDriverData] = useState({
        id: 0,
        user_id: 0,
        full_name: '',
        nic_number: '',
        license_number: '',
        phone_num: '',
        selfie_url: '',
        address: '',
        date_of_birth: '',
        is_verified: 0,
        is_pending: 1
    });

    useEffect(() => {
        loadDriverData().catch(error => console.error('Error loading driver data:', error));
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {day: '2-digit', month: 'short', year: 'numeric'};
        return date.toLocaleDateString('en-US', options);
    };

    const loadDriverData = async () => {
        try {
            const driver = await AsyncStorage.getItem('driver');

            if (driver) {
                setDriverData(JSON.parse(driver));
            }
        } catch (error) {
            console.error('Error loading driver data:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="bg-primary-900 h-96 rounded-b-3xl px-4">
                    <View className="flex-row justify-between items-center mt-12">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={28} color="white"/>
                        </TouchableOpacity>
                        <Text className="text-white text-lg font-JakartaBold">Profile</Text>
                        <TouchableOpacity onPress={() => router.push("/(root)/edit-profile")}>
                            <MaterialCommunityIcons name="pencil" size={24} color="white"/>
                        </TouchableOpacity>
                    </View>

                    <View className="items-center mt-8">
                        <View className="bg-white p-1.5 rounded-full shadow-lg">
                            {driverData.selfie_url ? (
                                <Image
                                    source={{uri: `http://192.168.1.168:3000/${driverData.selfie_url}`}}
                                    resizeMode={'cover'}
                                    className="w-32 h-32 rounded-full"
                                />
                            ) : (
                                <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center">
                                    <FontAwesome5 name="user-alt" size={48} color="#94A3B8"/>
                                </View>
                            )}
                        </View>
                        <Text className="text-white text-2xl font-JakartaBold mt-4">
                            {driverData.full_name}
                        </Text>
                        <View className="bg-white/20 px-6 py-2 rounded-full mt-3">
                            <Text className="text-white font-JakartaMedium text-base">
                                {driverData.is_verified ? '✓ Verified Driver' : '⏳ Pending Verification'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Profile Details */}
                <View className="px-4 -mt-100">
                    <View className="bg-white rounded-3xl p-8 shadow-md">
                        <Text className="text-xl text-primary-900 font-JakartaBold mb-8">
                            Personal Information
                        </Text>

                        <View className="space-y-8">
                            <ProfileItem
                                label="NIC Number"
                                value={driverData.nic_number}
                                icon={<MaterialCommunityIcons name="card-account-details" size={24} color="#1E3A8A"/>}
                            />
                            <ProfileItem
                                label="License Number"
                                value={driverData.license_number}
                                icon={<MaterialCommunityIcons name="license" size={24} color="#1E3A8A"/>}
                            />
                            <ProfileItem
                                label="Phone Number"
                                value={driverData.phone_num}
                                icon={<MaterialCommunityIcons name="phone" size={24} color="#1E3A8A"/>}
                            />
                            <ProfileItem
                                label="Date of Birth"
                                value={formatDate(driverData.date_of_birth)}
                                icon={<MaterialCommunityIcons name="calendar" size={24} color="#1E3A8A"/>}
                            />
                            <ProfileItem
                                label="Address"
                                value={driverData.address}
                                icon={<Ionicons name="location" size={24} color="#1E3A8A"/>}
                            />
                        </View>

                        <TouchableOpacity
                            className="mt-10 flex-row items-center justify-center bg-red-50 p-5 rounded-2xl"
                            onPress={handleLogout}
                        >
                            <MaterialCommunityIcons name="logout" size={24} color="#EF4444"/>
                            <Text className="text-red-500 font-JakartaBold ml-2 text-base">
                                Sign Out
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const ProfileItem = ({label, value, icon}: { label: string, value: string, icon: JSX.Element }) => (
    <View className="flex-row items-center">
        <View className="bg-primary-50 p-3 rounded-full">
            {icon}
        </View>
        <View className="ml-4 flex-1">
            <Text className="text-gray-500 font-JakartaMedium text-sm">{label}</Text>
            <Text className="text-gray-900 font-JakartaBold text-base mt-1">{value}</Text>
        </View>
    </View>
);

export default Profile;