import {Alert} from "react-native";
import {router} from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const HostName = "http://192.168.1.168:3000";

export const addUser = async (name: string, email: string, password: string, googleId: string, role: string) => {
    try {
        const response = await fetch(`${HostName}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
                google_id: googleId || null,
                role,
            }),
        });
        const data = await response.json();
        if (response.ok) {
            Alert.alert('Success', data.message, [
                {text: 'OK', onPress: () => router.push('/(auth)/sign-in')}
            ]);
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Network error');
    }
};

export const signIn = async (email: string, password: string) => {

    try {
        const response = await fetch(`${HostName}/api/users/sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });
        const data = await response.json();
        if (response.ok) {
            await AsyncStorage.setItem('userId', data.userId.toString());
            await AsyncStorage.setItem('verification_status', data.verification_status);
            await AsyncStorage.setItem('isLoggedIn', 'true');
            Alert.alert('Success', data.message, [
                {
                    text: 'OK', onPress: () => {
                        // Check verification status and route accordingly
                        if (data.verification_status === 'verified') {
                            router.replace('/(root)/(tabs)/home');  // Navigate to root/home
                        } else if (['not_verified'].includes(data.verification_status)) {
                            router.replace('/(verify)/verifying-home');  // Navigate to verification screen
                        }
                    }
                }
            ]);
        } else {
            Alert.alert('Error', data.error || 'Something went wrong');
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Network error');
    }
}

export const signOut = async () => {
    try {
        await AsyncStorage.clear();
        router.replace('/(auth)/sign-in');
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Network error');
    }
}

export const getVerificationStatus = async () => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        const response = await fetch(`${HostName}/api/users/verification-status/${userId}`);
        const data = await response.json();
        if (response.ok) {
            await AsyncStorage.setItem('verification_status', data.verification_status);
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Network error');
    }
}

export const addDriver = async (
    userId: string,
    fullName: string,
    nicNumber: string,
    licenseNumber: string,
    phoneNum: string,
    address: string,
    dob: string,
    selfieUri: string,
    nicUri: string,
    licenseUri: string
) => {
    try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('full_name', fullName);
        formData.append('nic_number', nicNumber);
        formData.append('license_num', licenseNumber);
        formData.append('phone_num', phoneNum);
        formData.append('address', address);
        formData.append('dob', dob);
        formData.append('is_verified', '0');
        formData.append('is_pending', '1');

        // Append images
        formData.append('selfie', {
            uri: selfieUri,
            name: 'selfie.jpg',
            type: 'image/jpeg',
        } as any);
        formData.append('nic', {
            uri: nicUri,
            name: 'nic.jpg',
            type: 'image/jpeg',
        } as any);
        formData.append('license', {
            uri: licenseUri,
            name: 'license.jpg',
            type: 'image/jpeg',
        } as any);

        const response = await fetch(`${HostName}/api/drivers/add-driver`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        const data = await response.json();
        if (response.ok) {
            await AsyncStorage.setItem('verification_status', 'pending');
            Alert.alert('Success', 'Driver info submitted successfully', [
                {text: 'OK', onPress: () => router.replace('/(pending)/pending-verification')}
            ]);
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Network error');
    }
};

export const getDriver = async (userId: string) => {
    try {
        const response = await fetch(`${HostName}/api/drivers/get-driver-details/${userId}`);
        const data = await response.json();
        if (response.ok) {
            return {ok: true, data};
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
            return {ok: false, data};
        }
    } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Error', 'Network error');
        return {ok: false, error};
    }
}

export const addStudent = async (
    driverId: string,
    full_name: string,
    email: string,
    phone_num: string,
    address: string,
    monthly_fee: string,
    student_name: string,
    student_grade: string,
    student_school: string,
    student_pickup_location_longitude: string,
    student_pickup_location_latitude: string,
    student_drop_location_longitude: string,
    student_drop_location_latitude: string
) => {
    try {
        const response = await fetch(`${HostName}/api/students/add-student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                driverId,
                full_name,
                email,
                phone_num,
                address,
                monthly_fee,
                student_name,
                student_grade,
                student_school,
                student_pickup_location_longitude,
                student_pickup_location_latitude,
                student_drop_location_longitude,
                student_drop_location_latitude
            }),
        });

        const data = await response.json();
        return {ok: response.ok, data}; // Return the response object with the ok property
    } catch (error) {
        console.error('Network error:', error);
        return {ok: false, error}; // Return an error object with the ok property set to false
    }
};


export const getStudents = async (driverId: string) => {
    try {
        const response = await fetch(`${HostName}/api/students/get-students/${driverId}`);
        const data = await response.json();
        if (response.ok) {
            return {ok: true, data};
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
            return {ok: false, data};
        }
    } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Error', 'Network error');
        return {ok: false, error};
    }
};

export const markAttendance = async (
    driverId: string,
    studentId: string,
    date: string,
    period: string,
    attendanceStatus: string,
    rideStatus: string
) => {
    try {
        const response = await fetch(`${HostName}/api/students/mark-attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                driver_id: driverId,
                student_id: studentId,
                date,
                period,
                attendance_status: attendanceStatus,
                ride_status: rideStatus,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            return {ok: true, data};
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
            return {ok: false, data};
        }
    } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Error', 'Network error');
        return {ok: false, error};
    }
}

export const getAttendance = async (driverId: string, date: string) => {
    //We have to send those in body
    try {
        const response = await fetch(`${HostName}/api/students/get-attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                driver_id: driverId,
                date,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            return {ok: true, data};
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
            return {ok: false, data};
        }
    } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Error', 'Network error');
        return {ok: false, error};
    }

}

export const getTripSummaries = async (driverId: string) => {
    try {
        const response = await fetch(`${HostName}/api/drivers/summaries/${driverId}`);
        const data = await response.json();
        if (response.ok) {
            return {ok: true, data};
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
            return {ok: false, data};
        }
    } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Error', 'Network error');
        return {ok: false, error};
    }
}

export const getTripDetails = async (driverId: string, date: string) => {
    try {
        const response = await fetch(`${HostName}/api/drivers/details/${driverId}/${date}`);
        const data = await response.json();
        if (response.ok) {
            return {ok: true, data};
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
            return {ok: false, data};
        }
    } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Error', 'Network error');
        return {ok: false, error};
    }
}

export const getPaymentDetails = async (driverId: string) => {
    try {
        const response = await fetch(`${HostName}/api/students/visualize-payments/${driverId}`);
        const data = await response.json();
        if (response.ok) {
            return {ok: true, data};
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
            return {ok: false, data};
        }
    } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Error', 'Network error');
        return {ok: false, error};
    }

}

export const notifyAllDuePayments = async (driverId: string) => {
    try {
        const response = await fetch(`${HostName}/api/students/send-due-payment-emails/${driverId}`);
        const data = await response.json();
        if (response.ok) {
            Alert.alert('Success', 'Notifications sent successfully');
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
        }
    } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Error', 'Network error');
    }
}

export const notifyDuePayments = async (driverId: string , studentId:string) => {
    try {
        const response = await fetch(`${HostName}/api/students/notify-specific-person/${driverId}/${studentId}`);
        const data = await response.json();
        if (response.ok) {
            Alert.alert('Success', 'Notifications sent successfully');
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
        }
    } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Error', 'Network error');
    }

}

export const updatePaymentStatus = async ( studentId: string, status: string) => {
    try {
        const response = await fetch(`${HostName}/api/students/update-payment-status/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            Alert.alert('Success', 'Payment status updated successfully');
        } else {
            Alert.alert('Error', data.message || 'Something went wrong');
        }
    } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Error', 'Network error');
    }

}