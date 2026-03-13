import {View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, Image} from 'react-native'
import React, {useState, useRef} from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton';
import {icons} from '@/constants';
import {Link} from 'expo-router';
import {addUser} from "@/api/api";

const SignUp = () => {
    const [form, setForm] = useState({name: "", email: "", password: "", role: "driver"});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const emailRef = useRef<any>(null);
    const passwordRef = useRef<any>(null);

    async function handleSignUp() {
        if (!form.name || !form.email || !form.password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            await addUser(form.name, form.email, form.password, "", form.role);
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
                    <View className="items-center pt-10 pb-6 px-6">
                        <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4">
                            <Image source={icons.school} className="w-9 h-9" tintColor="white" resizeMode="contain" />
                        </View>
                        <Text className="text-3xl text-white font-JakartaExtraBold">EduRide</Text>
                        <Text className="text-white/60 font-JakartaMedium mt-1 text-sm">Driver Portal</Text>
                    </View>

                    {/* Form card */}
                    <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10">
                        <Text className="text-2xl font-JakartaExtraBold text-gray-900">Create account</Text>
                        <Text className="text-gray-400 font-JakartaMedium mt-1 mb-6 text-sm">
                            Join EduRide as a driver today's
                        </Text>

                        <InputField
                            label="Full Name"
                            placeholder="Enter your name"
                            icon={icons.person}
                            value={form.name}
                            onChangeText={(value) => setForm({...form, name: value})}
                            autoCorrect={false}
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current?.focus()}
                        />
                        <InputField
                            ref={emailRef}
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
                            placeholder="Create a password"
                            icon={icons.lock}
                            rightIcon={icons.eyecross}
                            onRightIconPress={() => setShowPassword(p => !p)}
                            value={form.password}
                            secureTextEntry={!showPassword}
                            onChangeText={(value) => setForm({...form, password: value})}
                            returnKeyType="done"
                            onSubmitEditing={handleSignUp}
                        />

                        <CustomButton
                            title="Create Account"
                            className="w-full mt-6"
                            onPress={handleSignUp}
                            loading={loading}
                        />

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-gray-400 font-JakartaMedium text-sm">Already have an account? </Text>
                            <Link href="/sign-in">
                                <Text className="text-[#242b4d] font-JakartaBold text-sm">Sign In</Text>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;