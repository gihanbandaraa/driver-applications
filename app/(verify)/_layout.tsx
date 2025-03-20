import { Stack } from 'expo-router';
import { UploadProvider } from '@/context/UploadContext';

const Layout = () => {
    return (
        <UploadProvider>
            <Stack>
                <Stack.Screen name="verifying-home" options={{ headerShown: false }} />
                <Stack.Screen name="upload-nic" options={{ headerShown: false }} />
                <Stack.Screen name="upload-license" options={{ headerShown: false }} />
                <Stack.Screen name="upload-selfie" options={{ headerShown: false }} />
                <Stack.Screen name="gather-information" options={{ headerShown: false }} />
            </Stack>
        </UploadProvider>
    );
};
export default Layout;
