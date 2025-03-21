import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, StatusBar, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { signOut } from "@/api/api";
import { LinearGradient } from 'expo-linear-gradient';

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
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

    const initiateLogout = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            setShowLogoutConfirm(false);
        } catch (error) {
            console.error('Error logging out:', error);
            setShowLogoutConfirm(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content"/>

            {/* App Bar */}
            <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white p-2 rounded-full shadow-sm"
                >
                    <Ionicons name="chevron-back" size={24} color="#1E3A8A"/>
                </TouchableOpacity>
                <Text className="text-xl font-JakartaBold text-gray-800">My Profile</Text>
                <TouchableOpacity
                    onPress={() => router.push("/(root)/edit-profile")}
                    className="bg-white p-2 rounded-full shadow-sm"
                >
                    <MaterialCommunityIcons name="pencil" size={22} color="#1E3A8A"/>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" style={{
                marginBottom: 100,
            }} showsVerticalScrollIndicator={false}>
                {/* Profile Header Section */}
                <View className="items-center mt-6 mb-8 px-4">
                    <View className="shadow-lg">
                        {driverData.selfie_url ? (
                            <Image
                                source={{uri: `http://192.168.1.168:3000/${driverData.selfie_url}`}}
                                className="w-32 h-32 rounded-full border-4 border-white"
                            />
                        ) : (
                            <View
                                className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center border-4 border-white">
                                <FontAwesome5 name="user-alt" size={48} color="#94A3B8"/>
                            </View>
                        )}
                    </View>

                    <Text className="text-2xl font-JakartaExtraBold text-gray-900 mt-4">
                        {driverData.full_name}
                    </Text>

                    <View
                        className={`mt-2 px-4 py-1.5 rounded-full ${driverData.is_verified ? 'bg-green-100' : 'bg-amber-100'}`}>
                        <Text
                            className={`text-sm font-JakartaMedium ${driverData.is_verified ? 'text-green-700' : 'text-amber-700'}`}>
                            {driverData.is_verified ? '✓ Verified Driver' : '⏳ Pending Verification'}
                        </Text>
                    </View>
                </View>

                {/* Info Cards */}
                <View className="px-5 pb-8">
                    {/* Personal Info Card */}
                    <View className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6">
                        <LinearGradient
                            colors={['#1E3A8A10', '#FFFFFF']}
                            className="px-6 pt-6 pb-8"
                        >
                            <View className="flex-row items-center mb-6">
                                <View className="bg-primary-100 p-2.5 rounded-xl">
                                    <MaterialCommunityIcons name="account-details" size={22} color="#1E3A8A"/>
                                </View>
                                <Text className="text-lg font-JakartaBold text-gray-800 ml-3">
                                    Personal Information
                                </Text>
                            </View>

                            <View className="space-y-6">
                                <ProfileItem
                                    label="NIC Number"
                                    value={driverData.nic_number}
                                    icon={<MaterialCommunityIcons name="card-account-details" size={22}
                                                                  color="#1E3A8A"/>}
                                />
                                <ProfileItem
                                    label="License Number"
                                    value={driverData.license_number}
                                    icon={<MaterialCommunityIcons name="license" size={22} color="#1E3A8A"/>}
                                />
                                <ProfileItem
                                    label="Date of Birth"
                                    value={formatDate(driverData.date_of_birth)}
                                    icon={<MaterialCommunityIcons name="calendar" size={22} color="#1E3A8A"/>}
                                />
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Contact Info Card */}
                    <View className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6">
                        <LinearGradient
                            colors={['#1E3A8A10', '#FFFFFF']}
                            className="px-6 pt-6 pb-8"
                        >
                            <View className="flex-row items-center mb-6">
                                <View className="bg-primary-100 p-2.5 rounded-xl">
                                    <MaterialCommunityIcons name="contacts" size={22} color="#1E3A8A"/>
                                </View>
                                <Text className="text-lg font-JakartaBold text-gray-800 ml-3">
                                    Contact Information
                                </Text>
                            </View>

                            <View className="space-y-6">
                                <ProfileItem
                                    label="Phone Number"
                                    value={driverData.phone_num}
                                    icon={<MaterialCommunityIcons name="phone" size={22} color="#1E3A8A"/>}
                                />
                                <ProfileItem
                                    label="Address"
                                    value={driverData.address}
                                    icon={<Ionicons name="location" size={22} color="#1E3A8A"/>}
                                />
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Account Actions */}
                    <View className="mt-4">
                        <TouchableOpacity
                            onPress={initiateLogout}
                            className="flex-row justify-center items-center bg-white border border-red-200 rounded-2xl py-4 px-6"
                        >
                            <MaterialCommunityIcons name="logout" size={22} color="#EF4444"/>
                            <Text className="ml-3 text-red-500 font-JakartaBold">Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Logout Confirmation Modal */}
            <Modal
                visible={showLogoutConfirm}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLogoutConfirm(false)}
            >
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-5">
                    <View className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl">
                        <View className="items-center mb-4">
                            <View className="bg-red-100 p-3 rounded-full mb-3">
                                <MaterialCommunityIcons name="logout" size={28} color="#EF4444" />
                            </View>
                            <Text className="text-xl font-JakartaBold text-gray-800 text-center">
                                Sign Out
                            </Text>
                            <Text className="text-gray-500 font-JakartaMedium mt-2 text-center">
                                Are you sure you want to sign out of your account?
                            </Text>
                        </View>

                        <View className="mt-5 space-y-3">
                            <TouchableOpacity
                                onPress={handleLogout}
                                className="bg-red-500 rounded-xl py-3.5 items-center"
                            >
                                <Text className="text-white font-JakartaBold">Yes, Sign Out</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowLogoutConfirm(false)}
                                className="bg-gray-100 rounded-xl py-3.5 items-center"
                            >
                                <Text className="text-gray-700 font-JakartaBold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const ProfileItem = ({label, value, icon}: { label: string, value: string, icon: JSX.Element }) => (
    <View className="flex-row items-center">
        <View className="bg-gray-100 p-2.5 rounded-xl">
            {icon}
        </View>
        <View className="ml-3 flex-1">
            <Text className="text-gray-500 font-JakartaMedium text-xs">{label.toUpperCase()}</Text>
            <Text className="text-gray-800 font-JakartaSemiBold mt-1">{value || 'Not provided'}</Text>
        </View>
    </View>
);

export default Profile;