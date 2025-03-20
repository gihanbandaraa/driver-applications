import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the context type
interface UploadContextType {
    nationalID: string | null;
    drivingLicense: string | null;
    selfie: string | null;
    setNationalID: (image: string | null) => void;
    setDrivingLicense: (image: string | null) => void;
    setSelfie: (image: string | null) => void;
}

// Create the context
const UploadContext = createContext<UploadContextType | undefined>(undefined);

// Provider component
export const UploadProvider = ({ children }: { children: ReactNode }) => {
    const [nationalID, setNationalID] = useState<string | null>(null);
    const [drivingLicense, setDrivingLicense] = useState<string | null>(null);
    const [selfie, setSelfie] = useState<string | null>(null);

    return (
        <UploadContext.Provider value={{ nationalID, setNationalID, drivingLicense, setDrivingLicense, selfie, setSelfie }}>
            {children}
        </UploadContext.Provider>
    );
};

// Hook to use the context
export const useUpload = (): UploadContextType => {
    const context = useContext(UploadContext);

    if (!context) {
        throw new Error('useUpload must be used within an UploadProvider');
    }

    return context;
};
