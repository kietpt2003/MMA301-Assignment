import { View, Text, Pressable } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dataDB from "../db.json";

const CategoryScreen = ({ brand, setWatches, isChoosed, index, setBrands }) => {
    // Function to handle filter
    const handleFilter = async (brand) => {
        const data = await getData();
        const updatedWatches = data.filter(watch => watch.brandName === brand);
        setWatches(updatedWatches);
    };

    const getData = async () => {
        const value = await AsyncStorage.getItem('my-key');
        if (value !== null && JSON.parse(value).length !== 0) {
            // value previously stored
            return JSON.parse(value);
        }
        const watchArr = dataDB.map(watch => ({
            ...watch,
            isFavo: false
        }));
        return watchArr
    };

    const handleSelectBrand = async (index) => {
        setBrands(prev => {
            // Deselect all items
            const updatedUniqueBrandNames = prev.map((brand, idx) => ({
                ...brand,
                isChoosed: idx === index ? !brand.isChoosed : false
            }));
            return updatedUniqueBrandNames;
        });
        if (!isChoosed) {
            handleFilter(brand);
        } else {
            const data = await getData();
            console.log("huhu");
            setWatches(data);
        }
    };

    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isChoosed ? "#00FFFF" : undefined,
            borderRadius: 50,
            width: 80,
            height: 40,
            borderWidth: isChoosed ? 1 : 0,
            borderColor: "white",
            marginTop: 3
        }}
        >
            <Pressable
                onPress={
                    () => {
                        handleSelectBrand(index);
                    }}
            >
                <Text style={{
                    textAlign: "center",
                    textAlignVertical: "center",
                }}>{brand}</Text>
            </Pressable>
        </View>
    )
}

export default CategoryScreen