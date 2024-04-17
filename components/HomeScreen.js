import { View, Text, Image, Pressable, ScrollView, ToastAndroid } from 'react-native';
import React, { useCallback, useState } from 'react';
import data from "../db.json"
import AsyncStorage from '@react-native-async-storage/async-storage';
import CategoryScreen from './CategoryScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
    const [arrBrands, setBrands] = useState([]);
    const [arrWatch, setWatches] = useState(data);
    const [isClicked, setClick] = useState(false);

    const toggleFavorite = async (item) => {
        let newFavoArr = arrWatch;
        for (let i = 0; i < newFavoArr.length; i++) {
            if (newFavoArr[i].id === item.id) {
                newFavoArr[i].isFavo = !newFavoArr[i].isFavo
            }
        }
        setWatches(newFavoArr);
        await storeData(newFavoArr);
        setClick(!isClicked);
    };

    const storeData = async (value) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem('my-key', jsonValue);
        } catch (e) {
            // saving error
            console.log("Saving err: ", e);
        }
    };

    const getData = async () => {
        try {
            let myFavoArr = []
            const value = await AsyncStorage.getItem('my-key');
            if (value !== null) {
                // value previously stored
                myFavoArr = JSON.parse(value);
            }
            let watchArr = arrWatch.map(watch => ({
                ...watch,
                isFavo: false
            }));
            let myNewFavoArr = [];
            if (myFavoArr.length != 0) {
                for (let i = 0; i < myFavoArr.length; i++) {
                    myNewFavoArr = handleFavo(watchArr, myFavoArr[i]);
                }
            } else {
                myNewFavoArr = handleFavo(watchArr, -1);
            }
            setWatches(myNewFavoArr);
        } catch (e) {
            // error reading value
            console.log("Reading err: ", e);
        }
    };

    const handleFavo = (arrWatches, favoItem) => {
        for (let i = 0; i < arrWatches.length; i++) {
            if (arrWatches[i].id === favoItem.id && favoItem.isFavo) {
                arrWatches[i].isFavo = true
            }
        }
        return arrWatches
    };

    const showToast = (isFavo) => {
        const message = isFavo ? "Added to favorites" : "Removed from favorites";
        ToastAndroid.show(message, ToastAndroid.CENTER);
    };

    const renderItem = ({ item }) => (
        <View style={{ marginBottom: 20, borderBottomWidth: 1, paddingBottom: 20, flexDirection: "row" }}>
            <Pressable
                onPress={
                    () => {
                        navigation.navigate('Detail', { watch: item })
                    }
                }
                style={{ flex: 1, flexDirection: "row" }}
            >
                <Image
                    source={{ uri: item.image }}
                    style={{
                        width: 100, height: 100, borderWidth: 1,
                        borderColor: "white",
                        borderRadius: 10,
                        resizeMode: 'contain',
                        backgroundColor: "white",
                    }} />
                <View style={{ flex: 1, marginLeft: 5 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.watchName}</Text>
                    <Text style={{ fontSize: 16 }}>Brand: {item.brandName}</Text>
                    <Text style={{ fontSize: 16 }}>Price: ${item.price}</Text>
                </View>
            </Pressable>
            <Pressable
                onPress={() => { toggleFavorite(item); showToast(item.isFavo); }}
            >
                <MaterialIcons name={item.isFavo ? "favorite" : "favorite-outline"} size={30} color={"red"} />
            </Pressable>
        </View>
    );

    const handleGetBrand = async (data) => {
        const value = await AsyncStorage.getItem('brandsChoose');
        if (value !== null) {
            // value previously stored
            return JSON.parse(value);
        } else {
            const brandNameSet = new Set(data.map(watch => watch.brandName));
            // Convert the Set back into an array of objects
            const uniqueBrandNames = [...brandNameSet].map(brandName => ({ brandName: brandName, isChoosed: false }));
            return uniqueBrandNames;
        }
    }

    useFocusEffect(
        useCallback(() => {
            getData();
            const handleBrand = async () => {
                const arr = await handleGetBrand(data);
                setBrands(arr);
            }
            handleBrand();
        }, [isClicked])
    )

    return (
        <ScrollView style={{ backgroundColor: "white" }}>
            {/* Category */}
            <View style={{
                backgroundColor: "#E0FFFF",
                flex: 0.4,
                padding: 10,
                margin: 15,
                borderWidth: 1,
                borderColor: "white",
                borderRadius: 30,
            }}>
                <View style={{ paddingLeft: 5 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 20 }}>Category</Text>
                </View>
                <View style={{
                    flex: 0.3,
                    flexDirection: "row",
                    alignItems: 'center',
                    flexWrap: "wrap",
                    flexGrow: 3,
                }}>
                    {
                        arrBrands.map((brand, index) => (
                            <React.Fragment key={index}>
                                <CategoryScreen
                                    index={index}
                                    brand={brand.brandName}
                                    setBrands={setBrands}
                                    isChoosed={brand.isChoosed}
                                />
                            </React.Fragment>
                        ))
                    }
                </View>
            </View>
            {/* Array of watches */}
            <View style={{ flex: 1, padding: 20 }}>
                {
                    arrWatch.map((item, index) => {
                        let arrChoosed = []
                        for (let i = 0; i < arrBrands.length; i++) {
                            if (arrBrands[i].isChoosed) {
                                arrChoosed.push(arrBrands[i])
                            }
                        }
                        if (arrChoosed.length == 0) {
                            return (
                                <React.Fragment key={index}>
                                    {renderItem({ item })}
                                </React.Fragment>
                            )
                        } else {
                            for (let i = 0; i < arrChoosed.length; i++) {
                                if (arrChoosed[i].brandName === item.brandName) {
                                    return (
                                        <React.Fragment key={index}>
                                            {renderItem({ item })}
                                        </React.Fragment>
                                    )
                                }
                            }
                        }
                    })
                }
            </View>
        </ScrollView>
    )
}

export default HomeScreen