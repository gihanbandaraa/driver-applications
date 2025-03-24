import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView
} from 'react-native';
import {getPaymentDetails, notifyDuePayments, notifyAllDuePayments, updatePaymentStatus} from "@/api/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FontAwesome} from '@expo/vector-icons';

// Define the payment interface
interface Payment {
    student_name: string;
    id?: string;
    month: string;
    payment_status: 'paid' | 'Pending' | 'Overdue';
    amount: number;
    due_date?: string;
}

const Payments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sendingReminder, setSendingReminder] = useState<string | null>(null);
    const [sendingAllReminders, setSendingAllReminders] = useState(false);
    const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
    const today = new Date();

    const fetchPayments = async () => {
        try {
            const driverId = await AsyncStorage.getItem('userId');
            if (driverId) {
                const response = await getPaymentDetails(driverId);
                if (response.ok) {
                    setPayments(response.data);
                }
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPayments();
    };

    const sendPaymentReminder = async (studentId: string, studentName: string) => {
        try {
            setSendingReminder(studentId);
            const driverId = await AsyncStorage.getItem('userId');
            if (driverId) {
                await notifyDuePayments(driverId, studentId);
            }
        } catch (error) {
            console.error('Error sending payment reminder:', error);
            Alert.alert('Error', 'Failed to send payment reminder');
        } finally {
            setSendingReminder(null);
        }
    };

    const sendAllPaymentReminders = async () => {
        try {
            setSendingAllReminders(true);
            const driverId = await AsyncStorage.getItem('userId');
            if (driverId) {
                await notifyAllDuePayments(driverId);
            }
        } catch (error) {
            console.error('Error sending all payment reminders:', error);
            Alert.alert('Error', 'Failed to send payment reminders');
        } finally {
            setSendingAllReminders(false);
        }
    };

    const handleMarkAsPaid = async (studentId: string) => {
        if (!studentId) return;

        try {
            setUpdatingPayment(studentId);
            // Use lowercase 'paid' to match database values
            await updatePaymentStatus(studentId, 'paid');
            // Refresh payment list after updating status
            await fetchPayments();
        } catch (error) {
            console.error('Error updating payment status:', error);
            Alert.alert('Error', 'Failed to update payment status');
        } finally {
            setUpdatingPayment(null);
        }
    };

    const isPaymentOverdue = (dueDate?: string): boolean => {
        if (!dueDate) return false;
        const dueDateObj = new Date(dueDate);
        return dueDateObj < today;
    };

    const filteredPayments = payments.filter(payment =>
        payment.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const overduePendingPayments = filteredPayments.filter(
        payment => payment.payment_status !== 'paid' && isPaymentOverdue(payment.due_date)
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#1D4ED8"/>
                <Text className="mt-3 text-gray-600 font-JakartaMedium">Loading payment details...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header with gradient */}
            <View className="bg-primary-900 px-4 pt-12 pb-8 rounded-b-3xl shadow-lg">
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-2xl font-JakartaBold text-white">
                        Payment Records
                    </Text>
                    <View className="bg-white/20 p-2 rounded-full">
                        <FontAwesome name="refresh" size={18} color="#fff" onPress={onRefresh}/>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="bg-white/15 rounded-xl flex-row items-center px-3 py-2">
                    <FontAwesome name="search" size={16} color="rgba(255,255,255,0.7)"/>
                    <TextInput
                        placeholder="Search students..."
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 px-3 py-2 text-white font-JakartaMedium"
                    />
                </View>

                {/* Stats summary */}
                <View className="flex-row justify-between mt-6 bg-white/10 rounded-xl p-3">
                    <View className="items-center flex-1">
                        <Text className="text-white/70 font-JakartaMedium text-xs">Total</Text>
                        <Text className="text-white font-JakartaBold text-lg">{payments.length}</Text>
                    </View>
                    <View className="items-center flex-1 border-l border-r border-white/20">
                        <Text className="text-white/70 font-JakartaMedium text-xs">Paid</Text>
                        <Text className="text-white font-JakartaBold text-lg">
                            {payments.filter(p => p.payment_status === 'paid').length}
                        </Text>
                    </View>
                    <View className="items-center flex-1">
                        <Text className="text-white/70 font-JakartaMedium text-xs">Pending</Text>
                        <Text className="text-white font-JakartaBold text-lg">
                            {payments.filter(p => p.payment_status === 'Pending').length}
                        </Text>
                    </View>
                </View>

                {/* Remind All Button */}
                {overduePendingPayments.length > 0 && (
                    <TouchableOpacity
                        className="mt-4 bg-white rounded-xl py-3 flex-row justify-center items-center"
                        onPress={sendAllPaymentReminders}
                        disabled={sendingAllReminders}
                    >
                        {sendingAllReminders ? (
                            <ActivityIndicator size="small" color="#1D4ED8"/>
                        ) : (
                            <FontAwesome name="bell" size={16} color="#1D4ED8"/>
                        )}
                        <Text className="ml-2 text-primary-900 font-JakartaBold">
                            {sendingAllReminders ? 'Sending Reminders...' : `Remind All (${overduePendingPayments.length})`}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Payment List */}
            <ScrollView
                className="flex-1 px-4 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1D4ED8"]}/>
                }
            >
                <Text className="text-gray-500 font-JakartaMedium mb-2 ml-1">
                    {filteredPayments.length} payment records
                </Text>

                {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment, index) => {
                        const isOverdue = isPaymentOverdue(payment.due_date);
                        const isPending = payment.payment_status !== 'paid';

                        return (
                            <View
                                key={index}
                                className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border-l-4 ${
                                    payment.payment_status === 'paid'
                                        ? 'border-l-green-500'
                                        : isOverdue
                                            ? 'border-l-red-500'
                                            : 'border-l-yellow-500'
                                }`}
                            >
                                {/* Header row */}
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center">
                                        <View
                                            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                                            <Text className="font-JakartaBold text-primary-900">
                                                {payment.student_name?.charAt(0) || 'S'}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text className="text-lg font-JakartaBold text-gray-900">
                                                {payment.student_name}
                                            </Text>
                                            <Text className="text-xs font-JakartaMedium text-gray-500">
                                                ID: {payment.id || 'N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${
                                        payment.payment_status === 'paid'
                                            ? 'bg-green-100'
                                            : isOverdue
                                                ? 'bg-red-100'
                                                : 'bg-yellow-100'
                                    }`}>
                                        <Text className={`text-xs font-JakartaBold ${
                                            payment.payment_status === 'paid'
                                                ? 'text-green-700'
                                                : isOverdue
                                                    ? 'text-red-700'
                                                    : 'text-yellow-700'
                                        }`}>
                                            {payment.payment_status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Payment details */}
                                <View className="bg-gray-50 rounded-xl p-3 mb-3">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <View className="flex-row items-center">
                                            <FontAwesome name="calendar" size={14} color="#6B7280"/>
                                            <Text className="ml-2 text-gray-700 font-JakartaMedium text-sm">
                                                {payment.month}
                                            </Text>
                                        </View>
                                        {payment.due_date && (
                                            <Text
                                                className={`text-xs font-JakartaMedium ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                                                Due: {new Date(payment.due_date).toLocaleDateString()}
                                            </Text>
                                        )}
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <View className="flex-row items-center">
                                            <FontAwesome name="money" size={14} color="#6B7280"/>
                                            <Text className="ml-2 text-gray-700 font-JakartaMedium text-sm">
                                                Amount
                                            </Text>
                                        </View>
                                        <Text className="font-JakartaBold text-primary-900 text-lg">
                                            Rs. {payment.amount}
                                        </Text>
                                    </View>
                                </View>

                                {/* Action buttons */}
                                <View className={`flex-row ${isPending ? 'space-x-3' : ''}`}>
                                    {/* Mark as paid button */}
                                    {isPending && (
                                        <TouchableOpacity
                                            className="flex-1 bg-green-600 rounded-xl py-3 mx-1 flex-row justify-center items-center"
                                            onPress={() => payment.id && handleMarkAsPaid(payment.id)}
                                            disabled={updatingPayment === payment.id}
                                        >
                                            {updatingPayment === payment.id ? (
                                                <ActivityIndicator size="small" color="#ffffff"/>
                                            ) : (
                                                <FontAwesome name="check" size={16} color="#fff"/>
                                            )}
                                            <Text className="ml-2 text-white font-JakartaBold">
                                                {updatingPayment === payment.id ? 'Updating...' : 'Mark as Paid'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* Reminder button for overdue payments */}
                                    {(isPending && isOverdue) && (
                                        <TouchableOpacity
                                            className="flex-1 bg-primary-800 rounded-xl mx-1 py-3 flex-row justify-center items-center"
                                            onPress={() => payment.id && sendPaymentReminder(payment.id, payment.student_name)}
                                            disabled={sendingReminder === payment.id}
                                        >
                                            {sendingReminder === payment.id ? (
                                                <ActivityIndicator size="small" color="#ffffff"/>
                                            ) : (
                                                <FontAwesome name="bell" size={16} color="#fff"/>
                                            )}
                                            <Text className="ml-2 text-white font-JakartaBold">
                                                {sendingReminder === payment.id ? 'Sending...' : 'Send Reminder'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View className="flex-1 justify-center items-center py-20">
                        <View className="bg-gray-50 rounded-full p-6 mb-4">
                            <FontAwesome name="money" size={50} color="#cbd5e1"/>
                        </View>
                        <Text className="text-xl font-JakartaBold text-gray-500 mb-1">
                            No payment records found
                        </Text>
                        <Text className="text-gray-400 font-JakartaMedium text-center mx-10">
                            No payments match your search criteria or no payment data is available
                        </Text>
                        <TouchableOpacity
                            className="mt-6 bg-primary-800 px-5 py-3 rounded-xl"
                            onPress={onRefresh}
                        >
                            <Text className="text-white font-JakartaBold">Refresh Data</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View className="h-6"/>
            </ScrollView>
        </View>
    );
};

export default Payments;