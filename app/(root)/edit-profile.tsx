import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '@/components/InputField';
import {useUser} from '@/context/UserContext';
import {updateDriverProfile} from '@/api/api';

const EditProfile = () => {
    const {userId} = useUser();
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem('driver');
                if (raw) {
                    const driver = JSON.parse(raw);
                    setPhone(driver.phone_num ?? '');
                    setAddress(driver.address ?? '');
                }
            } catch (e) {
                console.error('Failed to load driver data', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSave = async () => {
        if (!phone.trim() || !address.trim()) {
            Alert.alert('Validation', 'Phone number and address cannot be empty.');
            return;
        }
        if (!userId) return;
        setSaving(true);
        try {
            const res = await updateDriverProfile(userId, phone.trim(), address.trim());
            if (res.ok) {
                // Persist changes to AsyncStorage
                const raw = await AsyncStorage.getItem('driver');
                if (raw) {
                    const driver = JSON.parse(raw);
                    driver.phone_num = phone.trim();
                    driver.address = address.trim();
                    await AsyncStorage.setItem('driver', JSON.stringify(driver));
                }
                Alert.alert('Success', 'Profile updated successfully.', [
                    {text: 'OK', onPress: () => router.back()},
                ]);
            } else {
                Alert.alert('Error', res.data?.error ?? 'Failed to update profile.');
            }
        } catch (e) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={{flex: 1, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size="large" color="#242b4d" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{flex: 1, backgroundColor: '#f1f5f9'}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Navy Header */}
            <View style={{backgroundColor: '#242b4d', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center'}}
                    >
                        <Ionicons name="chevron-back" size={22} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-JakartaExtraBold text-xl">Edit Profile</Text>
                    <View style={{width: 40}} />
                </View>
                <Text className="text-white/60 font-JakartaMedium text-sm mt-2 text-center">
                    Update your contact details
                </Text>
            </View>

            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{padding: 20, paddingBottom: 60}}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Form Card */}
                <View style={{backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2}}>
                    <Text className="text-gray-900 font-JakartaBold text-base mb-5">Contact Information</Text>

                    <InputField
                        label="Phone Number"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChangeText={setPhone}
                        type="phone-pad"
                        labelStyle="font-JakartaMedium text-sm text-gray-700"
                    />

                    <View style={{marginTop: 16}}>
                        <InputField
                            label="Address"
                            placeholder="Enter your home address"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={3}
                            containerStyle="h-24"
                            labelStyle="font-JakartaMedium text-sm text-gray-700"
                        />
                    </View>
                </View>

                {/* Note */}
                <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 16, backgroundColor: 'rgba(36,43,77,0.06)', borderRadius: 14, padding: 14}}>
                    <Ionicons name="information-circle-outline" size={18} color="#242b4d" style={{marginTop: 1}} />
                    <Text className="text-primary-900 font-JakartaMedium text-xs ml-2 flex-1">
                        Only your phone number and address can be updated. For changes to your name, NIC, or license, please contact support.
                    </Text>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    style={{backgroundColor: '#242b4d', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 28}}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text className="text-white font-JakartaBold text-base">Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EditProfile;

