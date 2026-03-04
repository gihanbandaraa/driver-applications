import React from 'react';
import {Text, ScrollView, Image, TouchableOpacity, View} from 'react-native';
import {useState, useEffect} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import { Platform } from 'react-native';
let MapView: any;
let Marker: any;
if (Platform.OS !== 'web') {
    const maps = require('react-native-maps');
    MapView = maps.default ?? maps.MapView ?? maps;
    Marker = maps.Marker ?? (maps.default && maps.default.Marker);
} else {
    MapView = (props: any) => <View {...props} />;
    Marker = (props: any) => <View {...props} />;
}
import {icons} from "@/constants";
import {router} from "expo-router";
import * as Location from 'expo-location';
import {Alert} from "react-native";
import {LocationObject} from 'expo-location';
import {getStudents, getDriver} from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useUser} from "@/context/UserContext";
import {Ionicons} from '@expo/vector-icons';

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
    const {userId} = useUser();
    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState<Student[]>([]);
    const [driverData, setDriverData] = useState<any>({});
    const [location, setLocation] = useState<LocationObject | null>(null);

    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                const [studentsRes, driverRes] = await Promise.all([
                    getStudents(userId),
                    getDriver(userId),
                ]);
                if (studentsRes.ok && studentsRes.data) {
                    setStudentData(studentsRes.data);
                    await AsyncStorage.setItem('students', JSON.stringify(studentsRes.data));
                }
                if (driverRes.ok && driverRes.data) {
                    setDriverData(driverRes.data);
                    await AsyncStorage.setItem('driver', JSON.stringify(driverRes.data));
                }
            } catch (error) {
                Alert.alert('Network Error', 'Unable to load data');
            }
        })();
    }, [userId]);

    useEffect(() => {
        (async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation as any);
        })();
    }, []);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'});

    const quickActions = [
        {label: 'Attendance', sub: 'Mark today', icon: 'checkbox-outline', route: '/(root)/attendance', color: '#4ade80'},
        {label: 'Students', sub: 'Manage list', icon: 'people-outline', route: '/(root)/students', color: '#60a5fa'},
        {label: 'Payments', sub: 'View records', icon: 'card-outline', route: '/(root)/payments', color: '#f59e0b'},
        {label: 'Trips', sub: 'View history', icon: 'map-outline', route: '/(root)/(tabs)/trips', color: '#a78bfa'},
    ];

    return (
        <View className="flex-1" style={{backgroundColor: '#f1f5f9'}}>
            {/* Navy Header */}
            <View style={{backgroundColor: '#242b4d', paddingBottom: 32, paddingTop: 56, paddingHorizontal: 20}}>
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-white/70 font-JakartaMedium text-sm">{dateStr}</Text>
                        <Text className="text-white font-JakartaExtraBold text-2xl mt-1">
                            {driverData.full_name ? `Hello, ${driverData.full_name.split(' ')[0]}` : 'Welcome Back'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(root)/(tabs)/profile')}
                        style={{marginLeft: 12}}
                    >
                        {driverData.selfie_url ? (
                            <Image
                                source={{uri: `${process.env.EXPO_PUBLIC_API_URL}/${driverData.selfie_url}`}}
                                style={{width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)'}}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={{width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)'}}>
                                <Ionicons name="person" size={26} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Stats Strip */}
                <View className="flex-row mt-5" style={{gap: 10}}>
                    <View style={{flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14}}>
                        <Ionicons name="people-outline" size={20} color="rgba(255,255,255,0.7)" />
                        <Text className="text-white font-JakartaBold text-xl mt-1">{studentData.length}</Text>
                        <Text className="text-white/60 font-JakartaMedium text-xs">Students</Text>
                    </View>
                    <View style={{flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14}}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="rgba(255,255,255,0.7)" />
                        <Text className="text-white font-JakartaBold text-xl mt-1">Today</Text>
                        <Text className="text-white/60 font-JakartaMedium text-xs">Active Day</Text>
                    </View>
                    <View style={{flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14}}>
                        <Ionicons name="location-outline" size={20} color="rgba(255,255,255,0.7)" />
                        <Text className="text-white font-JakartaBold text-xl mt-1">{location ? 'Live' : '--'}</Text>
                        <Text className="text-white/60 font-JakartaMedium text-xs">GPS</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={{flex: 1, marginTop: -16}}
                contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 90}}
                showsVerticalScrollIndicator={false}
            >
                {/* Today's Trip Card */}
                <View style={{backgroundColor: 'white', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3}}>
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-primary-900 font-JakartaBold text-lg">Today's Trip</Text>
                        <TouchableOpacity onPress={() => router.push('/(root)/(tabs)/trips')}>
                        <Text className="text-sm font-JakartaMedium" style={{color: '#242b4d'}}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{backgroundColor: '#f1f5f9', borderRadius: 14, padding: 14}}>
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center flex-1">
                                <View style={{backgroundColor: '#242b4d', borderRadius: 12, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 12}}>
                                    <Ionicons name="bus-outline" size={22} color="white" />
                                </View>
                                <View>
                                    <Text className="text-primary-900 font-JakartaBold text-base">School Route</Text>
                                    <Text className="text-gray-500 font-JakartaMedium text-sm">{studentData.length} students assigned</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/(root)/attendance')}
                                style={{backgroundColor: '#242b4d', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12}}
                            >
                                <Text className="text-white font-JakartaBold text-sm">Start</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Quick Actions Grid */}
                <Text className="text-gray-900 font-JakartaBold text-base mb-3 mt-2">Quick Actions</Text>
                <View className="flex-row flex-wrap" style={{gap: 10, marginBottom: 16}}>
                    {quickActions.map((action, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => router.push(action.route as any)}
                            style={{width: '48%', backgroundColor: 'white', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2}}
                        >
                            <View style={{backgroundColor: `${action.color}20`, borderRadius: 12, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 10}}>
                                <Ionicons name={action.icon as any} size={22} color={action.color} />
                            </View>
                            <Text className="text-gray-900 font-JakartaBold">{action.label}</Text>
                            <Text className="text-gray-400 font-JakartaMedium text-xs mt-0.5">{action.sub}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Map */}
                <Text className="text-gray-900 font-JakartaBold text-base mb-3">Route Map</Text>
                <View style={{borderRadius: 20, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3}}>
                    <MapView
                        style={{height: 260}}
                        region={{
                            latitude: location?.coords?.latitude || 6.9271,
                            longitude: location?.coords?.longitude || 79.8612,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        showsUserLocation={true}
                        followsUserLocation={true}
                    >
                        {studentData.map((student) => (
                            <React.Fragment key={student.id}>
                                <Marker
                                    coordinate={{latitude: parseFloat(student.pickup_location_latitude), longitude: parseFloat(student.pickup_location_longitude)}}
                                    title={`${student.full_name} - Pickup`}
                                    pinColor="green"
                                />
                                <Marker
                                    coordinate={{latitude: parseFloat(student.dropoff_location_latitude), longitude: parseFloat(student.dropoff_location_longitude)}}
                                    title={`${student.full_name} - Dropoff`}
                                    pinColor="red"
                                />
                            </React.Fragment>
                        ))}
                    </MapView>
                </View>
            </ScrollView>
        </View>
    );
};
