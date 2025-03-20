import {icons} from "@/constants";
import {Tabs} from "expo-router"
import {Image, ImageSourcePropType, View, Animated} from "react-native";
import React, {useRef, useEffect} from 'react';

const TabIcon = ({focused, source}: { source: ImageSourcePropType, focused: Boolean }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (focused) {
            Animated.spring(scaleValue, {
                toValue: 1.2,
                useNativeDriver: true,
                friction: 5
            }).start();
        } else {
            Animated.spring(scaleValue, {
                toValue: 1,
                useNativeDriver: true,
                friction: 5
            }).start();
        }
    }, [focused]);

    return (
        <Animated.View
            style={{
                transform: [{scale: scaleValue}]
            }}
        >
            <View className={`w-12 h-12 items-center justify-center 
                    ${focused ? "bg-primary-900" : "bg-gray-200"}`}
                  style={{
                      borderRadius: 25,
                  }}
            >
                <Image
                    source={source}
                    tintColor={focused ? "white" : "#666"}
                    resizeMode="contain"
                    className="w-6 h-6"
                />

            </View>
        </Animated.View>
    )
}

const Layout = () => (
    <Tabs
        initialRouteName="home"
        screenOptions={{
            tabBarActiveTintColor: "#242b4d",
            tabBarInactiveTintColor: "#666",
            tabBarShowLabel: false,
            tabBarStyle: {
                backgroundColor: "#ffffff",
                borderRadius: 30,
                paddingBottom: 30,
                height: 80,
                marginBottom: 25,
                position: "absolute",
                marginHorizontal: 20,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
            },

            tabBarLabelStyle: {
                fontSize: 12,
                marginTop: 5,
                fontWeight: '500',
            }
        }}>

        <Tabs.Screen name="home" options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({focused}) => <TabIcon focused={focused} source={icons.home}/>
        }}/>
        <Tabs.Screen name="trips" options={{
            title: 'Trips',
            headerShown: false,
            tabBarIcon: ({focused}) => <TabIcon focused={focused} source={icons.trips}/>
        }}/>
        <Tabs.Screen name="profile" options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({focused}) => <TabIcon focused={focused} source={icons.profile}/>
        }}/>
    </Tabs>
)

export default Layout;