import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar, Modal, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { signOut, updateDriverSelfie } from "@/api/api";
import { useUser } from "@/context/UserContext";
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
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const {userId} = useUser();

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

    const handleChangePhoto = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (result.canceled || !result.assets?.length) return;
        const imageUri = result.assets[0].uri;
        setUploadingPhoto(true);
        try {
            const res = await updateDriverSelfie(userId!, imageUri);
            if (res.ok) {
                const newUrl = res.data.selfie_url;
                const updated = {...driverData, selfie_url: newUrl};
                setDriverData(updated);
                await AsyncStorage.setItem('driver', JSON.stringify(updated));
                Alert.alert('Success', 'Profile photo updated!');
            } else {
                Alert.alert('Error', 'Failed to update photo. Please try again.');
            }
        } finally {
            setUploadingPhoto(false);
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
        <SafeAreaView className="flex-1" style={{backgroundColor: '#f1f5f9'}}>
            <StatusBar barStyle="light-content"/>

            {/* App Bar */}
            <View style={{backgroundColor: '#242b4d', paddingTop: 8, paddingBottom: 24, paddingHorizontal: 20}}>
                <View className="flex-row justify-between items-center">
                    <Text className="text-xl font-JakartaBold text-white">My Profile</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(root)/edit-profile')}
                        style={{backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 20}}
                    >
                        <MaterialCommunityIcons name="pencil" size={20} color="white"/>
                    </TouchableOpacity>
                </View>

                {/* Avatar */}
                <View className="items-center mt-5">
                    <TouchableOpacity onPress={handleChangePhoto} disabled={uploadingPhoto}
                        style={{shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8}}>
                        {driverData.selfie_url ? (
                            <Image
                                source={{uri: `${process.env.EXPO_PUBLIC_API_URL}/${driverData.selfie_url}`}}
                                style={{width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)'}}
                            />
                        ) : (
                            <View style={{width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)'}}>
                                <FontAwesome5 name="user-alt" size={38} color="rgba(255,255,255,0.7)"/>
                            </View>
                        )}
                        {/* Camera overlay */}
                        <View style={{position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4ade80', borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#242b4d'}}>
                            {uploadingPhoto
                                ? <ActivityIndicator size="small" color="#242b4d" />
                                : <Ionicons name="camera" size={14} color="#242b4d" />}
                        </View>
                    </TouchableOpacity>
                    <Text className="text-white font-JakartaExtraBold text-xl mt-3">{driverData.full_name}</Text>
                    <View style={{marginTop: 6, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, backgroundColor: driverData.is_verified ? 'rgba(74,222,128,0.2)' : 'rgba(251,191,36,0.2)'}}>
                        <Text style={{fontSize: 12, fontFamily: 'Jakarta-Medium', color: driverData.is_verified ? '#4ade80' : '#fbbf24'}}>
                            {driverData.is_verified ? '✓ Verified Driver' : '⏳ Pending Verification'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" style={{
                marginBottom: 100,
            }} showsVerticalScrollIndicator={false}>
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
                                className="bg-gray-100 rounded-xl py-3.5 mt-4 items-center"
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
    <View className="flex-row items-center mt-2">
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