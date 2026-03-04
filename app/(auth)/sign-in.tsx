import {View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, Image} from 'react-native'
import React, {useState, useRef} from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import {icons} from '@/constants'
import {Link} from 'expo-router'
import {signIn} from "@/api/api"

const SignIn = () => {
    const [form, setForm] = useState({email: "", password: ""});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const passwordRef = useRef<any>(null);

    async function handleSignIn() {
        if (!form.email || !form.password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            await signIn(form.email, form.password);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#242b4d]">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{flexGrow: 1}}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Branding header */}
                    <View className="items-center pt-12 pb-8 px-6">
                        <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4">
                            <Image source={icons.school} className="w-9 h-9" tintColor="white" resizeMode="contain" />
                        </View>
                        <Text className="text-3xl text-white font-JakartaExtraBold">EduRide</Text>
                        <Text className="text-white/60 font-JakartaMedium mt-1 text-sm">Driver Portal</Text>
                    </View>

                    {/* Form card */}
                    <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10">
                        <Text className="text-2xl font-JakartaExtraBold text-gray-900">Welcome back</Text>
                        <Text className="text-gray-400 font-JakartaMedium mt-1 mb-6 text-sm">
                            Sign in to continue to your dashboard
                        </Text>

                        <InputField
                            label="Email Address"
                            placeholder="Enter your email"
                            icon={icons.email}
                            value={form.email}
                            onChangeText={(value) => setForm({...form, email: value})}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                        />
                        <InputField
                            ref={passwordRef}
                            label="Password"
                            placeholder="Enter your password"
                            icon={icons.lock}
                            rightIcon={icons.eyecross}
                            onRightIconPress={() => setShowPassword(p => !p)}
                            value={form.password}
                            secureTextEntry={!showPassword}
                            onChangeText={(value) => setForm({...form, password: value})}
                            returnKeyType="done"
                            onSubmitEditing={handleSignIn}
                        />

                        <CustomButton
                            title="Sign In"
                            className="w-full mt-6"
                            onPress={handleSignIn}
                            loading={loading}
                        />

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-gray-400 font-JakartaMedium text-sm">Don't have an account? </Text>
                            <Link href="/sign-up">
                                <Text className="text-[#242b4d] font-JakartaBold text-sm">Sign Up</Text>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignIn;
