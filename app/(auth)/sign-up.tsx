import {View, Text, ScrollView, TextInput, Image, Alert} from 'react-native'
import React, {useState} from 'react'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton';
import {icons} from '@/constants';
import {Link} from 'expo-router';
import OAuth from "@/components/OAuth";
import {addUser} from "@/api/api";


const SignUp = () => {


    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "driver"
    });

    async function handleSignUp() {

        if (!form.name || !form.email || !form.password) {
            Alert.alert("Error", "Please fill all the fields");
            return;
        }

        try {
            const response = await addUser(
                form.name,
                form.email,
                form.password,
                "",
                form.role
            );
        } catch (error) {
            console.error(error);
        }
    }

    function handleGoogleSignIn() {
    }

    return (
        <ScrollView className="flex-1 bg-white ">
            <View className="flex justify-center bg-white mx-4 h-full">
                <Text className="text-4xl text-blue-500  font-JakartaExtraBold">Create an account</Text>
                <View className="py-5 px-2 flex justify-center">
                    <InputField
                        label="Name"
                        placeholder="Enter your name"
                        icon={icons.person}
                        value={form.name}
                        onChangeText={(value) => setForm({...form, name: value})}
                    />
                    <InputField
                        label="Email Address"
                        placeholder="Enter your Email"
                        icon={icons.email}
                        value={form.email}
                        onChangeText={(value) => setForm({...form, email: value})}
                    />
                    <InputField
                        label="Password"
                        placeholder="Enter your password"
                        icon={icons.lock}
                        value={form.password}
                        secureTextEntry={true}
                        onChangeText={(value) => setForm({...form, password: value})}
                    />
                    <CustomButton title="Sign Up" onPress={handleSignUp} className='py-4 mt-8'/>
                </View>
            </View>
            <OAuth/>
            <Link href="/sign-in" className="text-lg text-center text-general-200 mt-10">
                <Text>Already have an account ?{" "}</Text>
                <Text className="text-primary-500">Log In</Text>
            </Link>
        </ScrollView>
    )
}

export default SignUp