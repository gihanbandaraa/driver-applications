import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG = [
    { name: "home",       icon: "home-outline" as IconName,     iconActive: "home" as IconName,     label: "Home"    },
    { name: "attendance", icon: "calendar-outline" as IconName, iconActive: "calendar" as IconName, label: "Today"   },
    { name: "students",   icon: "people-outline" as IconName,   iconActive: "people" as IconName,   label: "Kids"    },
    { name: "trips",      icon: "map-outline" as IconName,      iconActive: "map" as IconName,      label: "Trips"   },
    { name: "profile",    icon: "person-outline" as IconName,   iconActive: "person" as IconName,   label: "Me"      },
];

function CustomTabBar({ state, navigation }: any) {
    const insets = useSafeAreaInsets();

    return (
        <View style={{
            paddingHorizontal: 12,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
            backgroundColor: "#f8fafc",
        }}>
            <View style={{
                flexDirection: "row",
                backgroundColor: "#ffffff",
                borderRadius: 24,
                paddingVertical: 8,
                paddingHorizontal: 4,
                elevation: 16,
                shadowColor: "#1e293b",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
            }}>
                {TAB_CONFIG.map((tab, index) => {
                    const focused = state.index === index;
                    return (
                        <TouchableOpacity
                            key={tab.name}
                            onPress={() => navigation.navigate(tab.name)}
                            activeOpacity={0.8}
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                                paddingVertical: 4,
                            }}
                        >
                            <View style={{
                                width: 44,
                                height: 32,
                                borderRadius: 14,
                                backgroundColor: focused ? "#eef0f9" : "transparent",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <Ionicons
                                    name={focused ? tab.iconActive : tab.icon}
                                    size={20}
                                    color={focused ? "#242b4d" : "#b0bec5"}
                                />
                            </View>
                            <Text style={{
                                fontSize: 10,
                                lineHeight: 12,
                                color: focused ? "#242b4d" : "#b0bec5",
                                fontFamily: focused ? "Jakarta-SemiBold" : "Jakarta-Regular",
                            }}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function Layout() {
    return (
        <Tabs
            initialRouteName="home"
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="attendance" />
            <Tabs.Screen name="students" />
            <Tabs.Screen name="trips" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}
