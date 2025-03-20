import {Stack} from 'expo-router';
import {View} from 'react-native';
import React from 'react';

const RootLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="pending-verification" options={{headerShown: false}}/>
        </Stack>

    );
};

export default RootLayout;


