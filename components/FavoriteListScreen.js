import { View, Text, Pressable, Image, FlatList, ToastAndroid } from 'react-native';
import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, EvilIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ConfirmModal from './ConfirmModal';

const FavoriteListScreen = ({ navigation }) => {
    const [favoriteList, setFavoriteList] = useState([]);
    const [isClicked, setClick] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const toggleFavorite = async (item) => {
        let newFavoArr = favoriteList;
        for (let i = 0; i < newFavoArr.length; i++) {
            if (newFavoArr[i].id === item.id) {
                newFavoArr[i].isFavo = !newFavoArr[i].isFavo
            }
        }
        setFavoriteList(newFavoArr);
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

    const handleConfirm = () => {
        setConfirmVisible(!confirmVisible)
    }

    const removeValue = async () => {
        try {
            await AsyncStorage.removeItem('my-key');
            setClick(!isClicked);
            ToastAndroid.show("Remove all watches success!", ToastAndroid.CENTER);
        } catch (e) {
            // remove error
            console.log("Remove err", e);
        }
        handleConfirm();
        console.log('Done.')
    }

    const getData = async () => {
        try {
            let myFavoArr = []
            const value = await AsyncStorage.getItem('my-key');
            if (value !== null) {
                // value previously stored
                myFavoArr = JSON.parse(value);
            }
            setFavoriteList(myFavoArr);
        } catch (e) {
            // error reading value
            console.log("Reading err: ", e);
        }
    };

    const showToast = (isFavo) => {
        const message = isFavo ? "Added to favorites" : "Removed from favorites";
        ToastAndroid.show(message, ToastAndroid.CENTER);
    };

    const renderItem = ({ item }) => (
        <>
            {
                item.isFavo &&
                <View style={{ marginBottom: 20, borderBottomWidth: 1, paddingBottom: 20, flexDirection: "row" }}>
                    <Pressable
                        onPress={() => navigation.navigate('Detail', { watch: item })}
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
            }
        </>
    );

    const isAnyFavo = () => {
        return favoriteList.filter(watch => watch.isFavo);
    }

    useFocusEffect(
        useCallback(() => {
            getData();
        }, [isClicked])
    )

    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
            {
                isAnyFavo().length === 0
                    ?
                    <Text>You don't have any favorite watch</Text> :
                    <>
                        <Pressable
                            onPress={() => { handleConfirm() }}
                            style={{ flexDirection: "row", marginBottom: 10, justifyContent: "flex-end" }}
                        >
                            <Text style={{ fontSize: 20, textAlignVertical: "center", textAlign: "center", marginRight: 5 }}>Remove all?</Text>
                            <View style={{ borderRadius: 30, backgroundColor: "#00FFFF", width: 35, height: 35, alignItems: "center", justifyContent: "center" }}>
                                <EvilIcons name="trash" size={30} color={"black"} />
                            </View>
                        </Pressable>
                        <FlatList
                            data={favoriteList}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                        />
                        <ConfirmModal visible={confirmVisible} onClose={() => setConfirmVisible(false)} onConfirm={removeValue} />
                    </>
            }
        </View>
    )
}

export default FavoriteListScreen