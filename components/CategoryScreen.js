import { View, Text, Pressable } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategoryScreen = ({ brand, isChoosed, index, setBrands }) => {
    const handleSelectBrand = async (index) => {
        let updatedUniqueBrandNames = [];
        setBrands(prev => {
            // Deselect all items
            updatedUniqueBrandNames = prev.map((brand, idx) => ({
                ...brand,
                isChoosed: idx === index ? !brand.isChoosed : false
            }));
            return updatedUniqueBrandNames;
        });
        const jsonValue = JSON.stringify(updatedUniqueBrandNames);
        await AsyncStorage.setItem('brandsChoose', jsonValue);
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