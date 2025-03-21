import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Modal, Image, TextInput, ActivityIndicator} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {icons} from "@/constants";
import {router} from "expo-router";
import InputField from "@/components/InputField";
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import {addStudent, getStudents} from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Linking} from 'react-native';

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

export default function Students() {
    const [modalVisible, setModalVisible] = useState(false);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [currentLocationField, setCurrentLocationField] = useState('');
    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState<Student[]>([]);

    const [parentDetails, setParentDetails] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    const [studentDetails, setStudentDetails] = useState({
        fullName: '',
        grade: '',
        school: '',
        pickupPoint: {
            address: '',
            latitude: 0,
            longitude: 0
        },
        dropoffPoint: {
            address: '',
            latitude: 0,
            longitude: 0
        },
        monthlyFee: ''
    });

    const [currentLocation, setCurrentLocation] = useState({
        latitude: 6.927079,
        longitude: 79.861244,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const getCurrentLocation = async () => {
        let {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access location was denied');
            return;
        }

        try {
            let location = await Location.getCurrentPositionAsync({});
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            };
            setCurrentLocation(newRegion);
        } catch (error) {
            alert('Error getting location');
        }
    };

    const handleLocationSelect = (e: {
        nativeEvent: {
            coordinate: {
                latitude: number;
                longitude: number;
            };
        };
    }) => {
        const {latitude, longitude} = e.nativeEvent.coordinate;
        if (currentLocationField === 'pickup') {
            setStudentDetails({
                ...studentDetails,
                pickupPoint: {
                    ...studentDetails.pickupPoint,
                    latitude,
                    longitude
                }
            });
        } else {
            setStudentDetails({
                ...studentDetails,
                dropoffPoint: {
                    ...studentDetails.dropoffPoint,
                    latitude,
                    longitude
                }
            });
        }
        setMapModalVisible(false);
    };

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

    const handleSubmit = async () => {
        if (!parentDetails.fullName || !parentDetails.email || !parentDetails.phone || !parentDetails.address) {
            alert('Please fill in parent details');
            return;
        }
        if (!studentDetails.fullName || !studentDetails.grade || !studentDetails.school || !studentDetails.pickupPoint.latitude || !studentDetails.dropoffPoint.latitude || !studentDetails.monthlyFee) {
            alert('Please fill in student details');
            return;
        }

        const driverId = await AsyncStorage.getItem('userId');
        if (!driverId) {
            alert('Driver ID not found');
            return;
        }

        setLoading(true);
        try {
            const response = await addStudent(
                driverId,
                parentDetails.fullName,
                parentDetails.email,
                parentDetails.phone,
                parentDetails.address,
                studentDetails.monthlyFee,
                studentDetails.fullName,
                studentDetails.grade,
                studentDetails.school,
                studentDetails.pickupPoint.longitude.toString(),
                studentDetails.pickupPoint.latitude.toString(),
                studentDetails.dropoffPoint.longitude.toString(),
                studentDetails.dropoffPoint.latitude.toString()
            );

            setLoading(false);
            if (response.ok) {
                const studentsResponse = await getStudents(driverId);
                if (studentsResponse.ok && studentsResponse.data) {
                    setStudentData(studentsResponse.data);
                    await AsyncStorage.setItem('students', JSON.stringify(studentsResponse.data));
                }

                setParentDetails({
                    fullName: '',
                    email: '',
                    phone: '',
                    address: ''
                });
                setStudentDetails({
                    fullName: '',
                    grade: '',
                    school: '',
                    pickupPoint: {address: '', latitude: 0, longitude: 0},
                    dropoffPoint: {address: '', latitude: 0, longitude: 0},
                    monthlyFee: ''
                });

                setModalVisible(false);
                alert('Student added successfully');
            } else {
                alert('Error adding student');
            }
        } catch (error) {
            setLoading(false);
            alert('Network error');
        }
    };
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-grow"
                contentContainerStyle={{paddingBottom: 120}}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex justify-center mx-4 mt-6">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Image
                                source={icons.back}
                                className="w-8 h-8 "
                                tintColor="#242b4d"
                            />
                        </TouchableOpacity>
                        <Text className="text-2xl text-primary-900 font-JakartaBold">Students</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Image
                                source={icons.add}
                                className="w-8 h-8"
                                tintColor="#242b4d"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="bg-gray-100 rounded-xl flex-row items-center px-4 mb-6">
                        <Image source={icons.search} className="w-5 h-5 mr-2" tintColor="#6B7280"/>
                        <TextInput
                            placeholder="Search students..."
                            className="flex-1 py-3 text-base font-JakartaMedium"

                        />
                    </View>

                    {/* Student List */}
                    {studentData.map((student) => (
                        <TouchableOpacity
                            key={student.id}
                            className="bg-white rounded-2xl p-5 mb-4 shadow-md border border-gray-100"
                            onPress={() => router.push({
                                pathname: '/(root)/student-details',
                                params: { studentId: student.id }
                            })}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-14 h-14 rounded-2xl bg-primary-900/5 items-center justify-center mr-4 border border-primary-900/10">
                                        <Text className="text-primary-900 font-JakartaBold text-2xl">
                                            {student.full_name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View className="flex-1 mr-4">
                                        <Text className="text-lg text-gray-900 font-JakartaBold mb-1">
                                            {student.full_name}
                                        </Text>
                                        <View className="flex-row items-center">
                                            <View className="bg-primary-900/5 px-3 py-1 rounded-full mr-2">
                                                <Text className="text-primary-900 font-JakartaMedium text-sm">
                                                    Grade {student.grade}
                                                </Text>
                                            </View>
                                            <Text className="text-gray-500 font-JakartaMedium text-sm">
                                                {student.school}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    className="bg-red-50 p-3.5 rounded-xl border border-red-100"
                                    onPress={() => {
                                        const phoneNumber = student.phone;
                                        Linking.openURL(`tel:${phoneNumber}`);
                                    }}
                                >
                                    <Image
                                        source={icons.phone}
                                        className="w-5 h-5"
                                        tintColor="#EF4444"
                                    />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Add Student Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-JakartaBold text-primary-900">Add New Student</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Image source={icons.close} className="w-6 h-6" tintColor="#242b4d"/>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Parent Details */}
                            <Text className="text-lg font-JakartaBold text-primary-900 mb-4">Parent Details</Text>
                            <View className="space-y-4 mb-6">
                                <InputField
                                    label="Full Name"
                                    labelStyle="text-sm"
                                    placeholder="Enter parent's full name"
                                    value={parentDetails.fullName}
                                    onChangeText={(text) => setParentDetails({...parentDetails, fullName: text})}
                                />
                                <InputField
                                    label="Email"
                                    labelStyle="text-sm"
                                    placeholder="Enter parent's email"
                                    value={parentDetails.email}
                                    onChangeText={(text) => setParentDetails({...parentDetails, email: text})}
                                    type="email-address"
                                />
                                <InputField
                                    label="Phone"
                                    labelStyle="text-sm"
                                    placeholder="Enter parent's phone"
                                    value={parentDetails.phone}
                                    onChangeText={(text) => setParentDetails({...parentDetails, phone: text})}
                                    type="phone-pad"
                                />
                                <InputField
                                    label="Address"
                                    labelStyle="text-sm"
                                    placeholder="Enter parent's address"
                                    value={parentDetails.address}
                                    onChangeText={(text) => setParentDetails({...parentDetails, address: text})}
                                    multiline
                                    numberOfLines={3}
                                    containerStyle="h-24"
                                />
                            </View>

                            {/* Student Details */}
                            <Text className="text-lg font-JakartaBold text-primary-900 mb-4">Student Details</Text>
                            <View className="space-y-4 mb-6">
                                <InputField
                                    label="Full Name"
                                    labelStyle="text-sm"
                                    placeholder="Enter student's full name"
                                    value={studentDetails.fullName}
                                    onChangeText={(text) => setStudentDetails({...studentDetails, fullName: text})}
                                />
                                <InputField
                                    label="Grade"
                                    labelStyle="text-sm"
                                    placeholder="Enter student's grade"
                                    value={studentDetails.grade}
                                    onChangeText={(text) => setStudentDetails({...studentDetails, grade: text})}
                                />
                                <InputField
                                    label="School"
                                    labelStyle="text-sm"
                                    placeholder="Enter student's school"
                                    value={studentDetails.school}
                                    onChangeText={(text) => setStudentDetails({...studentDetails, school: text})}
                                />

                                {/* Pickup Point */}
                                <View>
                                    <Text className="text-sm font-JakartaBold mb-4">Pickup Point</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setCurrentLocationField('pickup');
                                            setMapModalVisible(true);
                                        }}
                                        className="bg-neutral-100 p-4 rounded-3xl flex-row items-center"
                                    >
                                        <Image source={icons.location} className="w-5 h-5 mr-2" tintColor="#6B7280"/>
                                        <Text className="font-JakartaMedium text-secondary-500">
                                            {studentDetails.pickupPoint.latitude ?
                                                `${studentDetails.pickupPoint.latitude.toFixed(6)}, ${studentDetails.pickupPoint.longitude.toFixed(6)}` :
                                                'Select pickup location'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Drop off Point */}
                                <View className='mt-4'>
                                    <Text className="text-sm font-JakartaBold mb-4">Drop-off Point</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setCurrentLocationField('dropoff');
                                            setMapModalVisible(true);
                                        }}
                                        className="bg-neutral-100 p-4 rounded-3xl flex-row items-center"
                                    >
                                        <Image source={icons.location} className="w-5 h-5 mr-2" tintColor="#6B7280"/>
                                        <Text className="font-JakartaMedium text-secondary-500">
                                            {studentDetails.dropoffPoint.latitude ?
                                                `${studentDetails.dropoffPoint.latitude.toFixed(6)}, ${studentDetails.dropoffPoint.longitude.toFixed(6)}` :
                                                'Select drop-off location'}
                                        </Text>
                                    </TouchableOpacity>

                                    <InputField
                                        label="Monthly Fee"
                                        labelStyle="text-sm mt-4"
                                        placeholder="Enter monthly fee"
                                        value={studentDetails.monthlyFee}
                                        type='numeric'
                                        onChangeText={(text) => setStudentDetails({
                                            ...studentDetails,
                                            monthlyFee: text
                                        })}
                                    />
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                className="bg-primary-900 py-4 rounded-xl mt-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF"/>
                                ) : (
                                    <Text className="text-white text-center font-JakartaBold text-lg">Add Student</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Map Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={mapModalVisible}
                onRequestClose={() => setMapModalVisible(false)}
            >
                <View className="flex-1 bg-white">
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                        <Text className="text-lg font-JakartaBold">
                            Select {currentLocationField === 'pickup' ? 'Pickup' : 'Drop-off'} Location
                        </Text>
                        <TouchableOpacity onPress={() => setMapModalVisible(false)}>
                            <Image source={icons.close} className="w-6 h-6" tintColor="#0286FF"/>
                        </TouchableOpacity>
                    </View>

                    {/* Current Location Button */}
                    <TouchableOpacity
                        onPress={getCurrentLocation}
                        className="absolute bottom-24 right-4 z-50 bg-white p-3 rounded-full shadow-md"
                    >
                        <Image source={icons.target} className="w-6 h-6" tintColor="#0286FF"/>
                    </TouchableOpacity>

                    <MapView
                        style={{flex: 1}}
                        region={currentLocation}
                        onPress={handleLocationSelect}
                    >
                        {currentLocationField === 'pickup' && studentDetails.pickupPoint.latitude !== 0 && (
                            <Marker
                                coordinate={{
                                    latitude: studentDetails.pickupPoint.latitude,
                                    longitude: studentDetails.pickupPoint.longitude
                                }}
                                title="Pickup Point"
                            />
                        )}
                        {currentLocationField === 'dropoff' && studentDetails.dropoffPoint.latitude !== 0 && (
                            <Marker
                                coordinate={{
                                    latitude: studentDetails.dropoffPoint.latitude,
                                    longitude: studentDetails.dropoffPoint.longitude
                                }}
                                title="Drop-off Point"
                            />
                        )}
                    </MapView>
                </View>


            </Modal>
        </SafeAreaView>
    );
};

