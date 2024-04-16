import { View, Text, DrawerLayoutAndroid, Button, StyleSheet, Pressable } from 'react-native'
import React, { useRef, useState } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Entypo, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { Header, getHeaderTitle } from '@react-navigation/elements';
import HomeScreen from './components/HomeScreen';
import FavoriteListScreen from './components/FavoriteListScreen';
import WatchDetail from './components/WatchDetail';
import { navigationRef } from './components/RootNavigation';

export default function App() {
  const drawer = useRef(null);

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

  const navigationView = () => (
    <View style={[styles.container, styles.navigationContainer]}>
      <Pressable style={styles.closeMenu} onPress={() => drawer.current.closeDrawer()}>
        <AntDesign name="close" size={24} color="black" />
      </Pressable>
      <Pressable
        style={styles.menuItem}
        onPress={
          () => {
            drawer.current.closeDrawer();
            navigationRef?.current?.navigate("Main", { screen: 'Home' });
          }
        }
      >
        <Entypo style={{ flex: 0.15 }} name="home" size={30} color={"black"} />
        <Text style={{ flex: 0.35 }}>Home</Text>
      </Pressable>
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <View style={{ borderBottomWidth: 1.5, borderColor: "black", flex: 0.01, width: 200 }} />
      </View>
      <Pressable
        style={styles.menuItem}
        onPress={
          () => {
            drawer.current.closeDrawer();
            navigationRef?.current?.navigate("Main", { screen: 'Favorite' });
          }
        }
      >
        <MaterialIcons style={{ flex: 0.15 }} name="favorite" size={30} color={"black"} />
        <Text style={{ flex: 0.35 }}>My Favorite</Text>
      </Pressable>
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <View style={{ borderBottomWidth: 1.5, borderColor: "black", flex: 0.01, width: 200 }} />
      </View>
    </View>
  );

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={300}
      drawerPosition={"left"}
      renderNavigationView={navigationView}
    >
      <NavigationContainer ref={navigationRef}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  closeMenu: {
    flex: 0.05,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 10,
    marginTop: 5,
  },
  navigationContainer: {
    backgroundColor: '#ecf0f1',
  },
  menuItem: {
    flex: 0.08,
    flexDirection: "row",
    textAlign: 'center',
    textAlignVertical: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
