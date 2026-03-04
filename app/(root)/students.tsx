import React, {useEffect, useState} from 'react';
import { Text, ScrollView, TouchableOpacity, Modal, Image, TextInput, ActivityIndicator, Linking} from 'react-native';
import {icons} from "@/constants";
import {router} from "expo-router";
import InputField from "@/components/InputField";
import { Platform, View } from 'react-native';
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
import * as Location from 'expo-location';
import {addStudent, getStudents} from "@/api/api";
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

export default function Students() {
    const {userId} = useUser();
    const [modalVisible, setModalVisible] = useState(false);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [currentLocationField, setCurrentLocationField] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentData, setStudentData] = useState<Student[]>([]);
    const filteredStudents = studentData.filter(s =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.school.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        if (!userId) return;
        (async () => {
            try {
                const response = await getStudents(userId);
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
    }, [userId]);

    const handleSubmit = async () => {
        if (!parentDetails.fullName || !parentDetails.email || !parentDetails.phone || !parentDetails.address) {
            alert('Please fill in parent details');
            return;
        }
        if (!studentDetails.fullName || !studentDetails.grade || !studentDetails.school || !studentDetails.pickupPoint.latitude || !studentDetails.dropoffPoint.latitude || !studentDetails.monthlyFee) {
            alert('Please fill in student details');
            return;
        }

        if (!userId) {
            alert('Driver ID not found');
            return;
        }
        setLoading(true);
        try {
            const response = await addStudent(
                userId,
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
                const studentsResponse = await getStudents(userId as string);
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
        <View className="flex-1" style={{backgroundColor: '#f1f5f9'}}>
            {/* Navy Header */}
            <View style={{backgroundColor: '#242b4d', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20}}>
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-white font-JakartaExtraBold text-2xl">Students</Text>
                        <Text className="text-white/60 font-JakartaMedium text-sm mt-0.5">{studentData.length} students enrolled</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={{backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingHorizontal: 14, marginTop: 14}}>
                    <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.6)" />
                    <TextInput
                        style={{flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: 'white', fontFamily: 'Jakarta-Medium', fontSize: 15}}
                        placeholder="Search students..."
                        placeholderTextColor="rgba(255,255,255,0.45)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Student List */}
            <ScrollView
                style={{flex: 1, paddingHorizontal: 16, paddingTop: 16}}
                contentContainerStyle={{paddingBottom: 90}}
                showsVerticalScrollIndicator={false}
            >
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                        <TouchableOpacity
                            key={student.id}
                            activeOpacity={0.7}
                            onPress={() => router.push({pathname: '/(root)/student-details', params: {studentId: student.id}})}
                        >
                            <View style={{backgroundColor: 'white', borderRadius: 18, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2}}>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        <View style={{width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(36,43,77,0.07)', alignItems: 'center', justifyContent: 'center', marginRight: 14}}>
                                            <Text className="text-primary-900 font-JakartaBold text-2xl">
                                                {student.full_name.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View className="flex-1 mr-3">
                                            <Text className="text-base text-gray-900 font-JakartaBold mb-1">
                                                {student.full_name}
                                            </Text>
                                            <View className="flex-row items-center flex-wrap gap-1">
                                                <View style={{backgroundColor: 'rgba(36,43,77,0.07)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3}}>
                                                    <Text className="text-primary-900 font-JakartaMedium text-xs">
                                                        Grade {student.grade}
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-500 font-JakartaMedium text-xs" numberOfLines={1}>
                                                    {student.school}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={{backgroundColor: '#fef2f2', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca'}}
                                        onPress={() => Linking.openURL(`tel:${student.phone}`)}
                                    >
                                        <Ionicons name="call-outline" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80}}>
                        <View style={{width: 72, height: 72, borderRadius: 36, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 16}}>
                            <Ionicons name="people-outline" size={34} color="#94a3b8" />
                        </View>
                        <Text className="text-lg font-JakartaBold text-gray-400 mb-2">No Students Found</Text>
                        <Text className="text-sm font-JakartaMedium text-gray-400 text-center" style={{maxWidth: 240}}>
                            Add your first student by tapping the + button above
                        </Text>
                    </View>
                )}
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
        </View>
    );
};

