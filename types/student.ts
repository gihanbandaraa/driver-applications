import { AttendanceStatus, RideStatus,Period } from './attendance';

export interface Student {
    id: number;
    full_name: string;
    grade: string;
    school: string;
    address: string;
    parent_name: string;
    phone: string;
    monthly_fee: string;
    pickupPoint: {
        address: string;
        latitude: number;
        longitude: number;
    };
    dropoffPoint: {
        address: string;
        latitude: number;
        longitude: number;
    };
    attendanceStatus?: AttendanceStatus;
    rideStatus?: RideStatus;
    period?: Period;
}