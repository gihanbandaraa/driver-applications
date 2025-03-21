import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    TextInput,
    Image
} from 'react-native'
import React, {useEffect, useState, useCallback} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons'
import { debounce } from 'lodash'

const {getTripDetails, getTripSummaries} = require('@/api/api')

// Define interfaces for the data structures
interface TripSummary {
    date: string;
    morningCount: number;
    afternoonCount: number;
}

interface TripDetail {
    studentName: string;
    morning_attendance_status: string;
    afternoon_attendance_status: string;
}

const Trips = () => {
    const [tripSummaries, setTripSummaries] = useState<TripSummary[]>([]);
    const [filteredTrips, setFilteredTrips] = useState<TripSummary[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
    const [tripDetails, setTripDetails] = useState<TripDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const fetchTripSummaries = async () => {
        try {
            const driverId = await AsyncStorage.getItem('userId');
            if (driverId) {
                const response = await getTripSummaries(driverId);
                if (response.ok && response.data) {
                    setTripSummaries(response.data);
                    setFilteredTrips(response.data);
                }
            }
        } catch (error) {
            console.error('Error fetching trip summaries:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTripSummaries();
    }, []);

    // Search functionality with debounce
    const handleSearch = useCallback(
        debounce((text: string) => {
            if (!text.trim()) {
                setFilteredTrips(tripSummaries);
                return;
            }

            const filtered = tripSummaries.filter(trip => {
                const formattedDate = formatDate(trip.date).toLowerCase();
                return formattedDate.includes(text.toLowerCase());
            });

            setFilteredTrips(filtered);
        }, 300),
        [tripSummaries]
    );

    useEffect(() => {
        handleSearch(searchQuery);
    }, [searchQuery, handleSearch]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTripSummaries();
    };

    const fetchTripDetails = async (date: string) => {
        setDetailsLoading(true);
        try {
            const driverId = await AsyncStorage.getItem('userId');
            if (driverId) {
                const response = await getTripDetails(driverId, date);
                if (response.ok && response.data) {
                    setTripDetails(response.data);
                }
            }
        } catch (error) {
            console.error('Error fetching trip details:', error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleTripPress = (date: string) => {
        setSelectedTrip(date);
        setModalVisible(true);
        fetchTripDetails(date);
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const options: Intl.DateTimeFormatOptions = {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            };
            return date.toLocaleDateString('en-US', options);
        } catch (error) {
            return dateString;
        }
    };

    const getStatusIcon = (status: string) => {
        const normalizedStatus = status?.toLowerCase() || '';
        if (normalizedStatus === 'present') {
            return <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#10b981" />;
        } else if (normalizedStatus === 'absent') {
            return <MaterialCommunityIcons name="close-circle" size={18} color="#ef4444" />;
        }
        return <MaterialCommunityIcons name="help-circle" size={18} color="#d1d5db" />;
    };

    const getStatusBadge = (status: string) => {
        const normalizedStatus = status?.toLowerCase() || '';
        const bgColor = normalizedStatus === 'present' ? 'bg-green-50' : normalizedStatus === 'absent' ? 'bg-red-50' : 'bg-gray-50';
        const textColor = normalizedStatus === 'present' ? 'text-green-700' : normalizedStatus === 'absent' ? 'text-red-700' : 'text-gray-700';

        return (
            <View className={`flex-row items-center ${bgColor} px-3 py-1.5 rounded-full`}>
                {getStatusIcon(status)}
                <Text className={`ml-1 capitalize ${textColor} font-JakartaMedium`}>{normalizedStatus}</Text>
            </View>
        );
    };

    const renderTripSummary = ({item}: { item: TripSummary }) => (
        <TouchableOpacity
            onPress={() => handleTripPress(item.date)}
            className="mb-4"
        >
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-50">
                <View className="px-5 py-4">
                    <Text className="text-lg font-JakartaBold text-primary-800">{formatDate(item.date)}</Text>

                    <View className="flex-row items-center justify-between mt-3">
                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <View className="bg-amber-50 p-2 rounded-full">
                                    <Ionicons name="sunny" size={20} color="#f59e0b" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-xs text-gray-500 font-JakartaMedium">MORNING</Text>
                                    <Text className="text-base font-JakartaBold text-amber-700">{item.morningCount} students</Text>
                                </View>
                            </View>
                        </View>

                        <View className="flex-1 ml-4">
                            <View className="flex-row items-center">
                                <View className="bg-blue-50 p-2 rounded-full">
                                    <Ionicons name="moon" size={20} color="#3b82f6" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-xs text-gray-500 font-JakartaMedium">AFTERNOON</Text>
                                    <Text className="text-base font-JakartaBold text-blue-700">{item.afternoonCount} students</Text>
                                </View>
                            </View>
                        </View>

                        <View className="ml-2">
                            <View className="bg-gray-50 rounded-full p-2">
                                <Ionicons name="chevron-forward" size={20} color="#4b5563" />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 px-5 pt-8 pb-4">
                <Text className="text-3xl font-JakartaExtraBold text-primary-900 mb-2">Trip History</Text>
                <Text className="text-base text-gray-500 font-JakartaMedium mb-6">View your past trips and student attendance</Text>

                {/* Search Bar */}
                <View className="bg-white rounded-xl shadow-sm flex-row items-center px-4 py-3 mb-6 border border-gray-100">
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 ml-2 py-1 text-base font-JakartaMedium text-gray-800"
                        placeholder="Search by date..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#9ca3af"
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text className="text-gray-500 mt-4 font-JakartaMedium">Loading trips...</Text>
                    </View>
                ) : filteredTrips.length === 0 ? (
                    <View className="flex-1 justify-center items-center px-6">
                        {searchQuery ? (
                            <>

                                <Text className="text-xl text-gray-800 font-JakartaBold mt-6">No matching trips</Text>
                                <Text className="text-base text-gray-500 font-JakartaMedium mt-2 text-center">
                                    We couldn't find any trips matching your search
                                </Text>
                            </>
                        ) : (
                            <>
                                <Image

                                    className="w-40 h-40"
                                    resizeMode="contain"
                                />
                                <Text className="text-xl text-gray-800 font-JakartaBold mt-6">No trips yet</Text>
                                <Text className="text-base text-gray-500 font-JakartaMedium mt-2 text-center">
                                    You haven't completed any trips yet. They will appear here when available.
                                </Text>
                            </>
                        )}
                        <TouchableOpacity
                            onPress={onRefresh}
                            className="mt-6 py-3.5 px-6 bg-primary-600 rounded-xl shadow-sm"
                        >
                            <Text className="text-white font-JakartaBold">Refresh</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filteredTrips}
                        renderItem={renderTripSummary}
                        keyExtractor={(item) => item.date}
                        showsVerticalScrollIndicator={false}
                        contentContainerClassName="pb-4"
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={["#3b82f6"]}
                            />
                        }
                    />
                )}

                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                    transparent={true}
                >
                    <View className="flex-1 bg-black bg-opacity-50">
                        <View className="flex-1 mt-20 bg-white rounded-t-3xl shadow-xl">
                            <View className="w-16 h-1.5 bg-gray-300 rounded-full self-center my-3" />

                            <View className="px-6 py-3 flex-1">
                                <View className="flex-row justify-between items-center mb-6">
                                    <View>
                                        <Text className="text-xs text-gray-500 font-JakartaMedium">TRIP DATE</Text>
                                        <Text className="text-2xl font-JakartaBold text-primary-900">
                                            {selectedTrip ? formatDate(selectedTrip) : "Trip Details"}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(false)}
                                        className="bg-gray-100 p-2.5 rounded-full"
                                    >
                                        <Ionicons name="close" size={22} color="#4b5563" />
                                    </TouchableOpacity>
                                </View>

                                {detailsLoading ? (
                                    <View className="flex-1 justify-center items-center py-20">
                                        <ActivityIndicator size="large" color="#3b82f6" />
                                        <Text className="text-gray-500 mt-4 font-JakartaMedium">Loading details...</Text>
                                    </View>
                                ) : tripDetails.length === 0 ? (
                                    <View className="flex-1 justify-center items-center py-20">
                                        <Image

                                            className="w-40 h-40"
                                            resizeMode="contain"
                                        />
                                        <Text className="text-xl text-gray-800 font-JakartaBold mt-6">No student data</Text>
                                        <Text className="text-base text-gray-500 font-JakartaMedium mt-2 text-center">
                                            No attendance records were found for this trip
                                        </Text>
                                    </View>
                                ) : (
                                    <>
                                        <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-100">
                                            <Text className="text-sm text-gray-500 font-JakartaBold flex-1">STUDENT</Text>
                                            <View className="flex-row">
                                                <Text className="text-sm text-gray-500 font-JakartaBold w-24 text-center">MORNING</Text>
                                                <Text className="text-sm text-gray-500 font-JakartaBold w-24 text-center">AFTERNOON</Text>
                                            </View>
                                        </View>

                                        <FlatList
                                            data={tripDetails}
                                            renderItem={({item}: { item: TripDetail }) => (
                                                <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
                                                    <View className="flex-1 pr-3">
                                                        <Text className="text-base font-JakartaSemiBold text-gray-800">{item.studentName}</Text>
                                                    </View>
                                                    <View className="flex-row">
                                                        <View className="w-24 items-center">
                                                            {getStatusBadge(item.morning_attendance_status)}
                                                        </View>
                                                        <View className="w-24 items-center">
                                                            {getStatusBadge(item.afternoon_attendance_status)}
                                                        </View>
                                                    </View>
                                                </View>
                                            )}
                                            keyExtractor={(item, index) => index.toString()}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerClassName="pb-10"
                                        />
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

export default Trips;