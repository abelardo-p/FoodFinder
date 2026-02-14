import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ 
            headerShown: false,
            tabBarActiveTintColor: 'black',
            tabBarActiveBackgroundColor: 'light grey'
        }}>
        <Tabs.Screen
            name="index"
            options={{
            title: 'Home',
            }}
        />
        <Tabs.Screen        
            name="pantry"
            options={{
            title: 'Pantry',
            }}
        />
        <Tabs.Screen        
            name="settings"
            options={{
            title: 'Settings',
            }}
        />
        </Tabs>
    );
}