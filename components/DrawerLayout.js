import { View, Text, DrawerLayoutAndroid, Button, StyleSheet, Pressable } from 'react-native'
import React, { useRef, useState } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { Header, getHeaderTitle } from '@react-navigation/elements';
import FavoriteListScreen from './FavoriteListScreen';
import HomeScreen from './HomeScreen';
import WatchDetail from './WatchDetail';

const DrawerLayout = () => {
    const drawer = useRef(null);
    const [drawerPosition, setDrawerPosition] = useState('left');
    const changeDrawerPosition = () => {
        if (drawerPosition === 'left') {
            setDrawerPosition('right');
        } else {
            setDrawerPosition('left');
        }
    };
    const navigationView = () => (
        <View style={[styles.container, styles.navigationContainer]}>
            <Text style={styles.paragraph}>I'm in the Drawer!</Text>
            <Button
                title="Close drawer"
                onPress={() => drawer.current.closeDrawer()}
            />
        </View>
    );

    const Stack = createNativeStackNavigator();
    const Tab = createBottomTabNavigator();

    const MainTabNavigator = () => (
        <Tab.Navigator
            screenOptions={{
                headerTintColor: 'black',
                headerStyle: { backgroundColor: '#00FFFF' },
                headerTitleStyle: { fontSize: 30 },
                headerTitleAlign: 'center',
                tabBarStyle: { backgroundColor: '#00FFFF' },
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: '#C0C0C0',
                tabBarLabelStyle: { fontSize: 15 },
                tabBarHideOnKeyboard: true,
                // headerShown: false
            }}

        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Entypo name="home" size={30} color={color} />
                    ),
                    headerTitle: 'Home',
                }}

            />
            <Tab.Screen
                name="Favorite"
                component={FavoriteListScreen}
                options={{
                    tabBarLabel: 'My Favorite',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="favorite" size={30} color={color} />
                    ),
                    tabBarV: false,
                    headerTitle: 'My Favorite',
                }}
            />
        </Tab.Navigator>
    );

    return (
        <DrawerLayoutAndroid
            ref={drawer}
            drawerWidth={300}
            drawerPosition={drawerPosition}
            renderNavigationView={navigationView}
        >
            <NavigationContainer >
                <Stack.Navigator
                    screenOptions={{
                        headerTintColor: 'black',
                        headerStyle: { backgroundColor: '#00FFFF' },
                        headerTitleStyle: { fontSize: 30 },
                        headerTitleAlign: 'center',
                        header: ({ options, route }) => (
                            <Header {...options} title={getHeaderTitle(options, route.name)} />
                        ),
                    }}

                >
                    <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerTitle: "Home", headerShown: false }} />
                    <Stack.Screen name="Detail" component={WatchDetail} options={{
                        headerLeft: (props) => (
                            <Pressable
                                {...props}
                                onPress={
                                    () => {
                                        drawer.current.openDrawer()
                                    }
                                }
                            >
                                <View style={{ marginLeft: 5 }}>
                                    <Entypo name="menu" size={30} color={"black"} />
                                </View>
                            </Pressable>
                        ),
                    }} />
                </Stack.Navigator>
            </NavigationContainer>
        </DrawerLayoutAndroid>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'green',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navigationContainer: {
        backgroundColor: '#ecf0f1',
    },
    paragraph: {
        padding: 16,
        fontSize: 15,
        textAlign: 'center',
    },
});

export default DrawerLayout