import React from 'react';
import {View, Text, ScrollView, Image, TouchableOpacity} from 'react-native';
import {useState, useEffect} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import {useNavigation} from '@react-navigation/native';
import MapView, {Marker} from 'react-native-maps';
import {icons} from "@/constants";
import {router} from "expo-router";
import * as Location from 'expo-location';
import {Alert} from "react-native";
import {LocationObject} from 'expo-location';
import {getStudents, getDriver} from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Student {
    id: number;
    full_name: string;
    grade: string;
    school: string;
    address: string;
    phone: string;
    pickup_location_latitude: string;
    pickup_location_longitude: string;
    dropoff_location_latitude: string;
    dropoff_location_longitude: string;
}

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState<Student[]>([]);
    const [driverData, setDriverData] = useState<any>({});


    const [location, setLocation] = useState<LocationObject | null>(null);

    useEffect(() => {
        (async () => {
            const driverId = await AsyncStorage.getItem('userId');
            if (!driverId) {
                alert('Driver ID not found');
                return;
            }
            try {
                const response = await getStudents(driverId as string);
                if (response.ok && response.data) {
                    setStudentData(response.data);
                    await AsyncStorage.setItem('students', JSON.stringify(response.data));
                } else {
                    alert('Error fetching students');
                }
            } catch (error) {
                alert('Network error');
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to show your current location.');
                return;
            }
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation as any);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const driverId = await AsyncStorage.getItem('userId');
            if (!driverId) {
                alert('Driver ID not found');
                return;
            }
            try {
                const response = await getDriver(driverId as string);
                if (response.ok && response.data) {
                    setDriverData(response.data);
                    await AsyncStorage.setItem('driver', JSON.stringify(response.data));
                } else {
                    alert('Error fetching driver');
                }
            } catch (error) {
                alert('Network error');
            }
        })();
    }, []);


    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-grow min-h-screen"
                        contentContainerStyle={{paddingBottom: 120}} // Add padding to account for tab bar
                        showsVerticalScrollIndicator={false}>
                <View className="flex justify-center mx-4 mt-6">
                    {/* Header Section */}
                    <View className="flex flex-row justify-between items-center">
                        <View>
                            <Text className="text-2xl text-secondary-400 font-JakartaMedium">Welcome back,</Text>
                            <Text className="text-3xl text-primary-900 font-JakartaExtraBold mt-1">{driverData.full_name}</Text>
                        </View>
                        <TouchableOpacity className="rounded-full bg-primary-100 p-3 shadow-sm">
                            <Image
                                source={icons.person}
                                className="w-8 h-8"
                                resizeMode="contain"
                                tintColor="#242b4d"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Quick Actions */}
                    <View className="flex flex-row justify-between mt-8">
                        <TouchableOpacity
                            className="bg-primary-900 rounded-2xl p-4 flex-1 mr-2"
                            onPress={() => router.push("/(root)/attendance")}
                        >
                            <View className="bg-white/20 rounded-full p-2 w-12 h-12 items-center justify-center mb-2">
                                <Image source={icons.attendance} className="w-6 h-6" tintColor="white"/>
                            </View>
                            <Text className="text-white font-JakartaBold text-lg">Mark{"\n"}Attendance</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-primary-900 rounded-2xl p-4 flex-1 ml-2"
                            onPress={() => router.push("/(root)/students")}
                        >
                            <View className="bg-white/20 rounded-full p-2 w-12 h-12 items-center justify-center mb-2">
                                <Image source={icons.school} className="w-6 h-6" tintColor="white"/>
                            </View>
                            <Text className="text-white font-JakartaBold text-lg">Student{"\n"}Management</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Payment Reminder */}
                    <TouchableOpacity
                        className="bg-primary-900 rounded-2xl mt-6 p-4"
                        onPress={() => router.push("/(root)/payments")}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="bg-white/20 rounded-full p-2 w-12 h-12 items-center justify-center">
                                    <Image source={icons.payment} className="w-6 h-6" tintColor="white"/>
                                </View>
                                <Text className="text-white font-JakartaBold text-lg ml-3">Payment Reminder</Text>
                            </View>
                            <Image source={icons.right} className="w-6 h-6" tintColor="white"/>
                        </View>
                    </TouchableOpacity>

                    {/* Upcoming Trips Card */}
                    <View className="mt-8 bg-white rounded-3xl shadow-md p-4">
                        <View className="flex flex-row justify-between items-center mb-4">
                            <Text className="text-xl text-primary-900 font-JakartaBold">Today's Trip</Text>
                            <TouchableOpacity>
                                <Text className="text-primary-900 font-JakartaMedium">View All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Trip Details */}
                        <View className="bg-primary-100 rounded-2xl p-4">
                            <View className="flex flex-row justify-between items-center">
                                <View className="flex-1">
                                    <View className="flex flex-row items-center">
                                        <View className="bg-primary-900 rounded-full p-2 mr-3">
                                            <Image source={icons.school} className="w-5 h-5" tintColor="white"/>
                                        </View>
                                        <Text className="text-lg text-primary-900 font-JakartaBold">Trip to
                                            School</Text>
                                    </View>
                                    <View className="ml-12">
                                        <Text className="text-secondary-700 font-JakartaMedium mt-1">7:30 AM</Text>
                                        <Text className="text-secondary-500 font-JakartaMedium">5 Students</Text>
                                    </View>
                                </View>
                                <TouchableOpacity className="bg-primary-900 rounded-xl px-4 py-2">
                                    <Text className="text-white font-JakartaBold">Start Trip</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>


                    {/* Map View */}
                    <View className="mt-8 mb-6">
                        <Text className="text-xl text-primary-900 font-JakartaBold mb-4">Route Map</Text>
                        <MapView
                            style={{height: 300, borderRadius: 15}}
                            region={{
                                latitude: location?.coords?.latitude || 6.9271,  // Default to Sri Lanka coordinates
                                longitude: location?.coords?.longitude || 79.8612,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            showsUserLocation={true}
                            followsUserLocation={true}
                        >
                            {location && (
                                <Marker
                                    coordinate={{
                                        latitude: location.coords.latitude,
                                        longitude: location.coords.longitude
                                    }}
                                    title="Your Location"
                                    description="Current location"
                                    pinColor="blue"
                                />
                            )}

                            {studentData.map((student) => (
                                <React.Fragment key={student.id}>
                                    <Marker
                                        coordinate={{
                                            latitude: parseFloat(student.pickup_location_latitude),
                                            longitude: parseFloat(student.pickup_location_longitude)
                                        }}
                                        title={`${student.full_name} - Pickup`}
                                        description={student.school}
                                        pinColor="green"
                                    />
                                    <Marker
                                        coordinate={{
                                            latitude: parseFloat(student.dropoff_location_latitude),
                                            longitude: parseFloat(student.dropoff_location_longitude)
                                        }}
                                        title={`${student.full_name} - Dropoff`}
                                        description={student.school}
                                        pinColor="red"
                                    />
                                </React.Fragment>
                            ))}
                        </MapView>
                    </View>


                    {/* Additional Features */}
                    <View className="mt-8 mb-6">
                        <Text className="text-xl text-primary-900 font-JakartaBold mb-4">Quick Access</Text>
                        <View className="flex flex-row flex-wrap justify-between">
                            {["Route Map", "Students", "Schedule", "Reports"].map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="bg-primary-100 rounded-2xl p-4 mb-3 w-[48%]"
                                >
                                    <Text className="text-primary-900 font-JakartaBold text-lg">{item}</Text>
                                    <Text className="text-secondary-500 font-JakartaMedium mt-1">View details</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

