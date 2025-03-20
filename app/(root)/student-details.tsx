import React, {memo, useCallback, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Image, Linking, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router, useLocalSearchParams} from 'expo-router';
import {icons} from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, {Marker} from 'react-native-maps';
import {StatusBar} from 'expo-status-bar';
import {getStudents} from '@/api/api';

const {width} = Dimensions.get('window');

const InfoCard = memo(({title, children, action}: {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}) => (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
        <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-JakartaBold text-gray-900">{title}</Text>
            {action}
        </View>
        {children}
    </View>
));

const InfoRow = memo(({label, value}: { label: string; value: string }) => (
    <View className="flex-row justify-between items-center py-2.5 border-b border-gray-100">
        <Text className="text-gray-600 font-JakartaMedium">{label}</Text>
        <Text className="text-gray-900 font-JakartaBold">{value}</Text>
    </View>
));

interface Student {
    id: number;
    full_name: string;
    grade: string;
    school: string;
    address: string;
    parent_name: string;
    phone: string;
    monthly_fee: string;
    pickup_location_latitude: string;
    pickup_location_longitude: string;
    dropoff_location_latitude: string;
    dropoff_location_longitude: string;
}

const StudentDetails = () => {
    const {studentId} = useLocalSearchParams<{ studentId: string }>();
    const [student, setStudent] = useState<Student | null>(null);
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

    const loadStudent = useCallback(async () => {
        if (!studentId) return;

        try {
            const storedStudents = await AsyncStorage.getItem('students');
            if (storedStudents) {
                const students = JSON.parse(storedStudents);
                const currentStudent = students.find((s: Student) =>
                    s.id === parseInt(studentId as string)
                );

                if (currentStudent) {
                    setStudent(currentStudent);
                } else {
                    const driverId = await AsyncStorage.getItem('userId');
                    if (driverId) {
                        const response = await getStudents(driverId);
                        if (response.ok && response.data) {
                            const freshStudents = response.data;
                            await AsyncStorage.setItem('students', JSON.stringify(freshStudents));

                            const freshStudent = freshStudents.find((s: Student) =>
                                s.id === parseInt(studentId as string)
                            );
                            if (freshStudent) {
                                setStudent(freshStudent);
                            } else {
                                alert('Student not found');
                                router.back();
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading student:', error);
            alert('Error loading student details');
            router.back();
        }
    }, [studentId]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                await loadStudent();
            } catch (error) {
                console.error('Error in useEffect:', error);
            }
        };

        fetchData();
    }, [loadStudent]);

    if (!student) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-lg font-JakartaMedium text-secondary-500">Loading student details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const pickupCoords = {
        latitude: parseFloat(student.pickup_location_latitude),
        longitude: parseFloat(student.pickup_location_longitude)
    };

    const dropoffCoords = {
        latitude: parseFloat(student.dropoff_location_latitude),
        longitude: parseFloat(student.dropoff_location_longitude)
    };

    return (
        <SafeAreaView className="flex-1 bg-primary-900">
            <StatusBar style="light"/>
            <ScrollView className="flex-1">
                <View className="bg-primary-900 pt-4 pb-8 px-5">
                    <View className="flex-row items-center justify-between mb-8">
                        <TouchableOpacity onPress={() => router.back()} className="bg-white/10 p-2 rounded-full">
                            <Image source={icons.back} className="w-6 h-6" tintColor="#FFFFFF"/>
                        </TouchableOpacity>
                        <Text className="text-xl text-white font-JakartaBold">Student Profile</Text>
                        <View style={{width: 40}}/>
                    </View>

                    <View className="flex-row items-center">
                        <View className="w-20 h-20 rounded-2xl bg-white items-center justify-center">
                            <Text className="text-primary-900 font-JakartaBold text-3xl">
                                {student.full_name.charAt(0)}
                            </Text>
                        </View>
                        <View className="ml-5 flex-1">
                            <Text className="text-white text-2xl font-JakartaBold leading-tight mb-1">
                                {student.full_name}
                            </Text>
                            <View className="flex-row items-center">
                                <View className="bg-white/20 px-3 py-1 rounded-full">
                                    <Text className="text-white font-JakartaMedium">Grade {student.grade}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="bg-gray-50 rounded-t-3xl -mt-4 px-5 pt-6 min-h-screen">
                    <InfoCard title="School Information">
                        <InfoRow label="School Name" value={student.school}/>
                    </InfoCard>

                    <InfoCard
                        title="Parent Information"
                        action={
                            <TouchableOpacity
                                className="bg-red-50 p-2.5 rounded-full"
                                onPress={() => Linking.openURL(`tel:${student.phone}`)}
                            >
                                <Image source={icons.phone} className="w-5 h-5" tintColor="#EF4444"/>
                            </TouchableOpacity>
                        }
                    >
                        <InfoRow label="Parent Name" value={student.parent_name}/>
                        <InfoRow label="Phone Number" value={student.phone}/>
                        <InfoRow label="Address" value={student.address}/>
                    </InfoCard>

                    <InfoCard
                        title="Location Information"
                        action={
                            <TouchableOpacity
                                onPress={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
                                className="bg-gray-100 p-2 rounded-lg"
                            >
                                <Image source={icons.layers} className="w-5 h-5" tintColor="#374151"/>
                            </TouchableOpacity>
                        }
                    >
                        <View className="rounded-xl overflow-hidden" style={{height: width * 0.5}}>
                            <MapView
                                style={{flex: 1}}
                                mapType={mapType}
                                initialRegion={{
                                    ...pickupCoords,
                                    latitudeDelta: 0.02,
                                    longitudeDelta: 0.02,
                                }}
                            >
                                <Marker
                                    coordinate={pickupCoords}
                                    title="Pickup Point"
                                    description={student.address}
                                >
                                    <View className="bg-primary-900 p-2 rounded-full border-2 border-white">
                                        <View className="w-1 h-1 bg-white rounded-full" />
                                    </View>
                                </Marker>
                                <Marker
                                    coordinate={dropoffCoords}
                                    title="Drop-off Point"
                                >
                                    <View className="bg-red-500 p-2 rounded-full border-2 border-white">
                                        <View className="w-1 h-1 bg-white rounded-full" />
                                    </View>
                                </Marker>
                            </MapView>
                        </View>
                    </InfoCard>

                    <InfoCard title="Payment Information">
                        <View className="bg-green-50 p-4 rounded-xl">
                            <Text className="text-green-600 font-JakartaMedium mb-1">Monthly Fee</Text>
                            <Text className="text-3xl font-JakartaBold text-green-700">
                                Rs. {parseInt(student.monthly_fee).toLocaleString()}
                            </Text>
                        </View>
                    </InfoCard>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default memo(StudentDetails);