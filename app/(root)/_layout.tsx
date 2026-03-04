import {Stack} from 'expo-router';
import React from 'react';
import {UserProvider} from '@/context/UserContext';

const RootLayout = () => {
    return (
        <UserProvider>
        <Stack>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            <Stack.Screen name="attendance" options={{headerShown: false}}/>
            <Stack.Screen name="students" options={{headerShown: false}}/>
            <Stack.Screen name="payments" options={{headerShown: false}}/>
            <Stack.Screen name="student-details" options={{headerShown: false}}/>
            <Stack.Screen name="edit-profile" options={{headerShown: false}}/>
        </Stack>
        </UserProvider>
    );
};

export default RootLayout;
