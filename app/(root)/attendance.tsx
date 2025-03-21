import React, {useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getStudents} from '@/api/api';
import {Student} from "@/types/student";
import {useRouter} from 'expo-router';
import {AttendanceStatus, RideStatus, Period} from '@/types/attendance';
import {useFocusEffect} from '@react-navigation/native';
import {markAttendance, getAttendance} from "@/api/api";

interface AttendanceRecord {
    morning_attendance_status: AttendanceStatus;
    morning_ride_status: RideStatus;
    afternoon_attendance_status: AttendanceStatus;
    afternoon_ride_status: RideStatus;
}

const AttendanceScreen = () => {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [period, setPeriod] = useState<Period>('MORNING');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const loadStudentsWithAttendance = useCallback(async (selectedPeriod: Period) => {
        setLoading(true);
        try {
            const driverId = await AsyncStorage.getItem('userId');
            if (!driverId) {
                Alert.alert('Session Expired', 'Please login again');
                router.replace('/(auth)/sign-in');
                return;
            }
            const today = new Date().toISOString().split('T')[0];
            const studentsResponse = await getStudents(driverId);
            const attendanceResponse = await getAttendance(driverId, today);

            if (studentsResponse.ok && studentsResponse.data) {
                let studentsWithAttendance = studentsResponse.data;
                if (attendanceResponse.ok && attendanceResponse.data) {
                    const attendanceMap = new Map<number, AttendanceRecord>(
                        attendanceResponse.data.map((record: any) => [
                            record.student_id,
                            {
                                morning_attendance_status: record.morning_attendance_status || undefined,
                                morning_ride_status: record.morning_ride_status || undefined,
                                afternoon_attendance_status: record.afternoon_attendance_status || undefined,
                                afternoon_ride_status: record.afternoon_ride_status || undefined,
                            }
                        ])
                    );

                    studentsWithAttendance = studentsResponse.data.map((student: Student) => {
                        const attendance = attendanceMap.get(student.id);
                        if (attendance) {
                            // Log for debugging
                            return {
                                ...student,
                                attendanceStatus: selectedPeriod === 'MORNING'
                                    ? attendance.morning_attendance_status
                                    : attendance.afternoon_attendance_status,
                                rideStatus: selectedPeriod === 'MORNING'
                                    ? attendance.morning_ride_status
                                    : attendance.afternoon_ride_status
                            };
                        }
                        return {
                            ...student,
                            attendanceStatus: undefined,
                            rideStatus: undefined
                        };
                    });
                }
                setStudents(studentsWithAttendance);
            } else {
                Alert.alert('Error', 'Unable to load student data');
            }
        } catch (error) {
            console.error('Load error:', error);
            Alert.alert('Network Error', 'Please check your connection');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useFocusEffect(
        useCallback(() => {
            loadStudentsWithAttendance(period);
        }, [loadStudentsWithAttendance, period])
    );

    const handlePeriodChange = (newPeriod: Period) => {
        if (newPeriod !== period && !loading) {
            setPeriod(newPeriod);
        }
    };

    const handleAttendanceMark = async (
        studentId: number,
        attendanceStatus: AttendanceStatus,
        rideStatus?: RideStatus
    ) => {
        if (loading) return;

        setLoading(true);
        try {
            const driverId = await AsyncStorage.getItem('userId');
            if (!driverId) {
                Alert.alert('Error', 'User ID not found');
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const response = await markAttendance(
                driverId,
                studentId.toString(),
                today,
                period,
                attendanceStatus,
                rideStatus || 'PICKED_UP'
            );

            if (response.ok) {
                setStudents(prevStudents =>
                    prevStudents.map(student =>
                        student.id === studentId
                            ? {...student, attendanceStatus, rideStatus}
                            : student
                    )
                );
            } else {
                throw new Error(response.data?.message || 'Failed to update attendance');
            }
        } catch (error) {
            Alert.alert('Error', (error as Error).message || 'Failed to update attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-100">
            {/* Header */}
            <View className="bg-primary-900 px-4 pt-12 pb-6 rounded-b-3xl">
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-2xl font-JakartaBold text-white">
                        Attendance
                    </Text>
                    <Text className="text-white font-JakartaMedium">
                        {new Date().toLocaleDateString()}
                    </Text>
                </View>

                {/* Search Bar */}
                <View className="bg-white/10 rounded-xl p-2 mb-4">
                    <TextInput
                        placeholder="Search students..."
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="px-4 py-2 text-white font-JakartaMedium"
                    />
                </View>

                {/* Period Selector */}
                <View className="bg-white/10 rounded-xl p-1.5">
                    <View className="flex-row space-x-2">
                        {['MORNING', 'AFTERNOON'].map((p) => (
                            <TouchableOpacity
                                key={p}
                                onPress={() => handlePeriodChange(p as Period)}
                                disabled={loading}
                                className={`flex-1 py-3.5 px-4 rounded-lg ${
                                    period === p ? 'bg-white' : ''
                                }`}
                            >
                                <Text className={`text-center font-JakartaMedium ${
                                    period === p ? 'text-primary-900' : 'text-white'
                                }`}>
                                    {p === 'MORNING' ? '🌅 Morning' : '🌇 Afternoon'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Student List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#1D4ED8"/>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-4">
                    {filteredStudents.map((student) => (
                        <View key={student.id}
                              className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
                            <View className="flex-row items-center justify-between mb-4">
                                <View>
                                    <Text className="text-lg font-JakartaBold text-gray-900">
                                        {student.full_name}
                                    </Text>
                                    <Text className="text-sm font-JakartaMedium text-gray-500">
                                        {student.grade} Grade • {student.school}
                                    </Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${
                                    student.attendanceStatus === 'PRESENT'
                                        ? 'bg-green-100'
                                        : student.attendanceStatus === 'ABSENT'
                                            ? 'bg-red-100'
                                            : 'bg-gray-100'
                                }`}>
                                    <Text className={`text-sm font-JakartaMedium ${
                                        student.attendanceStatus === 'PRESENT'
                                            ? 'text-green-700'
                                            : student.attendanceStatus === 'ABSENT'
                                                ? 'text-red-700'
                                                : 'text-gray-700'
                                    }`}>
                                        {student.attendanceStatus || 'Not Marked'}
                                    </Text>
                                </View>
                            </View>

                            {/* Attendance Buttons */}
                            <View className="flex-row space-x-4 mb-4">
                                {['PRESENT', 'ABSENT'].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        onPress={() => handleAttendanceMark(student.id, status as AttendanceStatus)}
                                        disabled={loading}
                                        className={`flex-1 py-3.5 mx-2 rounded-xl border ${
                                            student.attendanceStatus === status
                                                ? 'bg-primary-900 border-primary-900'
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <Text className={`text-center font-JakartaMedium ${
                                            student.attendanceStatus === status
                                                ? 'text-white'
                                                : 'text-gray-700'
                                        }`}>
                                            {status === 'PRESENT' ? '✓ Present' : '⨯ Absent'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Ride Status Buttons */}
                            {student.attendanceStatus === 'PRESENT' && (
                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    {[
                                        { value: 'PICKED_UP', icon: '🚌', label: 'Picked Up' },
                                        { value: 'DROPPED', icon: '🏫', label: 'Dropped' }
                                    ].map(({value, icon, label}) => {
                                        const isActive = student.rideStatus === value;

                                        return (
                                            <TouchableOpacity
                                                key={value}
                                                disabled={loading}
                                                onPress={() => handleAttendanceMark(
                                                    student.id,
                                                    'PRESENT',
                                                    value as RideStatus
                                                )}
                                                style={{
                                                    flex: 1,
                                                    paddingVertical: 14,
                                                    marginHorizontal: 8,
                                                    borderRadius: 12,
                                                    borderWidth: 1,
                                                    borderColor: isActive ? '#bfdbfe' : '#e5e7eb',
                                                    backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                                                }}
                                            >
                                                <Text style={{
                                                    textAlign: 'center',
                                                    fontFamily: 'JakartaMedium',
                                                    color: isActive ? '#1e3a8a' : '#4b5563',
                                                }}>
                                                    {icon} {label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default AttendanceScreen;