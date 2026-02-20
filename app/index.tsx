import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {Redirect} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getVerificationStatus} from "@/api/api";

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const loginStatus = await AsyncStorage.getItem('isLoggedIn');
                if (loginStatus === 'true') {
                    await getVerificationStatus();
                }
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

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff"/>;
    }
    if (isLoggedIn === 'false' || isLoggedIn === null) {
        return <Redirect href="/(auth)/welcome"/>;
    }
    if (isLoggedIn === 'true') {
        if (verificationStatus === 'not_verified') {
            return <Redirect href="/(verify)/verifying-home"/>;
        }
        if (verificationStatus === 'pending' || verificationStatus === 'auto_approved' || verificationStatus === 'auto_disapproved') {
            return <Redirect href="/(pending)/pending-verification"/>;
        }
        if (verificationStatus === 'verified') {
            return <Redirect href="/(root)/(tabs)/home"/>;
        }
    }
    return null;
};

export default Home;
